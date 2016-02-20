var router = require('express').Router({ mergeParams: true });
var FormSubmissionMiddleware = require('./middlewares/openrosa-form-submission-middleware');
var OpenRosaHeaders = require('./middlewares/openrosa-request-middleware');

var ProcessSubmission = require('./middlewares/process-submission');
var SaveMedia = require('./middlewares/save-media');

var saveForm = require('./controllers/save-form');
var getFormlist = require('./controllers/get-formlist');

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

module.exports = router;
