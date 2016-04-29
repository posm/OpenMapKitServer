var fs = require('fs');
var async = require('async');

module.exports = function(osmXmlFiles, submissionsDir, cb) {
    async.each(osmXmlFiles, function (file, cb) {

        fs.readFile(file, 'utf-8', function (err, xml) {
            if (err) {
                cb(err);
                return;
            }
            
        });

    }, function (err, oscXmlStr) {
        cb(err, oscXmlStr);
    });
};