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
var deleteForm = require('./controllers/delete-form');
var archiveForm = require('./controllers/archive-form');

/**
 * Aggregate End Points
 */
var adminDVPermission = require('permission')(['admin', 'data-viewer']);
var adminPermission = require('permission')(['admin']);

router.route('/submissions').get(getSubmissionsList);
router.route('/submissions/:formName.json').get(adminDVPermission, getJsonSubmissions);
router.route('/submissions/:formName.csv').get(adminDVPermission, getCsvSubmissions);
router.route('/submissions/:formName.osm')
  .get(adminDVPermission, getOsmSubmissions)
  .patch(patchSubmissions);
router.route('/submissions/:formName.zip').get(adminDVPermission, getSubmissionAttachments);

/**
 * XLSForm Upload Endpoint
 */
router.route('/upload-form').post(adminPermission, uploadForm);

router.route('/manifest/:formName.xml').get(getManifest);

/**
 * Form Delete/Archive Endpoint
 */

 router.route('/forms/:formName/delete').post(adminPermission, deleteForm);
 router.route('/forms/:formName/archive').post(adminPermission, archiveForm);

/**
 * Creates changesets for submissions and submits to
 * an OSM Editing API
 */
router.route('/submit-changesets/:formName')
  .get(adminPermission, submitChangesets)
  .put(adminPermission, submitChangesets);

module.exports = router;
