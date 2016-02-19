var router = require('express').Router({ mergeParams: true });
var FormSubmissionMiddleware = require('./middlewares/openrosa-form-submission-middleware');
var OpenRosaHeaders = require('./middlewares/openrosa-request-middleware');

var ProcessSubmission = require('./middlewares/process-submission');
var SaveMedia = require('./middlewares/save-media');

var saveForm = require('./controllers/save-form');
var getFormlist = require('./controllers/get-formlist');

var getSubmissionsList = require('./controllers/get-submissionslist');
var getJsonSubmissions = require('./controllers/get-json-submissions');
var getOsmSubmissions = require('./controllers/get-osm-submissions');
var patchSubmissions = require('./controllers/patch-submissions');
var uploadForm = require('./controllers/upload-form');

/**
 * OpenRosa Endpoints that ODK Collect uses.
 */

router.route('/formList')
    .all(OpenRosaHeaders())
    .get(getFormlist);

router.route('/submission')
    .all(FormSubmissionMiddleware())
    .post(ProcessSubmission())
    .post(SaveMedia({store: 'odk'}))
    .post(saveForm);

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
