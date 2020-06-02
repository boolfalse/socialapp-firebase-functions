
require('dotenv').config();

const functions = require('firebase-functions');
const app = require('express')();
const firebaseAuth = require('./util/firebaseAuth');

const {
    getScreams,
    createScream,
} = require('./handlers/scream');
const {
    signUp,
    login,
    getUsers,
    getUserByUserId,
} = require('./handlers/user');



// Scream Routes
app.get('/screams', getScreams);
app.post('/screams', firebaseAuth, createScream);

// User Routes
app.post('/sign-up', signUp);
app.post('/login', login);
app.get('/users', getUsers);
app.get('/users/:userId', firebaseAuth, getUserByUserId);



exports.api = functions.region('asia-east2').https.onRequest(app);
