var fs = require('fs');
var settings = require('../../../settings');
var JSONStream = require('JSONStream');
var async = require('async');

var ASYNC_LIMIT = 10;

module.exports = function (opts, cb) {
    var formName = opts.formName;
    var limit = parseInt(opts.limit);
    var offset = opts.offset;

    // default to 100 for limit
    if (isNaN(limit) || limit < 1) {
        limit = 100;
    }

    // check if valid offset. we paginate with valid offset.
    if (offset != null) {
        offset = parseInt(offset);
        if (isNaN(offset) || !Number.isInteger(offset) || offset < 0) {
            cb({
                status: 400,
                err: 'BAD_OFFSET',
                msg: 'If you specify an offset for pagination, it must be an integer greater than 0.',
                path: '/odk/submissions/:formName.json'
            });
            return;
        }
        // otherwise ok
    }
    // otherwise we don't have an offset

    if (formName == null) {
        cb({
            status: 400,
            err: 'MISSING_PARAM',
            msg: 'You must specify a parameter for the formName in this end point.',
            path: '/odk/submissions/:formName.json'
        });
        return;
    }
    var dir = settings.dataDir + '/submissions/' + formName;
    var aggregate = [];
    // All of the submission dirs in the form directory
    // Note that fs.readdir is always in alphabetical order on POSIX systems.
    fs.readdir(dir, function (err, submissionDirs) {
        if (err) {
            if (err.errno === -2) {
                // trying to open a directory that is not there.
                cb({
                    status: 404,
                    msg: 'You are trying to aggregate the ODK submissions for a form that has no submissions. Please submit at least one survey to see data. Also, check to see if you spelled the form name correctly. Form name: ' + formName,
                    err: err
                });
                return;
            }
            cb({
                status: 500,
                msg: 'Problem reading submissions directory.',
                err: err
            });
            return;
        }

        // if offset, we do pagination
        if (offset != null) {
            submissionDirs = submissionDirs.slice(offset, offset + limit);
        }

        async.eachLimit(submissionDirs, ASYNC_LIMIT, function (submissionDir, callback) {
            // If it's not a directory, we just skip processing that path.
            if (submissionDir[0] === '.' || submissionDir.indexOf('.txt') > 0) {
                callback(); // ok, but skipping
                return;
            }
            // Otherwise, we want to open up the data.json in the submission dir.
            var dataFile = dir + '/' + submissionDir + '/data.json';
            try {
                var stream = fs.createReadStream(dataFile);
                var parser = JSONStream.parse();
                stream.pipe(parser);
                parser.on('root', function (obj) {
                    aggregate.push(obj);
                    callback(); // ok submission
                });
            } catch(e) {
                cb({
                    status: 500,
                    msg: 'Problem reading data.json file in submission directory. dataFile: ' + dataFile,
                    err: e
                }); // we have an error, break out of all async iteration
            }
        }, function (err) {
            // an error occurred...
            if (err) {
                cb(err);
            }
            // it was a success
            else {
                cb(null, aggregate);
            }
        });
    });
};