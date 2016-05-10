var fs = require('fs');
var request = require('request');
var async = require('async');
var getOsmSubmissionsDirs = require('../helpers/get-osm-submissions-dirs');
var generateChangeset = require('../osm/generate-changeset');
var osm2osc = require('../osm/osm2osc');

var NUM_PARALLEL_SUBMISSIONS = 3;

module.exports = {
    submitAllChangesetsForForm: submitAllChangesetsForForm,
    createAndSubmitChangesets: createAndSubmitChangesets
};

/**
 * Submits all of the OSM files in a form's submissions directory
 * that have not yet been submitted.
 * 
 * @param formName - the name of the form (form_id)
 * @param osmApi   - OSM API endpoint and credentials
 * @param cb       - callback with error or status
 */
function submitAllChangesetsForForm(formName, osmApi, cb) {
    getOsmSubmissionsDirs(formName, {unsubmittedOnly: true}, function (err, osmDirs) {
        if (err) {
            cb(err);
            return;
        }
        createAndSubmitChangesets(osmDirs, osmApi, cb);
    });
}

function createAndSubmitChangesets(osmDirs, osmApi, cb) {
    // if case no callback is supplied, noop
    if (typeof cb !== 'function') {
        cb = function() {};
    }

    if (Object.keys(osmDirs).length < 1) {
        cb(null, {
            done: true,
            msg: 'There are no OSM files to submit. Skipping creating and submitting changesets.',
            status: 200
        });
        return;
    }

    async.forEachOfLimit(osmDirs, NUM_PARALLEL_SUBMISSIONS, createChangesetAndOsc, function (err) {
        if (err) {
            cb(err);
            return;
        }
        cb(null, {
            done: true,
            msg: 'Completed submitting changeset to OSM.'
        });
    });
    cb(null, {
        started: true,
        msg: 'Began creating and submitting changesets to OSM API.',
        status: 201
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
                cb({
                    status: err.status,
                    msg: 'Error creating changeset.',
                    err:err
                });
                return;
            }
            osm2osc(osmFiles, changesetId, function (err, oscXml, changesetId) {
                if (err) {
                    cb(err);
                    return;
                }
                changesetUpload(osmApi, changesetId, oscXml, function(err, diffResult, changesetId) {
                    // This isn't truly an error state. Conflicts are common and normal.
                    if (err) {
                        saveConflict(submissionsDir, err);
                        cb();
                        return;
                    }

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
        console.log('Opened Changeset. ID: ' + changesetId + ' - ' + opts.uri);
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
        cb(null, body, changesetId);
        console.log('Uploaded OSC. ID: ' + changesetId + ' - ' + opts.uri);
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
        console.log('Closed Changeset. ID: ' + changesetId + ' - ' + opts.uri);
    });
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

function saveConflict(submissionsDir, err) {
    var jsonStr = JSON.stringify(err, null, 2);
    fs.writeFile(submissionsDir + '/conflict.json', jsonStr, function (err) {
        // do nothing
    });
    console.log('Conflict uploading changeset. - ' + JSON.stringify(err));
}
