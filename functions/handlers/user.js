'use strict';

const { db } = require('./../util/admin');
const firebase = require('firebase');
const firebaseConfig = require('./../config/firebase');
firebase.initializeApp(firebaseConfig);
// firebase.analytics();
const validate = require('./../util/validate');

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
                    const userData = {
                        email: user.email,
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
};
