'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

const async = require('async');
const mkdirp = require('mkdirp');
const multiparty = require('multiparty');
const mv = require('mv');
const PythonShell = require('python-shell');
const tempy = require('tempy');

const settings = require('../../../settings');
const { syncDataDir } = require('../helpers/aws-sync');

/**
 * User uploads mbtiles, osm or geojson files to a deployment folder
 */
module.exports = function (req, res, next) {
  const allowedExtensions = ['.geojson', '.json', '.osm', '.mbtiles'];
  const deploymentDir = path.join(settings.dataDir, 'deployments', req.params.deployment);

  var form = new multiparty.Form();
  var size = '';
  var fileName = '';
  form.on('part', function(part){
    if(!part.filename) return;
    size = part.byteCount;
    fileName = part.filename;
  });
  form.on('file', function(name,file){
    if (allowedExtensions.includes(path.extname(file.originalFilename).toLowerCase())) {
      var targetPath = path.join(deploymentDir, file.originalFilename);
      fs.copyFile(file.path, targetPath, (err) => {
        if (err) {
          if (fs.statSync(file.path)) {
            fs.unlinkSync(file.path);
          }
          return res.status(400).json({
            status: 400,
            msg: `Error when copying ${file.originalFilename}.`
          });
        }
        if (fs.statSync(file.path)) {
          fs.unlinkSync(file.path);
        }
        return res.status(201).json({
          status: 201,
          msg: `File correctly uploaded to ${req.params.deployment}.`
        });
      });
    } else {
      if (fs.statSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      return res.status(400).json({
        status: 400,
        msg: `The extension of the file ${file.originalFilename} is not allowed to be uploaded to deployments.`
      });
    }
  });
  form.parse(req);
};
