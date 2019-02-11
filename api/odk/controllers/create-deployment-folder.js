const path = require('path');
var fs = require('fs');

var settings = require('../../../settings.js');


module.exports = (req, res, next) => {
  if (req.body && req.body.name && !/[^a-zA-Z0-9\-\/]/.test(req.body.name)) {
    const newDir = path.join(settings.dataDir, 'deployments', req.body.name);

    fs.mkdir(newDir, {recursive: true}, mkdirError => {
      if (mkdirError) {
        return res.status(500).json({detail: "It wasn't possible to create new deployment folder."});
      } else {
        return res.status(200).json({detail: "New deployment folder created successfully."});
      }
    });
  } else {
    return res.status(500).json(
      {detail: "Missing deployment name in the request body or name contains invalid characters."}
    );
  }
}
