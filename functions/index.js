
require('dotenv').config();

const functions = require('firebase-functions');
const app = require('express')();
const firebaseAuth = require('./util/firebaseAuth');
const notifications = require('./util/notifications');

const screamController = require('./controllers/scream');
const reactionController = require('./controllers/reaction');
const userController = require('./controllers/user');
const notificationController = require('./controllers/notification');



// Scream Routes
app.post('/screams', firebaseAuth, screamController.createScream);
app.post('/screams/comment', firebaseAuth, screamController.commentOnScream);
app.delete('/screams/:screamId', firebaseAuth, screamController.deleteScream);
app.get('/screams/:screamId', screamController.getScreamData);

// Reactions
app.get('/reactions/:screamId', reactionController.getScreamReactions);
app.post('/reactions', firebaseAuth, reactionController.reactionOnScream);

// Notifications
app.post('/notifications/read', firebaseAuth, notificationController.markAsRead);

// User Routes
app.post('/sign-up', userController.signUp);
app.post('/login', userController.login);
app.put('/users/avatar', firebaseAuth, userController.uploadAvatar);
app.post('/users/update-details', firebaseAuth, userController.updateDetails);
app.get('/users/get-auth-user-details', firebaseAuth, userController.getAuthUserDetails);
app.get('/users/get-user-details/:username', userController.getUserDetails);



module.exports.api = functions.region('asia-east2').https.onRequest(app);

module.exports.createNotificationForReaction = notifications.createNotificationForReaction;
module.exports.deleteNotificationForReaction = notifications.deleteNotificationForReaction;
module.exports.createNotificationForComment = notifications.createNotificationForComment;
module.exports.deleteNotificationForComment = notifications.deleteNotificationForComment;
