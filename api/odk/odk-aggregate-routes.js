var router = require('express').Router({ mergeParams: true });
var getSubmissionsList = require('./controllers/get-submissionslist');
var getJsonSubmissions = require('./controllers/get-json-submissions');
var getOsmSubmissions = require('./controllers/get-osm-submissions');
var patchSubmissions = require('./controllers/patch-submissions');
var uploadForm = require('./controllers/upload-form');

/**
 * Aggregate End Points
 */
router.route('/submissions').get(getSubmissionsList);
router.route('/submissions/:formName.json').get(getJsonSubmissions);
router.route('/submissions/:formName.osm').get(getOsmSubmissions);
router.route('/submissions/:formName.osm').patch(patchSubmissions);

/**
 * XLSForm Upload Endpoint
 */
router.route('/upload-form').post(uploadForm);

module.exports = router;
