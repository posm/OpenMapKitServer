const router = require('express').Router({ mergeParams: true });
const getDeployments = require('./controllers/get-deployments');


/**
 * Retrieve the list of deployments areas of interest.
 */
router.route('/', getDeployments);

module.exports = router;
