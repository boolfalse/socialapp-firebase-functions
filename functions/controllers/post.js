'use strict';

const { db } = require('./../utilities/admin');

module.exports = {
    createPost: async (req, res) => {
        // TODO: validate

        const userDocsSnapshot = (await db.collection('users').where('email', '==', req.user.email).get()).docs;
        if (userDocsSnapshot.length === 0) {
            return res.status(500).json({
                error: true,
                message: "Something went wrong!"
            });
        }
        const userDocId = userDocsSnapshot[0].id;

        const post = {
            userId: userDocId,
            body: req.body.body,
            createdAt: new Date().toISOString(), // admin.firestore.Timestamp.fromDate(new Date())
            reactions: {
                like: 0,
                dislike: 0,
            },
        };

        await db.collection('posts').add(post);
        return res.json({
            error: false,
            message: "Post created successfully!",
        });
    },
    getPostData: async (req, res) => {
        const postId = req.params.postId;
        const post = await db.doc(`/posts/${postId}`).get();
        if (!post) {
            return res.status(404).json({
                error: true,
                message: "Post not found",
            });
        }

        const postDocId = post.id;

        const snapshotData = await db.collection('comments')
            .orderBy('createdAt', 'DESC')
            .where('postId', '==', postId)
            .get();

        const comments = [];
        snapshotData.forEach(doc => {
            comments.push({
                postId: postDocId,
                ...doc.data()
            });
        });

        return res.json({
            post: {
                postId: post.id,
                ...post.data()
            },
            comments: comments,
        });
    },
    commentOnPost: async (req, res) => {
        // TODO: validate

        const postId = req.body.postId;

        const postDoc = await db.doc(`/posts/${postId}`).get();
        if (!postDoc.data()) {
            return res.status(404).json({
                error: true,
                message: "Post not found!",
            });
        }

        const userDocsSnapshot = (await db.collection('users').where('email', '==', req.user.email).get()).docs;
        if (userDocsSnapshot.length === 0) {
            return res.status(403).json({
                error: true,
                message: "Something went wrong!",
            });
        }
        const userDocId = userDocsSnapshot[0].id;

        const comment = {
            body: req.body.body,
            createdAt: new Date(),
            postId: postId,
            userId: userDocId,
        };
        await db.collection('comments').add(comment);

        return res.status(201).json({
            error: false,
            message: "Comment added successfully.",
        });
    },
    deletePost: (req, res) => {
        const postId = req.params.postId;
        const postDoc = db.doc(`/posts/${postId}`);
        postDoc.get().then(doc => {
                if (doc.data()) {
                    postDoc.delete()
                        .then(() => {
                            return res.status(200).json({
                                error: false,
                                message: "Post successfully deleted.",
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
                        message: "Post not found!",
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
