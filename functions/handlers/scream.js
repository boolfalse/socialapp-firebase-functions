'use strict';

const { db } = require('./../util/admin');

module.exports = {
    createScream: async (req, res) => {
        // TODO: validate

        const userDocsSnapshot = (await db.collection('users').where('email', '==', req.user.email).get()).docs;
        if (userDocsSnapshot.length > 0) {
            const userDocId = userDocsSnapshot[0].id;
            const scream = {
                userId: userDocId,
                userHandle: req.body.userHandle,
                body: req.body.body,
                createdAt: new Date().toISOString(), // admin.firestore.Timestamp.fromDate(new Date())
                reactions: {
                    like: 0,
                    dislike: 0,
                },
            };

            const createdScream = await db.collection('screams').add(scream);
            if (createdScream) {
                return res.json({
                    error: false,
                    message: "Scream created successfully!",
                });
            } else {
                return res.status(500).json({
                    error: true,
                    message: "Something went wrong!"
                });
            }
        }
        else {
            return res.status(500).json({
                error: true,
                message: "Something went wrong!"
            });
        }
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
    commentOnScream: (req, res) => {
        // TODO: validate

        const screamId = req.body.screamId;

        db.doc(`/screams/${screamId}`).get()
            .then(doc => {
                if (doc.data()) {
                    const comment = {
                        body: req.body.body,
                        createdAt: new Date(),
                        screamId: screamId,
                        userId: req.user.uid,
                    };
                    return db.collection('comments')
                        .add(comment)
                        .then(() => {
                            return res.status(201).json({
                                error: false,
                                message: "Comment added successfully.",
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
