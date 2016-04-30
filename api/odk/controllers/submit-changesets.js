var submitChangesets = require('../osm/submit-changesets');

module.exports = function (req, res, next) {
    var formName = req.params.formName;

    var osmApi = {
        server: req.query.server || req.body.server || 'https://www.openstreetmap.org/api',
        user: req.query.user || req.body.user,
        pass: req.query.pass || req.query.pass
    };

    submitChangesets(formName, osmApi, function (err, status) {
        if (err) {
            res.status(err.status || 500).json(err);
            return;
        }
        res.status(200).json(status);
    });

};
