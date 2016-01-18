const fs = require('fs');
const settings = require('../../settings');

/**
 * Aggregates together all of the survey submissions
 * that have been written to the file system together
 * as one JSON response.
 */
module.exports = function (req, res, next) {
    const formName = req.params.formName;
    if (typeof formName === 'undefined' || formName === null) {
        res.status(400).json({
            status: 400,
            err: 'MISSING_PARAM',
            msg: 'You must specify a parameter for the formName in this end point.',
            path: '/odk/submissions/:formName.json'
        });
        return;
    }
    const dir = settings.publicDir + '/submissions/' + formName;
    const aggregate = [];

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
        const len = submissionDirs.length;
        if (submissionDirs.length === 0) {
            res.status(200).json([]);
            return;
        }
        var count = 0;
        for (var i = 0; i < len; i++) {
            var submissionDir = submissionDirs[i];
            if (submissionDir[0] === '.') {
                ++count;
                if (len === count) {
                    res.status(200).json(aggregate);
                }
                continue;
            }
            var dataFile = dir + '/' + submissionDir + '/data.json';
            fs.readFile(dataFile, function (err, data) {
                ++count;
                if (err) {
                    res.status(500).json({
                        status: 500,
                        msg: 'Problem reading data.json file in submission directory. dataFile: ' + dataFile,
                        err: err
                    });
                    return;
                }
                const dataObj = JSON.parse(data);
                aggregate.push(dataObj);
                if (len === count) {
                    res.status(200).json(aggregate);
                }
            });
        }
    });
};
