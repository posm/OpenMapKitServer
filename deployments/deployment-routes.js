const router = require('express').Router({ mergeParams: true });
const getDeployments = require('./controllers/deploymnents');

/**
 * Retrieve the list of deployment areas of interest.
 */
router.route('/').get(getDeployments.find);

/**
 * Retrieve meta-data for a given deployment.
 */
router.route('/:deployment').get(getDeployments.findOne);

module.exports = router;
