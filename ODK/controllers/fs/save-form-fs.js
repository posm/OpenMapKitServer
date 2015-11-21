const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');

module.exports = function (req, res, next) {
    var submission = req.submission;
    var ext = submission.geojson ? '.geojson' : '.json';
    var json = JSON.stringify(submission.json, null, '  ');
    var xml = submission.xml; // Original XML for debug purposes is nice.

    var dir = 'public/submissions/' + submission.formId + '/';
    var jsonFileName = dir + submission.instanceId + ext;
    var xmlFileName = dir + submission.instanceId + '.xml';

    mkdirp(path.dirname(jsonFileName), function (err) {
        if (err) {
            console.error(err);
            res.status(500).json({status: 500, error: err});
        }
        fs.writeFile(xmlFileName, xml, function(err) {
            if (err) console.error(err);
        });
        fs.writeFile(jsonFileName, json, function (err) {
            if (err) {
                console.error(err);
                res.status(500).json({status: 500, error: err});
                return;
            }
            res.status(201).json({saved: jsonFileName});
        });
    });
};
