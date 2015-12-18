const router = require('express').Router({ mergeParams: true });
const FormSubmissionMiddleware = require('openrosa-form-submission-middleware');
const OpenRosaHeaders = require('openrosa-request-middleware');

const ProcessSubmission = require('./middlewares/process-submission');
const SaveMedia = require('./middlewares/save-media');

const saveForm = require('./controllers/save-form');
const getFormlist = require('./controllers/get-formlist');

const getSubmissionsList = require('./controllers/get-submissionslist');
const getJsonSubmissions = require('./controllers/get-json-submissions');
const getOsmSubmissions = require('./controllers/get-osm-submissions');
const uploadForm = require('./controllers/upload-form');

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

/**
 * XLSForm Upload Endpoint
 */

router.route('/upload-form').post(uploadForm);


module.exports = router;
