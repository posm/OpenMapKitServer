var fs = require('fs');
// var fs = require('graceful-fs');
var settings = require('../../../settings');
var JSONStream = require('JSONStream');
var async = require('async');

var ASYNC_LIMIT = 10;

/**
 * Aggregates together all of the survey submissions
 * that have been written to the file system together
 * as one JSON response.
 */
module.exports = function (req, res, next) {
    var formName = req.params.formName;
    if (typeof formName === 'undefined' || formName === null) {
        res.status(400).json({
            status: 400,
            err: 'MISSING_PARAM',
            msg: 'You must specify a parameter for the formName in this end point.',
            path: '/odk/submissions/:formName.json'
        });
        return;
    }
    var dir = settings.dataDir + '/submissions/' + formName;
    var aggregate = [];
    var dataErrors = [];
    // All of the submission dirs in the form directory
    fs.readdir(dir, function (err, submissionDirs) {
        if (err) {
            if (err.errno === -2) {
                // trying to open a directory that is not there.
                res.status(404).json({
                    status: 404,
                    msg: 'You are trying to aggregate the ODK submissions for a form that has no submissions. Please submit at least one survey to see data. Also, check to see if you spelled the form name correctly. Form name: ' + formName,
                    err: err
                });
                return;
            }
            res.status(500).json({
                status: 500,
                msg: 'Problem reading submissions directory.',
                err: err
            });
            return;
        }
        var len = submissionDirs.length;
        if (submissionDirs.length === 0) {
            res.status(200).json([]);
            return;
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
                callback({
                    status: 500,
                    msg: 'Problem reading data.json file in submission directory. dataFile: ' + dataFile,
                    err: e
                }); // we have an error, break out of all async iteration
            }
        }, function (err) {
            // an error occurred...
            if (err) {
                res.status(500).json(err);
            }
            // it was a success
            else {
                res.status(200).json(aggregate);
            }
        });
    });

};
