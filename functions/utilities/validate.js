'use strict';

const validator = require('validator');
const isEmpty = require('lodash.isempty');

module.exports = {
    signUpErrors: (data) => {
        const filteredData = {};
        const errorMessages = {};

        // step 1
        if (isEmpty(data)) {
            errorMessages.body = "Body not valid!";

            return {
                error: true,
                errorMessages: errorMessages
            };
        }

        // step 2
        const requiredProps = [
            'email',
            'password',
            'confirmPassword',
            'username',
        ];
        for(const prop in requiredProps) {
            if (!requiredProps.hasOwnProperty(prop)) {
                errorMessages.body = "Body not valid!";

                return {
                    error: true,
                    errorMessages: errorMessages
                };
            }
        }

        // step 3
        if (validator.isEmail(data.email)) {
            filteredData.email = data.email;
        } else {
            errorMessages.email = "Email not valid!";
        }

        if (validator.isLength(data.password, {min: 6, max: 30})) {
            filteredData.password = data.password;
        } else {
            errorMessages.email = "Password must have at least 6 chars and contain max 30 chars!";
        }

        if (data.password === data.confirmPassword) {
            // filteredData.confirmPassword = data.confirmPassword;
        } else {
            errorMessages.password = "Wrong password confirmation";
        }

        if (!isEmpty(data.username)) {
            filteredData.username = data.username;
        } else {
            errorMessages.username = "Username required!";
        }

        const errorsCount = Object.keys(errorMessages).length;
        if (errorsCount === 0) {
            return {
                error: false,
                filteredData: filteredData
            };
        } else {
            return {
                error: true,
                errorMessages: errorMessages
            };
        }
    },
    loginErrors: (data) => {
        const filteredData = {};
        const errorMessages = {};

        // step 1
        if (isEmpty(data)) {
            errorMessages.body = "Body not valid!";

            return {
                error: true,
                errorMessages: errorMessages
            };
        }

        // step 2
        const requiredProps = [
            'email',
            'password',
        ];
        for(const prop in requiredProps) {
            if (!requiredProps.hasOwnProperty(prop)) {
                errorMessages.body = "Body not valid!";

                return {
                    error: true,
                    errorMessages: errorMessages
                };
            }
        }

        // step 3
        if (!isEmpty(data.email)) {
            filteredData.email = data.email;
        } else {
            errorMessages.email = "Email required!";
        }
        if (!isEmpty(data.password)) {
            filteredData.password = data.password;
        } else {
            errorMessages.password = "Password required!";
        }

        const errorsCount = Object.keys(errorMessages).length;
        if (errorsCount === 0) {
            return {
                error: false,
                filteredData: filteredData
            };
        } else {
            return {
                error: true,
                errorMessages: errorMessages
            };
        }
    },
    updateUserDetails: (data) => {
        // TODO: validate
        const filteredData = {};
        const errorMessages = {};

        // step 1
        if (isEmpty(data)) {
            errorMessages.body = "Body not valid!";

            return {
                error: true,
                errorMessages: errorMessages
            };
        }

        // step 2
        const requiredProps = [
            'address',
        ];
        for(const prop in requiredProps) {
            if (!requiredProps.hasOwnProperty(prop)) {
                errorMessages.body = "Body not valid!";

                return {
                    error: true,
                    errorMessages: errorMessages
                };
            }
        }

        // step 3
        if (!isEmpty(data.address)) {
            filteredData.address = data.address;
        } else {
            errorMessages.address = "Address required!";
        }

        const errorsCount = Object.keys(errorMessages).length;
        if (errorsCount === 0) {
            filteredData.occupation = data.occupation;
            filteredData.site = data.site;

            return {
                error: false,
                filteredData: filteredData
            };
        } else {
            return {
                error: true,
                errorMessages: errorMessages
            };
        }
    },
};
