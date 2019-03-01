var aggregateOsm = require('../osm/aggregate-osm-to-geojson');
var getOsmSubmissionsDirs = require('../helpers/get-osm-submissions-dirs');
var aggregateSubmissions = require('../helpers/aggregate-submissions');
var osmtogeojson = require('osmtogeojson');
var point = require('turf-point');
var featureCollection = require("turf-featurecollection");
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
    return aggregate(osmDirs, req, res, filters);
  });
};

function aggregateODKjson(formName, filters, res) {
  filters.formName = formName;
  aggregateSubmissions(
    filters,
    (err, data) => {
      if (err) {
        console.warn(err.stack);
        res.status(err.status).json(err);
      } else {
        const fc = featureCollection(
          data.map(i => {
            const coords = [i.gps_location.longitude, i.gps_location.latitude];
            delete i['gps_location'];
            return point(coords, i);
          })
        );
        return res.status(200).json(fc);
      }
    }
  );
}

/**
 * Calls aggregate-osm middleware to read OSM edit files
 * and concatenate into a single OSM XML aggregation.
 *
 * @param osmDirs  - submission dirs with array of osm files
 * @param req       - the http request
 * @param res       - the http response
 */
function aggregate(osmDirs, req, res, filters) {
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
    var geojson = osmtogeojson(xmlObj);
    if (geojson && geojson.features && geojson.features.length) {
      geojson.features.map((feature, n) =>
        Object.keys(geojson.features[n].properties).map(key => {
          try {
            geojson.features[n].properties[key] = JSON.parse(geojson.features[n].properties[key]);
          } catch(err) {}
        })
      );
    return res.status(200).json(geojson);
    } else {
      return aggregateODKjson(req.params.formName, filters, res);
    }
  });
}
