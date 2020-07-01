'use strict';

const { db } = require('./../util/admin');
const reactionsEnum = [
    1, // like
    2, // dislike
];

module.exports = {
    getScreamReactions: async (req, res) => {
        const screamId = req.params.screamId;
        const scream = await db.doc(`/screams/${screamId}`).get();
        if (!scream) {
            return res.status(404).json({
                error: true,
                message: "Scream not found",
            });
        }

        // const screamDocId = scream.id;

        const snapshotData = await db.collection('reactions')
            .orderBy('createdAt', 'DESC')
            .where('screamId', '==', screamId)
            .get();

        const reactions = [];
        snapshotData.forEach(doc => {
            reactions.push(doc.data());
        });

        return res.json({
            reactions: reactions,
        });
    },
    reactionOnScream: async (req, res) => {
        // TODO: validate
        const newReaction = req.body.reaction;
        if (!reactionsEnum.includes(newReaction)) {
            return res.status(409).json({
                error: true,
                message: "Wrong reaction!",
            });
        }

        const screamId = req.body.screamId;
        const screamDoc = await db.doc(`/screams/${screamId}`).get();

        if (screamDoc.data()) {
            let updatedReactions;
            const screamDocReactions = screamDoc.data().reactions;

            const screamReactionSnapshot = await db.collection('reactions')
                .where('userId', '==', req.user.uid)
                .where('screamId', '==', screamId)
                .limit(1)
                .get();

            const screamReactionDocs = screamReactionSnapshot.docs;

            if (screamReactionDocs.length === 0) {
                const reaction = {
                    reaction: newReaction,
                    screamId: screamId,
                    createdAt: new Date(),
                    userId: req.user.uid,
                };

                updatedReactions = {
                    like: newReaction === 1 ? screamDocReactions.like + 1 : screamDocReactions.like,
                    dislike: newReaction === 2 ? screamDocReactions.dislike + 1 : screamDocReactions.dislike,
                }

                await db.collection('reactions').add(reaction);
            }
            else {
                const existingReaction = screamReactionDocs[0].data().reaction; // 1 OR 2

                switch (existingReaction) {
                    case 1:
                        updatedReactions = {
                            like: newReaction === 1 ? screamDocReactions.like : screamDocReactions.like - 1,
                            dislike: newReaction === 2 ? screamDocReactions.dislike + 1 : screamDocReactions.dislike,
                        };
                        break;
                    case 2:
                        updatedReactions = {
                            like: newReaction === 1 ? screamDocReactions.like + 1 : screamDocReactions.like,
                            dislike: newReaction === 2 ? screamDocReactions.dislike : screamDocReactions.dislike - 1,
                        };
                        break;
                    // default:
                }

                await db.collection('reactions').doc(screamReactionDocs[0].id).update({
                    reaction: newReaction,
                    createdAt: new Date(),
                });
            }

            await db.doc(`/screams/${screamId}`).update({
                reactions: updatedReactions
            });

            return res.status(201).json({
                error: false,
                message: "Reaction made successfully.",
            });
        }
        else {
            return res.status(404).json({
                error: true,
                message: "Scream not found!",
            });
        }
    },
};
