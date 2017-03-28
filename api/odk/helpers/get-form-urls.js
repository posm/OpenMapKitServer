var fs = require('fs');
var path = require('path');

var settings = require('../../../settings.js');

module.exports = function (options, cb) {
    return fs.readdir(settings.dataDir + '/forms', function (err, files) {
        if (err) {
          return cb(err);
        }

        var urls = files
          .filter(f => f.indexOf('.xml') >= 0)
          .filter(f => fs.statSync(path.join(settings.dataDir, 'forms', f)).size > 0)
          .map(f => options.baseUrl + '/' + f);

        return cb(null, urls);
    });
};
