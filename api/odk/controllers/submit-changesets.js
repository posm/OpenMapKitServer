var submitAllChangesets = require('../osm/submit-changesets').submitAllChangesetsForForm;
var osmApi = require('../../../settings').osmApi;

module.exports = function (req, res, next) {
    var formName = req.params.formName;

    submitAllChangesets(formName, osmApi, function (err, status) {
        if (!res._headerSent) { // prevents trying to send multiple error responses on a single request
            if (err) {
                res.status(err.status || 500).json(err);
                return;
            }
            res.status(status.status || 200).json(status);
        } else {
            // notify via web socket
        }
    });

};
