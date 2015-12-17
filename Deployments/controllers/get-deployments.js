const fs = require('fs');
const settings = require('../../../settings');

module.exports = function (req, res, next) {
    const dir = settings.publicDir + '/deployments';
    const deployments = [];

    fs.readdir(dir, function (err, deploymentDirs) {
        if (err) res.status(500).json(err);
        const len = deploymentDirs.length;
        if (deploymentDirs.length === 0) {
            res.status(200).json([]);
            return;
        }
        var count = 0;
        for (var i = 0; i < len; i++) {
            var deploymentDir = deploymentDirs[i];
            if (deploymentDir[0] === '.') {
                ++count;
                if (len === count) {
                    res.status(200).json(deployments);
                }
                continue;
            }
            var manifestFile = dir + '/' + deploymentDir + '/manifest.json';
            var deploymentObj = {};
            fs.readdir(deploymentDir, function (err, deploymentFiles) {
                if (err) {
                    res.status(500).json(err);
                    return;
                }
                deploymentObj.files = deploymentFiles;
                fs.readFile(manifestFile, function (err, manifest) {
                    ++count;
                    if (err) {
                        res.status(500).json(err);
                        return;
                    }
                    var manifestObj = JSON.parse(manifest);
                    deploymentObj.manifest = manifestObj;
                    deployments.push(deploymentObj);
                    if (len === count) {
                        res.status(200).json(deployments);
                    }
                });
            });
        }
    });
};
