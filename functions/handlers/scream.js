'use strict';

const { db } = require('./../util/admin');

module.exports = {
    getScreams: (req, res) => {
        db.collection('screams')
            .orderBy('createdAt', 'DESC')
            .get()
            .then(snapshotData => {
                let screams = [];
                snapshotData.forEach(doc => {
                    screams.push({
                        screamId: doc.id,
                        ...doc.data()
                    });
                });
                return res.json(screams);
            })
            .catch(err => {
                return res.status(500).json({
                    error: err
                });
            });
    },
    createScream: (req, res) => {
        const scream = {
            userHandle: req.body.userHandle,
            body: req.body.body,
            createdAt: new Date().toISOString() // admin.firestore.Timestamp.fromDate(new Date())
        };
        db.collection('screams')
            .add(scream)
            .then(doc => {
                return res.json({
                    message: `Document ${doc.id} created successfully!`
                });
            })
            .catch(err => {
                return res.status(500).json({
                    error: err
                });
            });
    }
};
