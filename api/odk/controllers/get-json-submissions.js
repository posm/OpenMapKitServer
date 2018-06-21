var aggregate = require('../helpers/aggregate-submissions');

/**
 * Aggregates together all of the survey submissions
 * that have been written to the file system together
 * as one JSON response.
 */
module.exports = function (req, res, next) {
  return aggregate({
    formName: req.params.formName,
    limit: req.query.limit,
    offset: req.query.offset,
    startDate: req.query.start_date,
    endDate: req.query.end_date,
    deviceId: req.query.deviceId,
    username: req.query.username
  }, (err, aggregate) => {
    if (err) {
      console.warn(err.stack);
      return res.status(err.status).json(err);
    }

    return res.status(200).json(aggregate);
  });
};
