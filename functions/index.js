
require('dotenv').config();

const functions = require('firebase-functions');
const app = require('express')();
const firebaseAuth = require('./util/firebaseAuth');

const screamHandler = require('./handlers/scream');
const userHandler = require('./handlers/user');



// Scream Routes
app.get('/screams', screamHandler.getScreams);
app.post('/screams', firebaseAuth, screamHandler.createScream);
app.post('/screams/comment', firebaseAuth, screamHandler.commentOnScream);
app.get('/screams/:screamId', screamHandler.getScreamData);

// User Routes
app.post('/sign-up', userHandler.signUp);
app.post('/login', userHandler.login);
app.get('/users', userHandler.getUsers);
app.put('/users/avatar', firebaseAuth, userHandler.uploadAvatar);
app.post('/users/update-details', firebaseAuth, userHandler.updateDetails);
app.get('/users/get-auth-user-details', firebaseAuth, userHandler.getAuthUserDetails);
app.get('/users/:userId', firebaseAuth, userHandler.getUserByUserId);



exports.api = functions.region('asia-east2').https.onRequest(app);
