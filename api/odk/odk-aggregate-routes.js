var router = require('express').Router({ mergeParams: true });
var getSubmissionsList = require('./controllers/get-submissionslist');
var getGeoJsonSubmissions = require('./controllers/get-geojson-submissions');
var getJsonSubmissions = require('./controllers/get-json-submissions');
var getCsvSubmissions = require('./controllers/get-csv-submissions');
var getCsvFeaturesSubmissions = require('./controllers/get-csv-features-submissions');
var getOsmSubmissions = require('./controllers/get-osm-submissions');
var getManifest = require('./controllers/get-manifest');
var getSubmissionAttachments = require('./controllers/get-submission-attachments');
var patchSubmissions = require('./controllers/patch-submissions');
var uploadForm = require('./controllers/upload-form');
var submitChangesets = require('./controllers/submit-changesets');
var deleteForm = require('./controllers/delete-form');
var archiveForm = require('./controllers/archive-form');
var restoreForm = require('./controllers/restore-form');
var archivedForms = require('./controllers/archived-form-list');
var createDeploymentFolder = require('./controllers/create-deployment-folder');

/**
 * Aggregate End Points
 */
var disableAuth = process.env.DISABLE_AUTH == 1 || process.env.DISABLE_AUTH == 'true';
if (disableAuth) {
  router.route('/submissions/:formName.json').get(getJsonSubmissions);
  router.route('/submissions/:formName.csv').get(getCsvSubmissions);
  router.route('/submissions/:formName.osm')
    .get(getOsmSubmissions)
    .patch(patchSubmissions);
  router.route('/submissions/:formName.geojson').get(getGeoJsonSubmissions);
  router.route('/submissions/:formName.zip').get(getSubmissionAttachments);
  router.route('/submissions/features/:formName.csv').get(getCsvFeaturesSubmissions);
  router.route('/upload-form').post(uploadForm);
  router.route('/archived-forms').get(archivedForms);
  router.route('/submit-changesets/:formName')
    .get(submitChangesets)
    .put(submitChangesets);
  router.route('/forms/:formName/delete').post(deleteForm);
  router.route('/forms/:formName/archive').post(archiveForm);
  router.route('/forms/:formName/restore').post(restoreForm);
} else {
  var adminDVPermission = require('permission')(['admin', 'data-viewer']);
  var adminPermission = require('permission')(['admin']);
  router.route('/submissions/:formName.json').get(adminDVPermission, getJsonSubmissions);
  router.route('/submissions/:formName.csv').get(adminDVPermission, getCsvSubmissions);
  router.route('/submissions/:formName.osm')
    .get(adminDVPermission, getOsmSubmissions)
    .patch(patchSubmissions);
    router.route('/submissions/:formName.geojson').get(adminDVPermission, getGeoJsonSubmissions);
  router.route('/submissions/:formName.zip').get(adminDVPermission, getSubmissionAttachments);
  router.route('/submissions/features/:formName.csv').get(adminDVPermission, getCsvFeaturesSubmissions);
  router.route('/upload-form').post(adminPermission, uploadForm);
  router.route('/archived-forms').get(adminPermission, archivedForms);
  router.route('/forms/:formName/delete').post(adminPermission, deleteForm);
  router.route('/forms/:formName/archive').post(adminPermission, archiveForm);
  router.route('/forms/:formName/restore').post(adminPermission, restoreForm);
  router.route('/submit-changesets/:formName')
    .get(adminPermission, submitChangesets)
    .put(adminPermission, submitChangesets);
  router.route('/deployments').post(adminPermission, createDeploymentFolder);
}

router.route('/manifest/:formName.xml').get(getManifest);

module.exports = router;
