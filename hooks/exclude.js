'use strict';

var minimatch = require('minimatch');

function excludeHook(pattern, options) {
    options = options || {};

    if (pattern.charAt(0) === '/') {
        options.matchBase = false;
        pattern = pattern.substr(1);
    } else if (!options.hasOwnProperty('matchBase')) {
        options.matchBase = true;
    }

    return function (matches) {
        return matches.filter(function (match) {
            return !minimatch(match, pattern, options);
        });
    };
}

module.exports = excludeHook;