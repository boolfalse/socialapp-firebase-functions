'use strict';

const admin = require('firebase-admin');
const serviceAccount = require('./../config/firebase-adminsdk-sa-pk');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`
});
const db = admin.firestore();

module.exports = { admin, db };
