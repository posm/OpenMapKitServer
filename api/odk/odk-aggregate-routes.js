var router = require('express').Router({ mergeParams: true });
var getSubmissionsList = require('./controllers/get-submissionslist');
var getJsonSubmissions = require('./controllers/get-json-submissions');
var getCsvSubmissions = require('./controllers/get-csv-submissions');
var getOsmSubmissions = require('./controllers/get-osm-submissions');
var getManifest = require('./controllers/get-manifest');
var getSubmissionAttachments = require('./controllers/get-submission-attachments');
var patchSubmissions = require('./controllers/patch-submissions');
var uploadForm = require('./controllers/upload-form');
var submitChangesets = require('./controllers/submit-changesets');

/**
 * Aggregate End Points
 */
router.route('/submissions').get(getSubmissionsList);
router.route('/submissions/:formName.json').get(getJsonSubmissions);
router.route('/submissions/:formName.csv').get(getCsvSubmissions);
router.route('/submissions/:formName.osm')
                .get(getOsmSubmissions)
                .patch(patchSubmissions);
router.route('/submissions/:formName.zip').get(getSubmissionAttachments);

/**
 * XLSForm Upload Endpoint
 */
router.route('/upload-form').post(uploadForm);

router.route('/manifest/:formName.xml').get(getManifest);

/**
 * Creates changesets for submissions and submits to
 * an OSM Editing API
 */
router.route('/submit-changesets/:formName')
                .get(submitChangesets)
                .put(submitChangesets);

module.exports = router;
