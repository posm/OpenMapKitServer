var fs = require('fs');
var path = require('path');
var mkdirp = require('mkdirp');

const { syncDataDir } = require('../helpers/aws-sync');
var settings = require('../../../settings.js');


module.exports = function(req, res, next) {
  var submission = req.submission;
  var ext = submission.geojson ? '.geojson' : '.json';
  var json = JSON.stringify(submission.json, null, '  ');
  var xml = submission.xml; // Original XML for debug purposes is nice.

  var dir = settings.dataDir + '/submissions/' + submission.formId + '/' + submission.instanceId;
  var jsonFileName = dir + '/data' + ext;
  var xmlFileName = dir + '/data' + '.xml';

  mkdirp(path.dirname(jsonFileName), function(err) {
    if (err) {
      console.error(err);
      res.status(500).json({status: 500, err: err});
      return;
    }
    fs.writeFile(xmlFileName, xml, function(err) {
      if (err) {
        console.error(err);
      }
    });
    fs.writeFile(jsonFileName, json, function(err) {
      if (err) {
        console.error(err);
        res.status(500).json({status: 500, err: err});
        return;
      }
      syncDataDir(
        path.join('submissions', submission.formId, submission.instanceId)
      );
      res.status(201).json({
        saved: jsonFileName
      });
    });
  });
};
