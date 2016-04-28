var fs = require('fs');
var settings = require('../../../settings');
var aggregateOsm = require('../osm/aggregate-osm');

var getOsmSubmissionsFiles = require('../helpers/get-osm-submissions-files');

/**
 * Aggregates together all of the OSM submissions
 * from ODK Collect / OpenMapKit Android to the
 * file system for the given form.
 */
module.exports = function (req, res, next) {
    var formName = req.params.formName;

    getOsmSubmissionsFiles(formName, function (err, osmFiles) {
        if (err) {
            res.status(err.status || 500).json(err);
            return;
        }
        aggregate(osmFiles,  req, res);
    });

};

/**
 * Calls aggregate-osm middleware to read OSM edit files
 * and concatenate into a single OSM XML aggregation.
 *
 * @param osmFiles  - the JOSM OSM XML edits to aggregate
 * @param req       - the http request
 * @param res       - the http response
 */
function aggregate(osmFiles, req, res) {
    //We filter by the query parameters of the request
    aggregateOsm(osmFiles, req.query, function (err, osmXml) {
        if (err) {
            if (!res._headerSent) { // prevents trying to send multiple error responses on a single request
                res.status(500).json({
                    status: 500,
                    msg: 'There was a problem with aggregating OSM JOSM editor files in the submissions directory.',
                    err: err
                });
            }
            return;
        }
        res.set('Content-Type', 'text/xml').status(200).end(osmXml);
    });
}
