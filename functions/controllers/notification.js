'use strict';

const { db } = require('./../utilities/admin');

module.exports = {
    markAsRead: async (req, res) => {
        // TODO: validate
        // TODO: check if notifications exists
        // TODO: check if user owns all notifications

        const notificationIds = req.body;
        let batch = await db.batch();
        let notification;

        notificationIds.forEach(notificationId => {
            notification = db.doc(`/notifications/${notificationId}`);
            batch.update(notification, { read: true });
        });
        await batch.commit();

        return res.status(200).json({
            error: true,
            message: "Notification(s) was read."
        });
    },
};
