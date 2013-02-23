'use strict';

var async = require('async');
var globHook = require('./hooks/glob');
var excludeHook = require('./hooks/exclude');

function gloth(patterns, options, cb) {
    var matches = [],
        i = -1,
        hooks;

    // Arguments parsing
    if (typeof options === 'function') {
        cb = options;
        options = {};
    } else if (!options) {
        options = {};
    }

    // Transform the patterns into hooks
    hooks = toHooks(patterns, options, true);

    // Run each of them in series
    async.forEachSeries(hooks, function (hook, next) {
        i++;
        hook(matches, function (err, hookMatches) {
            if (err) {
                return next(err);
            }

            matches = hookMatches;

            // Check if the hook passed an array
            if (!Array.isArray(matches)) {
                return next(new Error('Hook ' + hookName(hook, i) + ' did not passed an array.'));
            }

            next();
        });
    }, function (err) {
        if (err) {
            return cb(err);
        }

        cb(null, unique(matches));
    });
}

function glothSync(patterns, options, cb) {
    var matches = [],
        hooks;

    // Arguments parsing
    if (typeof options === 'function') {
        cb = options;
        options = {};
    } else if (!options) {
        options = {};
    }

    // Transform the patterns into hooks
    hooks = toHooks(patterns, options, false);

    // Execute each hook
    hooks.forEach(function (hook, i) {
        matches = hook(matches);

        // Check if the hook passed an array
        if (!Array.isArray(matches)) {
            throw new Error('Hook ' + hookName(hook, i) + ' did not returned an array.');
        }
    });

    return unique(matches);
}

function toHooks(patterns, options, async) {
    // Ensure array
    patterns = !Array.isArray(patterns) ? [patterns] : patterns;

    // Return an array of hooks based on each pattern
    return patterns.map(function (pattern, i) {
        var hook;

        // Replace include/exclude patterns with the built-in hooks
        if (typeof pattern === 'string') {
            if (pattern.charAt(0) !== '!') {
                return async ? globHook(pattern, options) : globHook.sync(pattern, options);
            } else {
                pattern = excludeHook(pattern.substr(1));
            }
        }

        hook = pattern;

        // Check if is a valid hook
        if (typeof hook !== 'function') {
            throw new Error('Hook #' + i + ' is not a function.');
        }

        // Check if using an async hook in sync gloth usage
        if (!async) {
            if (hook.length >= 2) {
                throw new Error('Hook ' + hookName(hook, i) + ' is async, but was used in gloth.sync.');
            }
        // Transform sync hooks into async in async gloth usage
        } else {
            if (hook.length <= 1) {
                return function (matches, next) {
                    try {
                        next(null, hook(matches));
                    } catch (e) {
                        next(e);
                    }
                };
            }
        }

        return hook;
    });
}

function hookName(hook, index) {
    return hook.name ? hook.name : '#' + index;
}

function unique(arr) {
    var index = {},
        newArr = [],
        i,
        length = arr.length,
        curr;

    for (i = 0; i < length; i += 1) {
        curr = arr[i];

        if (!index[curr]) {
            newArr.push(curr);
            index[curr] = true;
        }
    }

    return newArr;
}

module.exports = gloth;
module.exports.sync = glothSync;