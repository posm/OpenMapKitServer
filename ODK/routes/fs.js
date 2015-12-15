const router = require('express').Router({ mergeParams: true });
const FormSubmissionMiddleware = require('openrosa-form-submission-middleware');
const OpenRosaHeaders = require('openrosa-request-middleware');

const ProcessSubmission = require('../middlewares/process-submission');
const SaveMedia = require('../middlewares/save-media');

const saveForm = require('../controllers/fs/save-form-fs');
const getFormlist = require('../controllers/fs/get-formlist-fs');

const getSubmissionsList = require('../controllers/fs/get-submissionslist-fs');
const getJsonSubmissions = require('../controllers/fs/get-json-submissions-fs');
const getOsmSubmissions = require('../controllers/fs/get-osm-submissions-fs');
const uploadForm = require('../controllers/fs/upload-form-fs');

/**
 * OpenRosa Endpoints that ODK Collect uses.
 */

router.route('/formList')
    .all(OpenRosaHeaders())
    .get(getFormlist);

router.route('/submission')
    .all(FormSubmissionMiddleware())
    .post(ProcessSubmission())
    .post(SaveMedia({store: 'fs'}))
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
