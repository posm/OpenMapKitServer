var fs = require('fs');
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
        createAndSubmitChangesets(formName, osmDirs, osmApi, cb);
    });
};

function createAndSubmitChangesets(formName, osmDirs, osmApi, cb) {
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
            osm2osc(osmFiles, changesetId, function (err, oscXml, changesetId) {
                if (err) {
                    cb(err);
                    return;
                }
                changesetUpload(osmApi, changesetId, oscXml, function(err, diffResult, changesetId) {
                    if (err) {
                        cb(err);
                        return;
                    }

                    // Update the black list with all of the SHA-1 file names
                    // of OSM files that have sucessfully been uploaded to OSM.
                    updateBlackList(formName, osmFiles);

                    // Saving the diffResult to the submissions dir
                    saveDiffResult(submissionsDir, diffResult);

                    changesetClose(osmApi, changesetId, function (err) {
                        if (err) {
                            cb(err);
                            return;
                        }
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

function changesetUpload(osmApi, changesetId, oscXml, cb) {
    var opts = {
        method: 'POST',
        headers: {'Content-Type': 'text/xml'},
        uri: osmApi.server + '/0.6/changeset/' + changesetId + '/upload',
        auth: {
            user: osmApi.user,
            pass: osmApi.pass
        },
        body: oscXml
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
                msg: 'Could not upload changeset on OSM API. ' + body
            });
            return;
        }
        // NH TODO: Check to see if we ever try and cb something that is not a diffResult
        cb(null, body, changesetId);
    });
}

function changesetClose(osmApi, changesetId, cb) {
    var opts = {
        method: 'PUT',
        headers: {'Content-Type': 'text/xml'},
        uri: osmApi.server + '/0.6/changeset/' + changesetId + '/close',
        auth: {
            user: osmApi.user,
            pass: osmApi.pass
        }
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
                msg: 'Could not close changeset on OSM API. ' + body
            });
            return;
        }
        cb();
    });
}

/**
 * This is using our existing blacklist hash mechanism to determine if the submission
 * OSM XML files indeed were submitted. We are getting the SHA-1 checksum hash of the
 * file directly from the file name.
 */
function updateBlackList(formName, osmFiles) {
    
}

/**
 * Saving the diff result can be helpful to not only keep track that the submission
 * has been successfully submitted, but also to see how IDs potentially have been
 * rewritten.
 */
function saveDiffResult(submissionsDir, diffResult) {
    fs.writeFile(submissionsDir + '/diffResult.xml', diffResult, function (err) {
        // do nothing
    });
}
