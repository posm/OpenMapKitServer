var aggregate = require('../helpers/aggregate-submissions');

/**
 * Aggregates together all of the survey submissions
 * that have been written to the file system together
 * as one JSON response.
 */
module.exports = function (req, res, next) {

    aggregate(req.params.formName, errorCallback, aggregateCallback);

    function errorCallback(err) {
        res.status(err.status).json(err);
    }

    function aggregateCallback(aggregate) {
        res.status(200).json(aggregate);
    }

};
