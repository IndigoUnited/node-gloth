'use strict';

var glob = require('glob');

function globHook(pattern, options) {
    return function (matches, next) {
        glob(pattern, options || {}, function (err, matches) {
            if (err) {
                return next(err);
            }

            next(null, matches);
        });
    };
}

function globHookSync(pattern, options) {
    return function (matches) {
        var globMatches = glob.sync(pattern, options || {});
        matches.apply(matches, globMatches);

        return matches;
    };
}

module.exports = globHook;
module.exports.sync = globHookSync;