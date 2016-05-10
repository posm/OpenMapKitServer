var extend = require('xtend');
var fs = require('fs');
var persistFs = require('../helpers/persist');
var updateFileRef = require('../helpers/update-file-ref');
var createAndSubmitChangesets = require('../osm/submit-changesets').createAndSubmitChangesets;
var settings = require('../../../settings.js');

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
    var store = persistFs;

    options = extend(defaults, options);

    return function (req, res, next) {
        if (!req.files.length) return next();
        if (!req.submission) return next(new Error('no form submission found'));

        var taskCount = 0;

        // Used to submit changesets for the osm files being submitted
        // in osm/submit-changesets.js
        var osmDirs = {};

        req.files.forEach(function (file) {
            var storeOptions = {
                filename: req.submission.instanceId + '/' + file.originalFilename,
                file: file,
                filesystem: {
                    path: settings.dataDir + '/submissions/' + req.submission.formId + '/'
                }
            };

            // Create OSM hash used by osm/submit-changesets.js
            var fileName = file.fieldName;
            if (fileName.substring(file.length - 4) === '.osm') {
                var pwd = storeOptions.filesystem.path + req.submission.instanceId;
                osmDirs[pwd] = pwd + '/' + fileName;
            }

            store(fs.createReadStream(file.path), storeOptions, function onSave (err, url) {
                if (err) onError(err);
                // store a reference to where the file is now stored on the file object
                file.url = url;
                updateFileRef(req.submission.json, file);
                taskCount++;
                // Quick and dirty check whether we have processed all the files
                if (taskCount < req.files.length) return;
                cleanupFiles();
                // createAndSubmitChangesets(osmDirs, settings.osmApi);
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
