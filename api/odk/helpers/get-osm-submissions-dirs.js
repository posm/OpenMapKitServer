var fs = require('fs');
var settings = require('../../../settings');

/**
 * Gathers all of the OSM submissions for a form.
 * Creates an object with the submissions dir
 * and an array of corresponding files.
 * 
 * @param formName - the name (form_id) of the ODK form
 * @param cb - first param is error, second is an object of submission dirs
 *             with an array of osm files
 */
module.exports = function (formName, cb) {
    if (typeof formName === 'undefined' || formName === null) {
        cb({
            status: 400,
            err: 'MISSING_PARAM',
            msg: 'You must specify a parameter for the formName.'
        });
    }
    var dir = settings.dataDir + '/submissions/' + formName;
    var osmDirs = {};

    // All of the submission dirs in the form directory
    fs.readdir(dir, function (err, submissionDirs) {
        if (err) {
            if (err.errno === -2) {
                // trying to open a directory that is not there.
                cb({
                    status: 404,
                    msg: 'You are trying to get OSM submissions from a form that does not exist or has no submissions. You may have misspelled the name of the form you are looking for. The name that you specified is: ' + formName,
                    err: err
                });
                return;
            }
            cb({
                status: 500,
                msg: 'Problem reading submissionDirs.',
                err: err
            });
            return;
        }
        var len = submissionDirs.length;
        if (len === 0) {
            cb(null, []);
            return;
        }

        // A structure to keep track of where we are while traversing directories
        // to find OSM files.
        var dirStat = {
            len: len,
            count: 0
        };

        for (var i = 0; i < len; i++) {
            dirStat.submissionDir = submissionDirs[i];
            dirStat.fullPath = dir + '/' + submissionDirs[i];
            if (dirStat.submissionDir[0] === '.') {
                ++dirStat.count;
                if (len === dirStat.count) {
                    cb(null, osmDirs);
                }
                continue;
            }
            findOsmFilesInDir(dirStat, osmDirs, cb);
        }
    });
};

/**
 * Reads through all of the files in a submission directory and
 * appends the full OSM file path to the osmFiles array.
 *
 * @param dirStat  - the counters and paths of the directory we are async iterating through
 * @param osmDirs - all of the osm files we've found so far, grouped by the submission dir
 * @param cb - first param is error, second is array of osm files
 */
function findOsmFilesInDir(dirStat, osmDirs, cb) {
    var fullPath = dirStat.fullPath;
    fs.readdir(fullPath, function (err, files) {
        if (err) {
            // trying to open a file instead of a directory, just continue on...
            if (err.errno === -20) {
                ++dirStat.count;
                return;
            }
            if (!res._headerSent) { // prevents trying to send multiple error responses on a single request
                res.status(500).json({
                    status: 500,
                    msg: 'There was a problem with reading the OSM files in the submissions directory.',
                    err: err
                });
            }
            return;
        }
        ++dirStat.count;
        for (var j = 0, len = files.length; j < len; j++) {
            var file = files[j];
            if (file.substring(file.length - 4) !== '.osm') continue; // Check if .osm file
            var longFilePath = fullPath + '/' + file;
            if (typeof osmDirs[fullPath] !== 'object') { // arrays are objects
                osmDirs[fullPath] = [];
            }
            osmDirs[fullPath].push(longFilePath);
        }
        if (dirStat.len === dirStat.count) {
            cb(null, osmDirs)
        }
    });
}
