
const functions = require('firebase-functions');
const admin = require('firebase-admin'); // admin SDK for firebase database

// already knows about the project (it means the database) from .firebaserc file,
// so we don't need to pass an argument in the initializeApp function
admin.initializeApp();

// https://us-central1-socialapp-3aeeb.cloudfunctions.net/helloWorld
exports.helloWorld = functions.https.onRequest((request, response) => {
    response.send("Hello World!");
});

// https://us-central1-socialapp-3aeeb.cloudfunctions.net/getScreams
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
            console.log('Error getting documents', err);
        });
});
