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
  fs.readFile(filePath, (err, data) => {
    if (err) {
      console.log(err);
      return res.status(err.status).json(err);
    }
    if (req.params.file.endsWith('csv')) {
      return res.status(200).set('Content-Type', 'text/csv').send(data);
    }
    if (req.params.file.endsWith('json')) {
      return res.status(200).json(JSON.parse(data));
    }
    if (req.params.file.endsWith('xml') || req.params.file.endsWith('osm')) {
      return res.set('Content-Type', 'application/xml').status(200).send(data);
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
  var adminPermission = require('permission')(['admin']);
  router.route('/:prefix/:formName/:submission/:file').get(adminDVPermission, getFile);
}
// /forms/* URL endpoint
router.route('/:prefix/:file').get(getFile);

module.exports = router;
