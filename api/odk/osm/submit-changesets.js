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
        createAndSubmitChangesets(osmDirs, osmApi, cb);
    });
};

function createAndSubmitChangesets(osmDirs, osmApi, cb) {
    async.forEachOfLimit(osmDirs, NUM_PARALLEL_SUBMISSIONS, createChangesetAndOsc, function (err) {
        if (err) {
            cb(err);
            return;
        }
        cb(null, {done: true}); // or something. gotta do status work
    });

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
        changesetCreate(osmApi, changesetXml, function(err, changesetId) {
            if (err) {
                cb(err);
                return;
            }
            osm2osc(osmFiles, function (err, oscXml) {
                if (err) {
                    cb(err);
                    return;
                }
                changesetUpload(osmApi, oscXml, function(err, diffResult) {
                    if (err) {
                        cb(err);
                        return;
                    }
                    // is there anything we should be doing with the diffResult?
                    changesetClose(osmApi, function (err) {
                        cb();
                    });
                });
                cb();
            });
        });
    }
}

function changesetCreate(osmApi, changesetXml, cb) {
    var opts = {
        method: 'PUT',
        headers: {'Content-Type': 'text/xml'},
        uri: osmApi.server + '/0.6/changeset/create',
        auth: {
            user: osmApi.user,
            pass: osmApi.pass
        },
        body: changesetXml
    };

    request(opts, function (err, response, body) {
        if (err) {
            cb(err);
            return;
        }
        if (response.statusCode !== 200) {
            cb({
                status: response.statusCode,
                body: body,
                msg: 'Could not open changeset on OSM API. ' + body
            });
            return;
        }
        var changesetId = parseInt(body);
        cb(null, changesetId);
    });
}

function changesetUpload(osmApi, oscXml, cb) {
    
}

function changesetClose(osmApi, cb) {
    
}
