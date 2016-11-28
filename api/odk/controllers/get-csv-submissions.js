var aggregate = require('../helpers/aggregate-submissions');
var json2csv = require('json2csv');

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

        try {
            var csv = json2csv({
                data: aggregate,
                flatten: true
            });
            res
                .status(200)
                .set('Content-Type', 'text/csv')
                .send(csv);

        } catch (err) {
            res.status(500).json({
                status: 500,
                msg: 'We had a problem with converting JSON to CSV.',
                err: err
            });
        }

    }

};

