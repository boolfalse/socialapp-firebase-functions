
const env = require('dotenv').config();
const functions = require('firebase-functions');
const serviceAccount = require('./firebase-adminsdk-sa-pk.json');
const admin = require('firebase-admin'); // admin SDK for firebase database
const db = admin.firestore();
const app = require('express')();

// generate config file from here
// Firebase Console > Settings > Project Settings > Service Accounts
// https://console.firebase.google.com/project/<FIREBASE_PROJECT_ID>/settings/serviceaccounts/adminsdk
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`
});

const firebase = require('firebase');
const firebaseConfig = {
    apiKey: process.FIREBASE_WEB_APP_API_KEY,
    authDomain: process.FIREBASE_WEB_APP_AUTH_DOMAIN,
    databaseURL: process.FIREBASE_WEB_APP_DATABASE_URL,
    projectId: process.FIREBASE_WEB_APP_PROJECT_ID,
    storageBucket: process.FIREBASE_WEB_APP_STORAGE_BUCKET,
    messagingSenderId: process.FIREBASE_WEB_APP_MESSAGING_SENDER_ID,
    appId: process.FIREBASE_WEB_APP_APP_ID,
    measurementId: process.FIREBASE_WEB_APP_MEASUREMENT_ID,
};
firebase.initializeApp(firebaseConfig);
// firebase.analytics();

// {{FB_FS_DB}}/getScreams
app.get('/screams', (req, res) => {
    db.collection('screams')
        .orderBy('createdAt', 'DESC')
        .get()
        .then(snapshotData => {
            let screams = [];
            snapshotData.forEach(doc => {
                screams.push({
                    screamId: doc.id,
                    ...doc.data() // https://medium.com/@oprearocks/what-do-the-three-dots-mean-in-javascript-bc5749439c9a
                });
            });
            return res.json(screams);
        })
        .catch(err => {
            // console.log(err);
            return res.status(500).json({
                error: `Something went wrong`
            });
        });
});

app.post('/screams', (req, res) => {
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
            // console.log(err);
            return res.status(500).json({
                error: `Something went wrong`
            });
        });
});

app.post('/sign-up', (req, res) => {
    const user = {
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        handle: req.body.handle,
    };

    // TODO: validate request data

    firebase
        .auth()
        .createUserWithEmailAndPassword(user.email, user.password)
        .then(data => {
            return res.status(201).json({
                message: `User ${data.user.uid} signed up successfully.`
            });
        })
        .catch(err => {
            // console.error(err);
            return res.status(500).json({
                error: err.code
            });
        });
});

exports.api = functions.region('asia-east2').https.onRequest(app);
