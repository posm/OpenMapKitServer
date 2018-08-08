var fs = require('fs');
var path = require('path');
var settings = require('../../../settings.js');


module.exports = (req, res, next) => {
  const archiveDir = path.join(settings.dataDir, 'archive', 'forms');

  fs.readdir(archiveDir, (err, items) => {
    return res.status(200).json(
      {forms: items.filter(i => i.endsWith('.xml')).map(i => path.basename(i, '.xml'))}
    );
  });
}
