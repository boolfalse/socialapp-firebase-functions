'use strict';

const { db, admin } = require('./admin');

/**
 * For Postman add following test script to the login API-route,
 * and use "ID_TOKEN" global variable for auth-protected routes.
 * For example: "Bearer {{ID_TOKEN}}" as "Authorization" Header)
 *
 * var data = pm.response.json();
 * if (data.token) {
 *     pm.globals.set("ID_TOKEN", data.token);
 * } else {
 *     pm.globals.set("ID_TOKEN", '');
 * }
 */
module.exports = (req, res, next) => {
    let idToken;
    let headerAuth = req.headers.authorization;
    if (headerAuth) {
        if (headerAuth.startsWith('Bearer ')) {
            idToken = headerAuth.split('Bearer ')[1];
        } else {
            return res.status(403).json({
                error: true,
                message: "Unauthorized!"
            });
        }
    }
    else {
        return res.status(403).json({
            error: true,
            message: "Unauthorized!"
        });
    }

    admin.auth().verifyIdToken(idToken)
        .then(decodedToken => {
            req.user = decodedToken;

            return next();
        })
        .catch(err => {
            // console.error("Error while verifying token: ", err);
            if (err.code === 'auth/id-token-expired') {
                return res.status(403).json({
                    error: true,
                    message: "Unauthorized!"
                });
            } else {
                return res.status(403).json({
                    error: true,
                    message: "Something went wrong!"
                });
            }
        });
};
