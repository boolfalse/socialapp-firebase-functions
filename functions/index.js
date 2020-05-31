
const env = require('dotenv').config();
const functions = require('firebase-functions');
const serviceAccount = require('./firebase-adminsdk-sa-pk.json');
const admin = require('firebase-admin');
const firebase = require('firebase');
const app = require('express')();
const validate = require('./validate');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`
});
const db = admin.firestore();

const firebaseConfig = {
    apiKey: process.env.FIREBASE_WEB_APP_API_KEY,
    authDomain: process.env.FIREBASE_WEB_APP_AUTH_DOMAIN,
    databaseURL: process.env.FIREBASE_WEB_APP_DATABASE_URL,
    projectId: process.env.FIREBASE_WEB_APP_PROJECT_ID,
    storageBucket: process.env.FIREBASE_WEB_APP_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_WEB_APP_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_WEB_APP_APP_ID,
    measurementId: process.env.FIREBASE_WEB_APP_MEASUREMENT_ID,
};
firebase.initializeApp(firebaseConfig);
// firebase.analytics();

/**
* For Postman add following test script to the login API-route,
* and use "ID_TOKEN" global variable for auth-protected routes.
* For example: "Bearer {{ID_TOKEN}}" as "Authorization" Header)
*
* var data = pm.response.json();
* if (data.token) {
*     pm.globals.set("ID_TOKEN", data.token);
* } else {
*     pm.globals.set("ID_TOKEN", '');
* }
*/
const firebaseAuth = (req, res, next)  => {
    let idToken;
    let headerAuth = req.headers.authorization;
    if (headerAuth) {
        if (headerAuth.startsWith('Bearer ')) {
            idToken = headerAuth.split('Bearer ')[1];
        } else {
            return res.status(403).json({
                error: "Unauthorized"
            });
        }
    } else {
        return res.status(403).json({
            error: "Unauthorized"
        });
    }

    admin.auth().verifyIdToken(idToken)
        .then(decodedToken => {
            req.user = decodedToken;
            return db.collection('users')
                .where('userId', '==', req.user.uid)
                .limit(1)
                .get();
        })
        .then(data => {
            // req.user.email = data.docs[0].data().email;
            return next();
        })
        .catch(err => {
            // console.error("Error while verifying token: ", err);
            return res.status(403).json(err);
        });
};



app.get('/screams', (req, res) => {
    db.collection('screams')
        .orderBy('createdAt', 'DESC')
        .get()
        .then(snapshotData => {
            let screams = [];
            snapshotData.forEach(doc => {
                screams.push({
                    screamId: doc.id,
                    ...doc.data()
                });
            });
            return res.json(screams);
        })
        .catch(err => {
            return res.status(500).json({
                error: err
            });
        });
});

app.post('/screams', firebaseAuth, (req, res) => {
    // console.log(req.user);
    const scream = {
        userHandle: req.body.userHandle,
        body: req.body.body,
        createdAt: new Date().toISOString() // admin.firestore.Timestamp.fromDate(new Date())
    };
    db.collection('screams')
        .add(scream)
        .then(doc => {
            return res.json({
                message: `Document ${doc.id} created successfully!`
            });
        })
        .catch(err => {
            return res.status(500).json({
                error: err
            });
        });
});

app.post('/sign-up', (req, res) => {
    const validationResult = validate.signUpErrors(req.body);
    if (validationResult.error) {
        return res.status(400).json(validationResult.errorMessages);
    }
    const user = validationResult.filteredData;

    const usersRef = db.collection('users');
    const query = usersRef
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
});

app.get('/users', (req, res) => {
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
});

app.get('/users/:userId', firebaseAuth, (req, res) => {
    const userId = req.params.userId;
    const usersRef = db.collection('users');
    const query = usersRef
        .where('userId', '==', userId)
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
});

app.post('/login', (req, res) => {
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
});



exports.api = functions.region('asia-east2').https.onRequest(app);
