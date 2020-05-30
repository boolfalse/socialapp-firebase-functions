'use strict';

const validator = require('validator');

function signUpErrors(user) {
    const errors = {};

    if (!validator.isEmail(user.email)) {
        errors.email = "Email not valid!";
    }
    if (!validator.isLength(user.password, {min: 6, max: 30})) {
        errors.email = "Password must have at least 6 chars and contain max 30 chars!";
    }
    if (user.password !== user.confirmPassword) {
        errors.password = "Wrong password confirmation";
    }

    const errorsCount = Object.keys(errors).length;
    if (errorsCount === 0) {
        return false;
    } else {
        return errors;
    }
}

module.exports = {
    signUpErrors: signUpErrors
};