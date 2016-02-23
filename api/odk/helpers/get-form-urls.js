var fs = require('fs');

var settings = require('../../../settings.js');

module.exports = function (options, cb) {
    fs.readdir(settings.dataDir + '/forms', function (err, files) {
        if (err) return cb(err);
        var urls = [];
        for (var i = 0; i < files.length; i++) {
            var f = files[i];
            if (f.indexOf('.xml') === -1) continue; // Needs to be XML
            urls.push(options.baseUrl + '/' + f);
        }
        cb(null, urls);
    });
};
