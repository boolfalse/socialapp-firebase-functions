'use strict';

const { db, admin } = require('./../util/admin');
const firebase = require('firebase');
const firebaseConfig = require('./../config/firebase');
firebase.initializeApp(firebaseConfig);
// firebase.analytics();
const validate = require('./../util/validate');
const generate = require('./../util/generate');
const Busboy = require('busboy');
const path = require('path');
const os = require('os');
const fs = require('fs');

module.exports = {
    signUp: (req, res) => {
        const validationResult = validate.signUpErrors(req.body);
        if (validationResult.error) {
            return res.status(400).json(validationResult.errorMessages);
        }
        const user = validationResult.filteredData;

        db.collection('users')
            .where('email', '==', user.email)
            .limit(1)
            .get()
            .then(querySnapshot => {
                const querySnapshotDocs = querySnapshot.docs;
                if (!querySnapshotDocs) {
                    return res.status(500).json({
                        error: `Something went wrong!`
                    });
                }
                else if (querySnapshotDocs.length > 0) {
                    // const user = querySnapshotDocs[0].data();
                    return res.status(409).json({
                        error: `Email already exists!`
                    });
                }
                else {
                    const noImage = 'no-image.png';
                    const avatarUrl = `https://firebasestorage.googleapis.com/v0/b/${firebaseConfig.storageBucket}/o/${noImage}?alt=media`;
                    const userData = {
                        email: user.email,
                        avatarUrl: avatarUrl,
                        createdAt: new Date().toISOString() // admin.firestore.Timestamp.fromDate(new Date())
                    };
                    firebase
                        .auth()
                        .createUserWithEmailAndPassword(user.email, user.password)
                        .then(data => {
                            userData.userId = data.user.uid;
                            db.collection('users')
                                .add(userData)
                                .then(doc => {
                                    return res.status(201).json({
                                        message: `User ${userData.userId} signed up successfully.`
                                    });
                                })
                                .catch(err => {
                                    return res.status(500).json({
                                        error: err
                                    });
                                });
                        })
                        .catch(err => {
                            return res.status(500).json({
                                error: err
                            });
                        });
                }
            })
            .catch(err => {
                return res.status(500).json({
                    error: err
                });
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
    getUsers: (req, res) => {
        db.collection('users')
            .orderBy('createdAt', 'DESC')
            .get()
            .then(snapshotData => {
                let users = [];
                snapshotData.forEach(doc => {
                    users.push({
                        userId: doc.id,
                        ...doc.data()
                    });
                });
                return res.json(users);
            })
            .catch(err => {
                return res.status(500).json({
                    error: err
                });
            });
    },
    getUserByUserId: (req, res) => {
        const userId = req.params.userId;
        const usersRef = db.collection('users');
        usersRef.where('userId', '==', userId)
            .get()
            .then(querySnapshot => {
                let users = [];
                querySnapshot.docs.map(snapshotDoc => {
                    users.push(snapshotDoc.data());
                });
                return res.json(users);
            })
            .catch(err => {
                return res.status(500).json({
                    error: err
                });
            });
    },
    uploadAvatar: (req, res) => {
        const busboy = new Busboy({ headers: req.headers });

        let uploadedAvatar = {};
        let uploadedFilename = '';
        let avatarUrl = '';

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
                // console.log('Finished file : ' + fieldname);
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
            }).then((data) => {
                avatarUrl = `https://firebasestorage.googleapis.com/v0/b/${firebaseConfig.storageBucket}/o/${uploadedFilename}?alt=media`;
                db.collection('users').where('userId', '==', req.user.uid)
                    .limit(1)
                    .get()
                    .then(function(querySnapshot) {
                        querySnapshot.forEach(function(userDoc) {
                            db.collection('users').doc(userDoc.id).update({ avatarUrl: avatarUrl });
                        });
                    }).catch(err => {
                        return res.status(500).json({
                            error: err.message
                        });
                    });
                return true;
            }).then((data) => {
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
};
