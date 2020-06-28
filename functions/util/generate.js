'use strict';

module.exports = {
    avatarName: (length = 20) => {
        return Math.random().toString(50).substr(2, length);
        // return (new Date().getTime() / 1000 | 0);
    }
};
