const extend = require('xtend');
const fs = require('fs');
const persistFs = require('../helpers/persist');
const updateFileRef = require('../helpers/update-file-ref');
const settings = require('../../settings.js');

var defaults = {
    store: 'fs'
};

/**
 * openrosa-form-submission middleware saves the files to `tmp` and attaches
 * a `files` object to `req`, with properties `file.path`, `file.headers` and
 * `file.size` see https://github.com/andrewrk/node-multiparty/#file-name-file
 *
 * This middleware saves each file to the chosen storage.
 */
function SaveMedia (options) {
    const store = persistFs;

    options = extend(defaults, options);

    return function (req, res, next) {
        if (!req.files.length) return next();
        if (!req.submission) return next(new Error('no form submission found'));

        var taskCount = 0;

        req.files.forEach(function (file) {
            var storeOptions = {
                filename: req.submission.instanceId + '/' + file.originalFilename,
                file: file,
                filesystem: {
                    path: settings.publicDir + 'public/submissions/' + req.submission.formId + '/'
                }
            };

            store(fs.createReadStream(file.path), storeOptions, function onSave (err, url) {
                if (err) onError(err);
                // store a reference to where the file is now stored on the file object
                file.url = url;
                updateFileRef(req.submission.json, file);
                taskCount++;
                // Quick and dirty check whether we have processed all the files
                if (taskCount < req.files.length) return;
                cleanupFiles();
                next();
            });
        });

        function onError (err) {
            cleanupFiles();
            next(err)
        }

        /**
         * The form submission middleware saves all the files to disk
         * Now we have stored them we must delete the temp files or disk
         * space will quickly fill up.
         */
        function cleanupFiles () {
            req.files.forEach(function (file) {
                fs.unlink(file.path, function (err) {
                    if (err) console.error('Error deleting file %s', file.path);
                });
            });
        }
    }
}

module.exports = SaveMedia;
