const router = require('express').Router({ mergeParams: true });
const getAoiList = require('./controllers/get-aoi-list');


/**
 * Retrieve the list of deployment areas of interest.
 */
router.route('/', getAoiList);
router.route('/aois', getAoiList);

module.exports = router;
