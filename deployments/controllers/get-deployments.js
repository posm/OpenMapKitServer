const fs = require('fs');
const Url = require('../../util//url');
const settings = require('../../settings');

module.exports = function (req, res, next) {
    const dir = settings.publicDir + '/deployments';
    const deployments = [];
    fs.readdir(dir, function (err, deploymentDirs) {
        if (err) {
            // if no deployments directory yet...
            if (err.errno === -2) {
                res.status(200).json([]);
                return;
            }
            res.status(500).json(err);
            return;
        }
        const len = deploymentDirs.length;
        if (deploymentDirs.length === 0) {
            res.status(200).json([]);
            return;
        }
        var count = 0;
        deploymentDirs.forEach(function(deploymentDir) {
            if (deploymentDir[0] === '.') {
                ++count;
                if (len === count) {
                    res.status(200).json(deploymentsSorted(deployments));
                }
                return;
            }
            var deploymentDirFullPath = dir + '/' + deploymentDir;
            var manifestFile = deploymentDirFullPath + '/manifest.json';
            fs.readdir(deploymentDirFullPath, function (err, deploymentFiles) {
                if (err) {
                    res.status(500).json(err);
                    return;
                }
                var fileUrls = [];
                for (var i = 0, length = deploymentFiles.length; i < length; i++) {
                    var deploymentFile = deploymentFiles[i];
                    var fileUrl = Url.publicDirFileUrl(req, 'deployments/' + deploymentDir, deploymentFile);
                    fileUrls.push(fileUrl);
                }
                var deploymentObj = {
                    name: deploymentDir,
                    files: fileUrls,
                    url: Url.apiUrl(req, 'deployments/' + deploymentDir),
                    listingUrl: Url.publicDirFileUrl(req, 'deployments', deploymentDir)
                };
                fs.readFile(manifestFile, function (err, manifest) {
                    ++count;
                    if (err) {
                        res.status(500).json({
                            status: 500,
                            msg: 'Unable to find manifest file.',
                            err: err
                        });
                        return;
                    }
                    deploymentObj.manifest = JSON.parse(manifest);
                    deployments.push(deploymentObj);
                    if (len === count) {
                        res.status(200).json(deploymentsSorted(deployments));
                    }
                });
            });
        });
    });
};

function deploymentsSorted(deployments) {
    return deployments.sort(function (a, b) {
        if (a.name < b.name) return -1;
        if (a.name > b.name) return 1;
        return 0;
    });
}
