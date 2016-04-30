var request = require('request');
var async = require('async');
var getOsmSubmissionsDirs = require('../helpers/get-osm-submissions-dirs');
var generateChangeset = require('../osm/generate-changeset');
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
    async.forEachOfLimit(osmDirs, NUM_PARALLEL_SUBMISSIONS, createChangesetAndOsc, function (err) {
        if (err) {
            cb(err);
            return;
        }
        cb(null, {done: true}); // or something. gotta do status work
    });
}

/**
 * These params are essentially the object value and key of osmDirs.
 * This is done behind the scenes of async#forEachOfLimit.
 *
 * @param osmFiles
 * @param submissionsDir
 * @param cb
 */
function createChangesetAndOsc(osmFiles, submissionsDir, cb) {
    var changesetXml = generateChangeset(submissionsDir);
    changesetCreate(changesetXml, function(err, changesetId) {
        if (err) {
            cb(err);
            return;
        }
        osm2osc(osmFiles, function (err, oscXml) {
            if (err) {
                cb(err);
                return;
            }
            changesetUpload(oscXml, function(err, diffResult) {
                if (err) {
                    cb(err);
                    return;
                }
                // is there anything we should be doing with the diffResult?
                changesetClose(function (err) {
                    cb();
                });
            });
            cb();
        });
    });

}

function changesetCreate(changesetXml, cb) {
    
}

function changesetUpload(oscXml, cb) {
    
}

function changesetClose(cb) {
    
}
