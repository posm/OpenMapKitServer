const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');

module.exports = function (req, res, next) {
    const submission = req.submission;
    const ext = submission.geojson ? '.geojson' : '.json';
    const json = JSON.stringify(submission.json, null, '  ');
    const xml = submission.xml; // Original XML for debug purposes is nice.

    const dir = 'public/submissions/' + submission.formId + '/' + submission.instanceId;
    const jsonFileName = dir + '/data' + ext;
    const xmlFileName = dir + '/data' + '.xml';

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
