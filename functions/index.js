
require('dotenv').config();

const functions = require('firebase-functions');
const app = require('express')();
const firebaseAuth = require('./util/firebaseAuth');

const screamHandler = require('./handlers/scream');
const userHandler = require('./handlers/user');



// Scream Routes
app.get('/screams', screamHandler.getScreams);
app.post('/screams', firebaseAuth, screamHandler.createScream);

// User Routes
app.post('/sign-up', userHandler.signUp);
app.post('/login', userHandler.login);
app.get('/users', userHandler.getUsers);
app.get('/users/:userId', firebaseAuth, userHandler.getUserByUserId);
app.put('/users/avatar', firebaseAuth, userHandler.uploadAvatar);



exports.api = functions.region('asia-east2').https.onRequest(app);
