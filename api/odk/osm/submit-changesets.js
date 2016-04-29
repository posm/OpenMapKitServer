var async = require('async');
var getOsmSubmissionsDirs = require('../helpers/get-osm-submissions-dirs');
var osm2osc = require('../osm/osm2osc');

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
    async.forEachOfLimit(osmDirs, NUM_PARALLEL_SUBMISSIONS, createChangesetAndOsc, function (err, changeset, osc) {
        if (err) {
            cb(err);
            return;
        }
        submitChangeset(changeset, osc, cb);
    });
}

function createChangesetAndOsc(osmFiles, submissionsDir, cb) {

    osm2osc(osmFiles, function (err, oscXmlStr) {

    });

}

function submitChangeset(changeset, osc, cb) {

}
