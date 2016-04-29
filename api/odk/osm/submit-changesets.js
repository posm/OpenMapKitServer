var async = require('async');
var getOsmSubmissionsDirs = require('../helpers/get-osm-submissions-dirs');

var NUM_PARALLEL_SUBMISSIONS = 4;

module.exports = function (formName, osmApi, cb) {
    getOsmSubmissionsDirs(formName, function (err, osmDirs) {
        if (err) {
            cb(err);
            return;
        }
        createAndSubmitChangesets(osmDirs, cb);
    });
};

function createAndSubmitChangesets(osmDirs, cb) {
    var dirs = Object.keys(osmDirs);

    // async.eachLimit(dirs, PARALLEL_SUBMISSIONS, function (dir, cb) {
    //
    // }, function ());


    async.forEachOfLimit(osmDirs, NUM_PARALLEL_SUBMISSIONS, function (osmFiles, submissionsDir, cb) {
        createChangeset(osmFiles, submissionsDir, cb);
    }, function (err) {

    });
}

function createChangeset(osmFiles, submissionsDir, cb) {
    
}

function createOsc() {

}

