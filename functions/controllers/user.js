'use strict';

const { db, admin } = require('./../utilities/admin');
const firebase = require('firebase');
const firebaseConfig = require('./../config/firebase');
firebase.initializeApp(firebaseConfig);
// firebase.analytics();
const validate = require('./../utilities/validate');
const generate = require('./../utilities/generate');
const Busboy = require('busboy');
const path = require('path');
const os = require('os');
const fs = require('fs');

module.exports = {
    signUp: async (req, res) => {
        const validationResult = validate.signUpErrors(req.body);
        if (validationResult.error) {
            return res.status(400).json(validationResult.errorMessages);
        }
        const user = validationResult.filteredData;

        const querySnapshotByEmail = await db.collection('users').where('email', '==', user.email).limit(1).get();
        const querySnapshotDocsByEmail = querySnapshotByEmail.docs;
        if (querySnapshotDocsByEmail.length > 0) {
            // const user = querySnapshotDocsByEmail[0].data();
            return res.status(409).json({
                error: true,
                message: "Email already exists!"
            });
        }

        const querySnapshotByUsername = await db.collection('users').where('username', '==', user.username).limit(1).get();
        const querySnapshotDocsByUsername = querySnapshotByUsername.docs;
        if (querySnapshotDocsByUsername.length > 0) {
            // const user = querySnapshotDocsByUsername[0].data();
            return res.status(409).json({
                error: true,
                message: "Username already exists!"
            });
        }

        const noImage = 'no-image.png';
        const avatarUrl = `https://firebasestorage.googleapis.com/v0/b/${firebaseConfig.storageBucket}/o/${noImage}?alt=media`;
        const userData = {
            email: user.email,
            username: user.username,
            avatarUrl: avatarUrl,
            createdAt: new Date().toISOString() // admin.firestore.Timestamp.fromDate(new Date())
        };
        await firebase.auth().createUserWithEmailAndPassword(user.email, user.password);
        await db.collection('users').add(userData);

        return res.status(201).json({
            error: false,
            message: "User signed up successfully."
        });
    },
    login: (req, res) => {
        const validationResult = validate.loginErrors(req.body);
        if (validationResult.error) {
            return res.status(400).json(validationResult.errorMessages);
        }
        const user = validationResult.filteredData;

        firebase
            .auth()
            .signInWithEmailAndPassword(user.email, user.password)
            .then(data => {
                return data.user.getIdToken()
            })
            .then(token => {
                return res.json({ token: token })
            })
            .catch(err => {
                if (
                    err.code === 'auth/wrong-password' ||
                    err.code === 'auth/user-not-found'
                ) {
                    return res.status(403).json({
                        general: "Wrong credentials"
                    });
                } else {
                    return res.status(500).json({
                        error: err
                    });
                }
            });
    },
    uploadAvatar: (req, res) => {
        const busboy = new Busboy({ headers: req.headers });

        let uploadedAvatar = {};
        let uploadedFilename = '';

        busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
            if (mimetype !== 'image/jpg' &&
                mimetype !== 'image/jpeg' &&
                mimetype !== 'image/png' &&
                mimetype !== 'image/bpm'
            ) {
                return res.status(400).json({
                    error: true,
                    message: "Wrong avatar type submitted!",
                });
            }

            const filenameParts = filename.split('.');
            const avatarExtension = filenameParts[filenameParts.length - 1];
            uploadedFilename = generate.avatarName() + '.' + avatarExtension;
            const filePath = path.join(os.tmpdir(), uploadedFilename);
            uploadedAvatar = { filePath, mimetype };
            file.pipe(fs.createWriteStream(filePath));

            file.on('end', () => {
                // console ('Finished file : ' + fieldname);
            });
        });
        busboy.on('finish', function() {
            admin.storage().bucket().upload(uploadedAvatar.filePath, {
                resumable: false,
                metadata: {
                    metadata: {
                        contentType: uploadedAvatar.mimetype
                    }
                },
            }).then(async (data) => {
                const avatarUrl = `https://firebasestorage.googleapis.com/v0/b/${firebaseConfig.storageBucket}/o/${uploadedFilename}?alt=media`;

                const userDocsSnapshot = (await db.collection('users').where('email', '==', req.user.email).get()).docs;
                if (userDocsSnapshot.length === 0) {
                    return res.status(500).json({
                        error: true,
                        message: "Something went wrong!"
                    });
                }
                const userDocId = userDocsSnapshot[0].id;

                await db.doc(`/users/${userDocId}`).update({ avatarUrl: avatarUrl });

                return res.json({
                    message: "Avatar successfully uploaded.",
                    avatarUrl: avatarUrl
                });
            }).catch(err => {
                return res.status(500).json({
                    error: err.message
                });
            });
        });
        busboy.end(req.rawBody);
        req.pipe(busboy);
    },
    updateDetails: async (req, res) => {
        const validationResult = validate.updateUserDetails(req.body);
        if (validationResult.error) {
            return res.status(400).json(validationResult.errorMessages);
        }
        const userDetails = validationResult.filteredData;

        const userDocsSnapshot = (await db.collection('users').where('email', '==', req.user.email).get()).docs;
        if (userDocsSnapshot.length === 0) {
            return res.status(500).json({
                error: true,
                message: "Something went wrong!"
            });
        }
        const userDocId = userDocsSnapshot[0].id;

        await db.doc(`/users/${userDocId}`).update(userDetails);

        return res.json({
            message: "User Details successfully updated.",
        });
    },
    getAuthUserDetails: async (req, res) => {
        // TODO: implement response as need
        const userData = {
            // credentials: {},
            // reactions: [],
        };

        const userDocsSnapshot = (await db.collection('users').where('email', '==', req.user.email).get()).docs;
        if (userDocsSnapshot.length === 0) {
            return res.status(500).json({
                error: true,
                message: "Something went wrong!"
            });
        }
        const userDocId = userDocsSnapshot[0].id;

        userData.credentials = {
            userId: userDocId,
            ...userDocsSnapshot[0].data()
        };

        const notificationsSnapshot = await db.collection('notifications')
            .where('recipientId', '==', userDocId)
            .orderBy('createdAt', 'DESC')
            .limit(10)
            .get();
        const notifications = [];
        notificationsSnapshot.forEach(notificationDoc => {
            notifications.push({
                notificationId: notificationDoc.id,
                recipientId: notificationDoc.data().recipientId,
                senderId: notificationDoc.data().senderId,
                createdAt: notificationDoc.data().createdAt,
                postId: notificationDoc.data().postId,
                type: notificationDoc.data().type,
                read: notificationDoc.data().read,
                value: notificationDoc.data().value,
            });
        });
        userData.notifications = notifications;

        userData.reactions = [];

        return res.status(201).json(userData);
    },
    getUserDetails: async (req, res) => {
        // TODO: validate

        const username = req.params.username;

        const userDocsSnapshot = (await db.collection('users').where('username', '==', username).limit(1).get()).docs;
        if (userDocsSnapshot.length === 0) {
            return res.status(404).json({
                error: true,
                message: "User not found!",
            });
        }
        const userDocSnapshot = userDocsSnapshot[0];
        const userDocId = userDocSnapshot.id;

        const userPostsSnapshot = await db.collection('posts')
            .where('userId', '==', userDocId)
            .orderBy('createdAt', 'DESC')
            .limit(10)
            .get();

        const userPostsDocs = userPostsSnapshot.docs;
        const userPosts = [];
        if (userPostsDocs.length > 0) {
            userPostsDocs.map(async userPostDoc => {
                userPosts.push({
                    postId: userPostDoc.id,
                    ...userPostDoc.data(),
                });
            });
        }

        return res.status(200).json({
            user: userDocSnapshot.data(),
            posts: userPosts,
        });
    },
};
