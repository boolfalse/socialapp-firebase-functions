
require('dotenv').config();

const functions = require('firebase-functions');
const app = require('express')();
const firebaseAuth = require('./util/firebaseAuth');
const notifications = require('./util/notifications');

const screamHandler = require('./handlers/scream');
const reactionHandler = require('./handlers/reaction');
const userHandler = require('./handlers/user');
const notificationHandler = require('./handlers/notification');



// Scream Routes
app.get('/screams', screamHandler.getScreams);
app.post('/screams', firebaseAuth, screamHandler.createScream);
app.post('/screams/comment', firebaseAuth, screamHandler.commentOnScream);
app.delete('/screams/:screamId', firebaseAuth, screamHandler.deleteScream);
app.get('/screams/:screamId', screamHandler.getScreamData);

// Reactions
app.get('/reactions/:screamId', reactionHandler.getScreamReactions);
app.post('/reactions', firebaseAuth, reactionHandler.reactionOnScream);

// Notifications
app.post('/notifications/read', firebaseAuth, notificationHandler.markAsRead);

// User Routes
app.post('/sign-up', userHandler.signUp);
app.post('/login', userHandler.login);
app.get('/users', userHandler.getUsers);
app.put('/users/avatar', firebaseAuth, userHandler.uploadAvatar);
app.post('/users/update-details', firebaseAuth, userHandler.updateDetails);
app.get('/users/get-auth-user-details', firebaseAuth, userHandler.getAuthUserDetails);
app.get('/users/get-user-details/:userId', userHandler.getUserDetails);
app.get('/users/:userId', firebaseAuth, userHandler.getUserByUserId);



module.exports.api = functions.region('asia-east2').https.onRequest(app);

module.exports.createNotificationForReaction = notifications.createNotificationForReaction;
module.exports.deleteNotificationForReaction = notifications.deleteNotificationForReaction;
module.exports.createNotificationForComment = notifications.createNotificationForComment;
module.exports.deleteNotificationForComment = notifications.deleteNotificationForComment;
