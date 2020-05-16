
const functions = require('firebase-functions');
const admin = require('firebase-admin'); // admin SDK for firebase database

// already knows about the project (it means the database) from .firebaserc file,
// so we don't need to pass an argument in the initializeApp function
admin.initializeApp();

// Firebase Firestore Cloud Database URL for local (firebase serve)
// http://localhost:5000/socialapp-3aeeb/us-central1/createScream
// Firebase Firestore Cloud Database URL for production (firebase deploy)
// https://us-central1-socialapp-3aeeb.cloudfunctions.net/helloWorld
exports.helloWorld = functions.https.onRequest((req, res) => {
    res.send("Hello World!");
});

// {{FB_FS_DB}}/getScreams
exports.getScreams = functions.https.onRequest((req, res) => {
    // https://firebase.google.com/docs/firestore/query-data/get-data#get_all_documents_in_a_collection
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

// {{FB_FS_DB}}/createScream
exports.createScream = functions.https.onRequest((req, res) => {
    const scream = {
        userHandle: req.body.userHandle,
        body: req.body.body,
        createdAt: admin.firestore.Timestamp.fromDate(new Date())
    };
    // https://firebase.google.com/docs/firestore/manage-data/add-data#add_a_document
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
