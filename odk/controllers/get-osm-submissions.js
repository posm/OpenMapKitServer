const fs = require('fs');
const settings = require('../../settings');
const aggregateOsm = require('../middlewares/aggregate-osm');

/**
 * Aggregates together all of the OSM submissions
 * from ODK Collect / OpenMapKit Android to the
 * file system for the given form.
 */
module.exports = function (req, res, next) {
    const formName = req.params.formName;
    if (typeof formName === 'undefined' || formName === null) {
        res.status(400).json({
            status: 400,
            err: 'MISSING_PARAM',
            msg: 'You must specify a parameter for the formName in this end point.',
            path: '/odk/submissions/:formName.osm'
        });
    }
    const dir = settings.publicDir + '/submissions/' + formName;
    const osmFiles = [];

    // All of the submission dirs in the form directory
    fs.readdir(dir, function (err, submissionDirs) {
        if (err) {
            res.status(500).json({
                status: 500,
                msg: 'Problem reading submissionDirs.',
                err: err
            });
        }
        const len = submissionDirs.length;
        if (len === 0) {
            res.status(200).json([]);
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
                    aggregate(osmFiles, req, res);
                }
                continue;
            }
            findOsmFilesInDir(dirStat, osmFiles, req, res);
        }
    });
};

/**
 * Reads through all of the files in a submission directory and
 * appends the full OSM file path to the osmFiles array.
 *
 * @param dirStat  - the counters and paths of the directory we are async iterating through
 * @param osmFiles - all of the osm files we've found so far
 * @param req      = the http request
 * @param res      - the http response that needs to get resolved
 */
function findOsmFilesInDir(dirStat, osmFiles, req, res) {
    var fullPath = dirStat.fullPath;
    fs.readdir(dirStat.fullPath, function (err, files) {
        ++dirStat.count;
        for (var j = 0, len = files.length; j < len; j++) {
            var file = files[j];
            if (file.substring(file.length - 4) !== '.osm') continue; // Check if .osm file
            var longFilePath = fullPath + '/' + file;
            osmFiles.push(longFilePath);
        }
        if (dirStat.len === dirStat.count) {
            aggregate(osmFiles, req, res);
        }
    });
}

/**
 * Calls aggregate-osm middleware to read OSM edit files
 * and concatenate into a single OSM XML aggregation.
 *
 * @param osmFiles  - the JOSM OSM XML edits to aggregate
 * @param req       - the http request
 * @param res       - the http response
 */
function aggregate(osmFiles, req, res) {
    aggregateOsm(osmFiles, null, function (err, osmXml) {
        if (err) {
            res.status(500).json({
                status: 500,
                msg: 'There was a problem with aggregating OSM JOSM editor files in the submissions directory.',
                err: err
            });
            return;
        }
        res.set('Content-Type', 'text/xml').status(200).end(osmXml);
    });
}

/**
 * Reads an array of OSM files and concatenates the contents
 * into one large OSM file.
 *
 * @param files - full path to OSM files
 * @param res - the http response that needs to get resolved
 */
function concatOsm(files, res) {
    const firstFile = files.shift();
    fs.readFile(firstFile, 'utf-8', function (err, data) {
        if (err) {
            res.status(500).json(err);
            return;
        }
        var osmAggregation = data.replace('</osm>', '');

        var numFilesLeft = files.length;
        var nextFile = files.shift();
        while (nextFile) {
            fs.readFile(nextFile, 'utf-8', function (err, data) {
                if (err) {
                    res.status(500).json(err);
                    return;
                }
                --numFilesLeft;
                var osmFile = data.replace('</osm>', '');

                /**
                 * Finding the index of the first node, way, relation tag.
                 */
                var startIdx = osmFile.indexOf('<node');
                var wayIdx = osmFile.indexOf('<way');
                var relationIdx = osmFile.indexOf('<relation');

                if (wayIdx !== -1 && wayIdx < startIdx) {
                    startIdx = wayIdx;
                }
                if (relationIdx !== -1 && relationIdx < startIdx) {
                    startIdx = relationIdx;
                }

                var innerOsmElements = osmFile.slice(startIdx);
                osmAggregation += innerOsmElements;

                if (numFilesLeft === 0) {
                    osmAggregation += '</osm>';
                    res.set('Content-Type', 'text/xml').status(200).end(osmAggregation);
                }
            });
            nextFile = files.shift();
        }

    });
}
