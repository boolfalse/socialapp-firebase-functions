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
    },
    getScreamData: async (req, res) => {
        const screamId = req.params.screamId;
        const scream = await db.doc(`/screams/${screamId}`).get();
        const screamDocId = scream.id;

        const snapshotData = await db.collection('comments')
            .orderBy('createdAt', 'DESC')
            .where('screamId', '==', screamId)
            .get();

        const comments = [];
        snapshotData.forEach(doc => {
            comments.push({
                screamId: screamDocId,
                ...doc.data()
            });
        });

        return res.json({
            scream: {
                screamId: scream.id,
                ...scream.data()
            },
            comments: comments,
        });
    },
};
