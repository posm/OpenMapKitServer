const router = require('express').Router({ mergeParams: true });
const FormSubmissionMiddleware = require('openrosa-form-submission-middleware');
const OpenRosaHeaders = require('openrosa-request-middleware');

const ProcessSubmission = require('../middlewares/process-submission');
const SaveMedia = require('../middlewares/save-media');

const saveForm = require('../controllers/fs/save-form-fs');
const getFormlist = require('../controllers/fs/get-formlist-fs');


router.route('/formList')
    .all(OpenRosaHeaders())
    .get(getFormlist);

router.route('/submission')
    .all(FormSubmissionMiddleware())
    .post(ProcessSubmission())
    .post(SaveMedia({store: 'fs'}))
    .post(saveForm);

module.exports = router;
