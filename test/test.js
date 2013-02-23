'use strict';

var gloth = require('../index');
var expect = require('expect.js');
var difference = require('mout/array/difference');

function assertExpected(result, expected) {
    expect(result).to.be.an('array');

    try {
        expect(result.length).to.equal(expected.length);
        expect(difference(expected, result).length).to.equal(0);
    } catch (e) {
        expect(result).to.eql(expected);
    }
}

describe('async usage', function () {
    it('should allow a single pattern', function (next) {
        gloth('test/assets/folder1/**/*', function (err, matches) {
            if (err) {
                return next(err);
            }

            assertExpected(matches, [
                'test/assets/folder1/subfolder/subfile.html',
                'test/assets/folder1/subfolder',
                'test/assets/folder1/file2.css',
                'test/assets/folder1/file1.js'
            ]);

            next();
        });
    });

    it('should allow passing options', function (next) {
        gloth('**/*', { cwd: 'test/assets/folder1', dot: true }, function (err, matches) {
            if (err) {
                return next(err);
            }

            assertExpected(matches, [
                'subfolder/subfile.html',
                'subfolder',
                'file2.css',
                'file1.js',
                '.dotfile'
            ]);

            next();
        });
    });

    it('should include matches of multiple inclusion patterns', function (next) {
        gloth(['folder1/**/*', 'folder2/**/*.png'], { cwd: 'test/assets' }, function (err, matches) {
            if (err) {
                return next(err);
            }

            assertExpected(matches, [
                'folder1/subfolder/subfile.html',
                'folder1/subfolder',
                'folder1/file2.css',
                'folder1/file1.js',
                'folder2/image.png'
            ]);

            next();
        });
    });

    it('should excludes matches of patterns starting with a !', function (next) {
        gloth(['folder1/**/*', '!file1.js' ], { cwd: 'test/assets/' }, function (err, matches) {
            if (err) {
                return next(err);
            }

            assertExpected(matches, [
                'folder1/file2.css',
                'folder1/subfolder',
                'folder1/subfolder/subfile.html'
            ]);

            next();
        });
    });

    it('should assume result of hooks', function (next) {
        var someHook,
            otherHook;

        someHook = function (matches, next) {
            next(null, ['foo']);
        };
        otherHook = function (matches, next) {
            next(null, ['wat']);
        };

        gloth(['folder1/**/*', someHook, 'folder2/**/*', otherHook], { cwd: 'test/assets/' }, function (err, matches) {
            if (err) {
                return next(err);
            }

            expect(matches).to.eql(['wat']);
            next();
        });
    });

    it('should unique the results', function (next) {
        gloth(['**/*', '**/*.js'], { cwd: 'test/assets/folder1' }, function (err, matches) {
            if (err) {
                return next(err);
            }

            assertExpected(matches, [
                'subfolder/subfile.html',
                'subfolder',
                'file2.css',
                'file1.js'
            ]);

            next();
        });
    });

    it('should allow sync and async hooks', function (next) {
        var asyncHook,
            syncHook;

        asyncHook = function (matches, next) {
            matches.push('async');
            next(null, matches);
        };

        syncHook = function (matches) {
            matches.push('sync');
            return matches;
        };

        gloth([asyncHook, syncHook], function (err, matches) {
            if (err) {
                return next(err);
            }

            expect(matches).to.eql(['async', 'sync']);
            next();
        });
    });

    it('should error out when hooks do not pass an array', function (next) {
        var hook = function () {
            return 'wat';
        };

        gloth(hook, function (err) {
            expect(err).to.be.an(Error);
            expect(err.message).to.contain('did not passed an array');

            hook = function (matches, next) {
                return next(null, 'wat');
            };

            gloth(hook, function (err) {
                expect(err).to.be.an(Error);
                expect(err.message).to.contain('did not passed an array');

                next();
            });
        });
    });
});

describe('sync usage', function () {
    it('should allow a single pattern', function () {
        var matches = gloth.sync('test/assets/folder1/**/*');

        assertExpected(matches, [
            'test/assets/folder1/subfolder/subfile.html',
            'test/assets/folder1/subfolder',
            'test/assets/folder1/file2.css',
            'test/assets/folder1/file1.js'
        ]);
    });

    it('should allow passing options', function () {
        var matches = gloth.sync('**/*', { cwd: 'test/assets/folder1', dot: true });

        assertExpected(matches, [
            'subfolder/subfile.html',
            'subfolder',
            'file2.css',
            'file1.js',
            '.dotfile'
        ]);
    });

    it('should include matches of multiple inclusion patterns', function () {
        var matches = gloth.sync(['folder1/**/*', 'folder2/**/*.png'], { cwd: 'test/assets' });

        assertExpected(matches, [
            'folder1/subfolder/subfile.html',
            'folder1/subfolder',
            'folder1/file2.css',
            'folder1/file1.js',
            'folder2/image.png'
        ]);
    });

    it('should excludes matches of patterns starting with a !', function () {
        var matches = gloth.sync([
            'folder1/**/*',
            '!file1.js'
        ], { cwd: 'test/assets/' });

        assertExpected(matches, [
            'folder1/file2.css',
            'folder1/subfolder',
            'folder1/subfolder/subfile.html'
        ]);
    });


    it('should assume result of hooks', function () {
        var someHook,
            otherHook,
            matches;

        someHook = function () {
            return ['foo'];
        };
        otherHook = function (matches) {
            return ['wat#' + matches.length];
        };

        matches = gloth.sync(['folder1/**/*', someHook, 'folder2/**/*', otherHook], { cwd: 'test/assets/' });
        expect(matches).to.eql(['wat#7']);
    });

    it('should unique the results', function () {
        var matches = gloth.sync(['**/*', '**/*.js'], { cwd: 'test/assets/folder1' });

        assertExpected(matches, [
            'subfolder/subfile.html',
            'subfolder',
            'file2.css',
            'file1.js'
        ]);
    });

    it('should error when using async hooks', function () {
        expect(function () {
            var hook = function (matches, next) {
                matches.push('wat');
                next(null, matches);
            };

            gloth.sync(hook);
        }).to.throwError(/is async/);
    });

    it('should error out when hooks do not return an array', function () {
        expect(function () {
            var hook = function () {
                return 'wat';
            };

            gloth.sync(hook);
        }).to.throwError(/did not returned an array/);
    });
});

describe('exclusion patterns', function () {
    // Exclusion pattern will be tested with sync usage for the sake of simplicity
    // Note that we are testing the exclude hook
    it('should exclude matches based on their basename if the pattern does not start with a /', function () {
        var matches = gloth.sync([
            '**/*.mp4',
            '!video.mp4'
        ], { cwd: 'test/assets/folder2' });

        assertExpected(matches, []);
    });

    it('should exclude matches based on their complete name if the pattern starts with a /', function () {
        var matches = gloth.sync([
            '**/*.mp4',
            '!/video.mp4'
        ], { cwd: 'test/assets/folder2' });

        assertExpected(matches, ['subfolder/video.mp4']);
    });

    it('should support expansion patterns also', function () {
        var matches = gloth.sync([
            '**/*',
            '!**/*.mp4'
        ], { cwd: 'test/assets/folder2' });

        assertExpected(matches, [
            'subfolder/document.pdf',
            'subfolder/page.html',
            'subfolder',
            'image.png'
        ]);
    });
});