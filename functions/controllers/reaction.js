'use strict';

const { db } = require('./../utilities/admin');
const reactionsEnum = [
    1, // like
    2, // dislike
];

module.exports = {
    getPostReactions: async (req, res) => {
        const postId = req.params.postId;
        const post = await db.doc(`/posts/${postId}`).get();
        if (!post) {
            return res.status(404).json({
                error: true,
                message: "Post not found",
            });
        }

        // const postDocId = post.id;

        const snapshotData = await db.collection('reactions')
            .orderBy('createdAt', 'DESC')
            .where('postId', '==', postId)
            .get();

        const reactions = [];
        snapshotData.forEach(doc => {
            reactions.push(doc.data());
        });

        return res.json({
            reactions: reactions,
        });
    },
    reactionOnPost: async (req, res) => {
        // TODO: validate
        const newReaction = req.body.reaction;
        if (!reactionsEnum.includes(newReaction)) {
            return res.status(409).json({
                error: true,
                message: "Wrong reaction!",
            });
        }

        const postId = req.body.postId;
        const postDoc = await db.doc(`/posts/${postId}`).get();

        if (postDoc.data()) {
            let updatedReactions;
            const postDocReactions = postDoc.data().reactions;

            const postReactionSnapshot = await db.collection('reactions')
                .where('userId', '==', req.user.uid)
                .where('postId', '==', postId)
                .limit(1)
                .get();

            const postReactionDocs = postReactionSnapshot.docs;

            if (postReactionDocs.length === 0) {
                const reaction = {
                    reaction: newReaction,
                    postId: postId,
                    createdAt: new Date(),
                    userId: req.user.uid,
                };

                updatedReactions = {
                    like: newReaction === 1 ? postDocReactions.like + 1 : postDocReactions.like,
                    dislike: newReaction === 2 ? postDocReactions.dislike + 1 : postDocReactions.dislike,
                }

                await db.collection('reactions').add(reaction);
            }
            else {
                const existingReaction = postReactionDocs[0].data().reaction; // 1 OR 2

                switch (existingReaction) {
                    case 1:
                        updatedReactions = {
                            like: newReaction === 1 ? postDocReactions.like : postDocReactions.like - 1,
                            dislike: newReaction === 2 ? postDocReactions.dislike + 1 : postDocReactions.dislike,
                        };
                        break;
                    case 2:
                        updatedReactions = {
                            like: newReaction === 1 ? postDocReactions.like + 1 : postDocReactions.like,
                            dislike: newReaction === 2 ? postDocReactions.dislike : postDocReactions.dislike - 1,
                        };
                        break;
                    // default:
                }

                await db.collection('reactions').doc(postReactionDocs[0].id).update({
                    reaction: newReaction,
                    createdAt: new Date(),
                });
            }

            await db.doc(`/posts/${postId}`).update({
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
                message: "Post not found!",
            });
        }
    },
};
