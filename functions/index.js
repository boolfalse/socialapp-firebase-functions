
require('dotenv').config();

const functions = require('firebase-functions');
const app = require('express')();
const firebaseAuth = require('./util/firebaseAuth');
const notifications = require('./util/notifications');

const postController = require('./controllers/post');
const reactionController = require('./controllers/reaction');
const userController = require('./controllers/user');
const notificationController = require('./controllers/notification');



// Post Routes
app.post('/posts', firebaseAuth, postController.createPost);
app.post('/posts/comment', firebaseAuth, postController.commentOnPost);
app.delete('/posts/:postId', firebaseAuth, postController.deletePost);
app.get('/posts/:postId', postController.getPostData);

// Reactions
app.get('/reactions/:postId', reactionController.getPostReactions);
app.post('/reactions', firebaseAuth, reactionController.reactionOnPost);

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
