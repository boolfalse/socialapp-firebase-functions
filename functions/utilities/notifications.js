'use strict';

const functions = require('firebase-functions');
const { db } = require('./admin');



module.exports = {
    createNotificationForReaction: functions.region('asia-east2').firestore.document('reactions/{id}')
        .onCreate(async eventSnapshot => {
            const postDoc = await db.doc(`/posts/${eventSnapshot.data().postId}`).get();

            // TODO: check if post doc exists (cause the post can be removed after notification)
            // TODO: disable notifications for user who owns the current post

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
        .onDelete(async eventSnapshot => {
            await db.doc(`/notifications/${eventSnapshot.id}`).delete();
            return eventSnapshot.data();
        }),
    createNotificationForComment: functions.region('asia-east2').firestore.document('comments/{id}')
        .onCreate(async eventSnapshot => {
            const postDoc = await db.doc(`/posts/${eventSnapshot.data().postId}`).get();

            // TODO: check if post doc exists (cause the post can be removed after notification)
            // TODO: disable notifications for user who owns the current post

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
        .onDelete(async eventSnapshot => {
            await db.doc(`/notifications/${eventSnapshot.id}`).delete();
            return eventSnapshot.data();
        }),
    // updateNotificationForUserChangesProfileImage: functions.region('asia-east2').firestore.document('users/{id}')
    //     .onUpdate(async change => {
    //         if (change.before.data().imageUrl !== change.after.data().imageUrl)
    //         {
    //             const postDocs = await db.collection('posts')
    //                 .where('username', '==', change.before.data().username)
    //                 .limit(1)
    //                 .get();
    //
    //             const batch = db.batch();
    //             postDocs.forEach(doc => {
    //                 const post = db.doc(`/posts/${doc.id}`);
    //                 batch.update(post, { imageUrl: change.after.data().imageUrl });
    //             });
    //             batch.commit();
    //         }
    //         else {
    //             return change.after.data();
    //         }
    //     }),
    deleteNotificationForDeletePost: functions.region('asia-east2').firestore.document('posts/{id}')
        .onDelete(async (snapshot, context) => {
            const postId = context.params.id;
            const batch = db.batch();

            const commentDocs = await db.collection('comments').where('postId', '==', postId).get();
            commentDocs.forEach((commentDoc) => {
                batch.delete(db.doc(`/comments/${commentDoc.id}`));
            });

            const reactionDocs = await db.collection('reactions').where('postId', '==', postId).get();
            reactionDocs.forEach((reactionDoc) => {
                batch.delete(db.doc(`/likes/${reactionDoc.id}`));
            });

            const notificationDocs = await db.collection('notifications').where('postId', '==', postId).get();
            notificationDocs.forEach((notificationDoc) => {
                batch.delete(db.doc(`/notifications/${notificationDoc.id}`));
            });

            return  batch.commit();
        }),
};
