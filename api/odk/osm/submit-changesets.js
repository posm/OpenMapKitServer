var fs = require('fs');
var request = require('request');
var async = require('async');
var getOsmSubmissionsDirs = require('../helpers/get-osm-submissions-dirs');
var generateChangeset = require('../osm/generate-changeset');
var osm2osc = require('../osm/osm2osc');
var osmApi = require('../../../settings').osmApi;

var NUM_PARALLEL_SUBMISSIONS = 3;

module.exports = {
    submitAllChangesetsForForm: submitAllChangesetsForForm,
    createAndSubmitChangesets: createAndSubmitChangesets
};

var q = async.queue(function (osmDir, cb) {
    createChangesetAndOsc(osmApi, osmDir.dir, osmDir.files, cb);
}, NUM_PARALLEL_SUBMISSIONS);


q.drain = function() {
    console.log('All changesets in the queue have been submitted.');
};


/**
 * Submits all of the OSM files in a form's submissions directory
 * that have not yet been submitted.
 * 
 * @param formName - the name of the form (form_id)
 * @param cb       - callback with error or status
 */
function submitAllChangesetsForForm(formName, cb) {
    getOsmSubmissionsDirs(formName, {unsubmittedOnly: true}, function (err, osmDirs) {
        if (err) {
            cb(err);
            return;
        }
        createAndSubmitChangesets(osmDirs, cb);
    });
}

function createAndSubmitChangesets(osmDirs, cb) {

    if (typeof cb !== 'function') {
        cb = function(err) {
            if (err) {
                console.error('Automatic OMK submission OSM API error. ' + JSON.stringify(err));
            }
        };
    }

    if (osmDirs.length < 1) {
        cb(null, {
            done: true,
            msg: 'There are no OSM files to submit. Skipping creating and submitting changesets.',
            status: 200
        });
        return;
    }

    q.push(osmDirs, function (err) {
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

}

function createChangesetAndOsc(osmApi, submissionsDir, osmFiles, cb) {
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
                    saveConflict(submissionsDir, err, changesetId);
                    cb();
                    return;
                }

                // Saving the diffResult to the submissions dir
                saveDiffResult(submissionsDir, diffResult, changesetId);

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
            cb(err, null, changesetId);
            return;
        }
        if (response.statusCode !== 200) {
            cb({
                status: response.statusCode,
                body: body,
                msg: 'Could not upload changeset on OSM API. ' + body
            }, null, changesetId);
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
function saveDiffResult(submissionsDir, diffResult, changesetId) {
    fs.writeFile(submissionsDir + '/diffResult-' + changesetId + '.xml', diffResult, function (err) {
        // do nothing
    });
}

function saveConflict(submissionsDir, err, changesetId) {
    var jsonStr = JSON.stringify(err, null, 2);
    fs.writeFile(submissionsDir + '/conflict-' + changesetId + '.json', jsonStr, function (err) {
        // do nothing
    });
    console.log('Conflict uploading changeset. - ' + JSON.stringify(err));
}
