'use strict';

var minimatch = require('minimatch');

function excludeHook(pattern, options) {
    options = options || {};

    if (!options.hasOwnProperty('matchBase')) {
        options.matchBase = true;
    }

    return function (matches) {
        return matches.filter(function (match) {
            return minimatch(match, pattern, options);
        });
    };
}

module.exports = excludeHook;