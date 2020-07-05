'use strict';

const { db } = require('./../util/admin');

module.exports = {
    createScream: async (req, res) => {
        // TODO: validate

        const userDocsSnapshot = (await db.collection('users').where('email', '==', req.user.email).get()).docs;
        if (userDocsSnapshot.length === 0) {
            return res.status(500).json({
                error: true,
                message: "Something went wrong!"
            });
        }

        const userDocId = userDocsSnapshot[0].id;
        const scream = {
            userId: userDocId,
            body: req.body.body,
            createdAt: new Date().toISOString(), // admin.firestore.Timestamp.fromDate(new Date())
            reactions: {
                like: 0,
                dislike: 0,
            },
        };

        await db.collection('screams').add(scream);
        return res.json({
            error: false,
            message: "Scream created successfully!",
        });
    },
    getScreamData: async (req, res) => {
        const screamId = req.params.screamId;
        const scream = await db.doc(`/screams/${screamId}`).get();
        if (!scream) {
            return res.status(404).json({
                error: true,
                message: "Scream not found",
            });
        }

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
    commentOnScream: async (req, res) => {
        // TODO: validate

        const screamId = req.body.screamId;

        const screamDoc = await db.doc(`/screams/${screamId}`).get();
        if (!screamDoc.data()) {
            return res.status(404).json({
                error: true,
                message: "Scream not found!",
            });
        }

        const userDocsSnapshot = (await db.collection('users').where('email', '==', req.user.email).get()).docs;
        if (userDocsSnapshot.length === 0) {
            return res.status(404).json({
                error: true,
                message: "Something wnt wrong!",
            });
        }

        const userDocId = userDocsSnapshot[0].id;
        const comment = {
            body: req.body.body,
            createdAt: new Date(),
            screamId: screamId,
            userId: userDocId,
        };
        await db.collection('comments').add(comment);

        return res.status(201).json({
            error: false,
            message: "Comment added successfully.",
        });
    },
    deleteScream: (req, res) => {
        const screamId = req.params.screamId;
        const screamDoc = db.doc(`/screams/${screamId}`);
        screamDoc.get().then(doc => {
                if (doc.data()) {
                    screamDoc.delete()
                        .then(() => {
                            return res.status(200).json({
                                error: false,
                                message: "Scream successfully deleted.",
                            });
                        })
                        .catch(err => {
                            return res.status(500).json({
                                error: true,
                                message: err.message,
                            });
                        });
                } else {
                    return res.status(404).json({
                        error: true,
                        message: "Scream not found!",
                    });
                }
            })
            .catch(err => {
                return res.status(500).json({
                    error: true,
                    message: err.message,
                });
            });
    },
};
