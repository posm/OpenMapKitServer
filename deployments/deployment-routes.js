const router = require('express').Router({ mergeParams: true });
const getDeployments = require('./controllers/deployments');

/**
 * Retrieve the list of deployment areas of interest.
 */
router.route('/').get(getDeployments.getAll);

/**
 * Retrieve meta-data for a given deployment.
 */
router.route('/:deployment').get(getDeployments.get);

module.exports = router;
