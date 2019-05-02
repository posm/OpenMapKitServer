var router = require('express').Router({ mergeParams: true });
var fs = require('fs');
var settings = require('../../settings');


function getFile(req, res, next) {
  var filePath;
  if (req.params.prefix === 'forms') {
    filePath = `${settings.dataDir}/${req.params.prefix}/${req.params.file}`;
  }
  if (req.params.prefix === 'submissions') {
    filePath = `${settings.dataDir}/${req.params.prefix}/${req.params.formName}/${req.params.submission}/${req.params.file}`;
  }
  if (req.params.prefix === 'deployments') {
    filePath = `${settings.dataDir}/${req.params.prefix}/${req.params.deployment}/${req.params.file}`;
  }
  fs.readFile(filePath, (err, data) => {
    if (err) {
      console.log(err);
      return res.status(404).json({detail: `Form ${req.params.file} not found`});
    }
    if (req.params.file.endsWith('csv')) {
      return res.status(200).set('Content-Type', 'text/csv').send(data);
    }
    if (req.params.file.endsWith('json')) {
      try {
        const jsonData = JSON.parse(data);
        return res.status(200).json(jsonData);
      } catch (e) {
        return res.status(200).json(data);
      }
    }
    if (req.params.file.endsWith('xml') || req.params.file.endsWith('osm')) {
      return res.set('Content-Type', 'application/xml').status(200).send(data);
    }
    if (req.params.file.endsWith('mbtiles')) {
      return res.set('Content-Type', 'application/vnd.mapbox-vector-tile').status(200).send(data);
    }
    if (req.params.file.endsWith('jpg') || req.params.file.endsWith('jpg')) {
      return res.set('Content-Type', 'image/jpeg').status(200).send(data);
    }
    if (req.params.file.endsWith('png')) {
      return res.set('Content-Type', 'image/png').status(200).send(data);
    }
    if (req.params.file.endsWith('xlsx')) {
      return res.set(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ).status(200).send(data);
    }
  });
}

var disableAuth = process.env.DISABLE_AUTH == 1 || process.env.DISABLE_AUTH == 'true';
if (disableAuth) {
  router.route('/:prefix/:formName/:submission/:file').get(getFile);
} else {
  var adminDVPermission = require('permission')(['admin', 'data-viewer']);
  router.route('/:prefix/:formName/:submission/:file').get(adminDVPermission, getFile);
}
// /forms/* URL endpoint
router.route('/:prefix/:file').get(getFile);
router.route('/:prefix/:deployment/:file').get(getFile);

module.exports = router;
