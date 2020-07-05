'use strict';

const functions = require('firebase-functions');
const { db } = require('./admin');



module.exports = {
    createNotificationForReaction: functions.region('asia-east2').firestore.document('reactions/{id}')
        .onCreate(async eventSnapshot => {
            const postDoc = await db.doc(`/posts/${eventSnapshot.data().postId}`).get();

            // TODO: check if doc exists (cause the post can be removed after notification)

            const notificationData = {
                type: 'reaction',
                createdAt: new Date(),
                read: false,
                senderId: eventSnapshot.data().userId,
                recipientId: postDoc.data().userId,
                postId: postDoc.id,
                value: eventSnapshot.data().reaction, // eg. 1 (like) OR 2 (dislike)
            };
            await db.doc(`/notifications/${eventSnapshot.id}`).set(notificationData);

            return notificationData;
        }),
    deleteNotificationForReaction: functions.region('asia-east2').firestore.document('reactions/{id}')
        .onDelete(eventSnapshot => {
            db.doc(`/notifications/${eventSnapshot.id}`).delete()
                .then(doc => {
                    return true;
                })
                .catch(err => {
                    // console.error(err.message);
                    return false;
                });
        }),
    createNotificationForComment: functions.region('asia-east2').firestore.document('comments/{id}')
        .onCreate(async eventSnapshot => {
            const postDoc = await db.doc(`/posts/${eventSnapshot.data().postId}`).get();

            // TODO: check if doc exists (cause the post can be removed after notification)

            const notificationData = {
                type: 'comment',
                createdAt: new Date(),
                read: false,
                senderId: eventSnapshot.data().userId,
                recipientId: postDoc.data().userId,
                postId: postDoc.id,
                value: eventSnapshot.data().body, // eg. Cool Comment!
            };
            await db.doc(`/notifications/${eventSnapshot.id}`).set(notificationData);

            return notificationData;
        }),
    deleteNotificationForComment: functions.region('asia-east2').firestore.document('comments/{id}')
        .onDelete(eventSnapshot => {
            db.doc(`/notifications/${eventSnapshot.id}`).delete()
                .then(doc => {
                    return true;
                })
                .catch(err => {
                    // console.error(err.message);
                    return false;
                });
        }),
};
