var submitAllChangesets = require('../osm/submit-changesets').submitAllChangesetsForForm;

module.exports = function (req, res, next) {
    var formName = req.params.formName;

    submitAllChangesets(formName, function (err, status) {
        if (!res._headerSent) { // prevents trying to send multiple error responses on a single request
            if (err) {
                res.status(err.status || 500).json(err);
                return;
            }
            res.status(status.status || 200).json(status);
        } else {
            // notify via web socket

            // log events
            if (err) {
                console.error(JSON.stringify(err));
                return;
            }
            if (status) {
                console.log(JSON.stringify(status));
            }
        }
    });

};
