var aggregateOsm = require('../osm/aggregate-osm');
var getOsmSubmissionsDirs = require('../helpers/get-osm-submissions-dirs');
var osmtogeojson = require('osmtogeojson');
var DOMParser = require("xmldom").DOMParser;
/**
 * Aggregates together all of the OSM submissions
 * from ODK Collect / OpenMapKit Android to the
 * file system for the given form.
 */
module.exports = function(req, res, next) {
  var formName = req.params.formName;
  var filters = {
    deviceId: req.query.deviceId,
    username: req.query.username,
    startDate: req.query.start_date,
    endDate: req.query.end_date,
    offset: req.query.offset,
    limit: req.query.limit
  };

  getOsmSubmissionsDirs(formName, {
    filters: filters
  }, function(err, osmDirs) {
    if (err) {
      res.status(err.status || 500).json(err);
      return;
    }
    aggregate(osmDirs, req, res);
  });

};

/**
 * Calls aggregate-osm middleware to read OSM edit files
 * and concatenate into a single OSM XML aggregation.
 *
 * @param osmDirs  - submission dirs with array of osm files
 * @param req       - the http request
 * @param res       - the http response
 */
function aggregate(osmDirs, req, res) {
  var osmFiles = [];
  for (var i in osmDirs) {
    osmFiles = osmFiles.concat(osmDirs[i].files);
  }
  if (req.query.offset != null) {
    var offset = parseInt(req.query.offset);
    var limit = parseInt(req.query.limit);
    osmFiles = osmFiles.slice(offset, offset + limit);
  }
  //We filter by the query parameters of the request
  aggregateOsm(osmFiles, req.query, function(err, osmXml) {
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
    var xmlObj = (new DOMParser()).parseFromString(osmXml, 'text/xml');
    res.status(200).json(osmtogeojson(xmlObj));
  });
}
