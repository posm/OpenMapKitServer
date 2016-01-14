const router = require('express').Router({ mergeParams: true });
//const getDeployments = require('./controllers/get-deployments');
const getDeployment = require('./controllers/get-deployment');

const getDeployments = require('./controllers/get-deployments-refactor');

/**
 * Retrieve the list of deployment areas of interest.
 */
router.route('/').get(getDeployments);

/**
 * Retrieve meta-data for a given deployment.
 */
router.route('/:deployment').get(getDeployment);

module.exports = router;
