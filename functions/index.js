
const env = require('dotenv').config();
const functions = require('firebase-functions');
const serviceAccount = require('./../firebase.json');
const admin = require('firebase-admin'); // admin SDK for firebase database
const express = require('express');
const app = express();

// generate config file from here
// Firebase Console > Settings > Project Settings > Service Accounts
// https://console.firebase.google.com/project/<FIREBASE_PROJECT_ID>/settings/serviceaccounts/adminsdk
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`
});

// {{FB_FS_DB}}/getScreams
app.get('/screams', (req, res) => {
    admin.firestore()
        .collection('screams')
        .get()
        .then(snapshotData => {
            let screams = [];
            snapshotData.forEach(doc => {
                screams.push(doc.data());
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
        createdAt: admin.firestore.Timestamp.fromDate(new Date())
    };
    admin.firestore()
        .collection('screams')
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

exports.api = functions.https.onRequest(app);
