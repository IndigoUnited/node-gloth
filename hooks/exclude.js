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
            var matched = minimatch(match, pattern, options);

            if (matched) {
                return false;
            }

            if (!matched && pattern.substr(0, 2) === './') {
                return !minimatch(match, pattern.substr(2), options);
            }

            return true;
        });
    };
}

module.exports = excludeHook;