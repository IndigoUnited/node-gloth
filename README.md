# gloth [![Build Status](https://travis-ci.org/IndigoUnited/node-gloth.svg?branch=master)](https://travis-ci.org/IndigoUnited/node-gloth.svg?branch=master)

Multiple glob expansions with exclusions and hooks. Possible to use asynchrounously and synchronously.

## Installation

`$ npm install gloth`


## Usage

```js
var excludeSizeHigherThen = require('hooks/excludeSizeHigherThen');

gloth(['src/**/*', '!b.js', excludeSizeHigherThen(2097152)], function (err, matches) {
    // Do things with matches
})
```

```js
var excludeSizeHigherThen = require('hooks/excludeSizeHigherThen');

var matches = gloth.sync(['src/**/*', '!b.js', excludeSizeHigherThen(2097152)]);
// Do things with matches
```

The example above would expand all files in the `src` folder, exclude any file named `b.js` and run the `excludeSizeHigherThen` hook. This hook would look something like:

```js
var fs = require('fs');

module.exports = function (size) {
    return function (matches) {
        return matches.filter(function (match) {
            var stat = fs.statSync(match);

            return !stat.isFile() || stat.size <= size;
        });
    };
};
```

The hook above was written synchronously. The asynchronous version would be:

```js
var fs    = require('fs');
var async = require('async');

module.exports = function (size) {
    return function (matches, next) {
        async.filter(matches, function (match, next) {
            fs.stat(match, function (err, stat) {
                if (err) return next(false);

                next(!stat.isFile() || stat.size <= size);
            });
        }, function (results) {
            next(null, results);
        });
    };
};
```

For more information on how hooks are done, please check the built-in hooks in the source code.
The `options` available are the same as the [glob](https://github.com/isaacs/node-glob) ones.

__IMPORTANT__: sync hooks can be run in gloth async and sync, but async hooks can only be used with gloth async.


## License

Released under the [MIT License](http://www.opensource.org/licenses/mit-license.php).
