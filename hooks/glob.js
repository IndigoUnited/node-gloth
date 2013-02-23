'use strict';

var glob = require('glob');

function globHook(pattern, options) {
    return function (matches, next) {
        glob(pattern, options || {}, function (err, globMatches) {
            if (err) {
                return next(err);
            }

            matches.push.apply(matches, globMatches);
            next(null, matches);
        });
    };
}

function globHookSync(pattern, options) {
    return function (matches) {
        var globMatches = glob.sync(pattern, options || {});
        matches.push.apply(matches, globMatches);

        return matches;
    };
}

module.exports = globHook;
module.exports.sync = globHookSync;