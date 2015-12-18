const fs = require('fs');
const Url = require('../../util//url');
const settings = require('../../settings');

module.exports = function (req, res, next) {
    const deploymentDir = req.params.deployment;
    const deploymentDirPath = '/deployments/' + deploymentDir;
    const deploymentDirFullPath = settings.publicDir + deploymentDirPath;
    fs.readdir(deploymentDirFullPath, function (err, files) {
        if (err) {
            // no deployment directory of specified name
            if (err.errno === -2) {
                res.status(404).json({
                    status: 404,
                    msg: 'There is currently no deployment with the name: ' + req.params.deployment,
                    err: err
                });
                return;
            }
            res.status(500).json({
                status: 500,
                msg: 'A problem happened with reading the ' + req.params.deployment + ' directory.',
                err: err
            });
            return;
        }
        var fileUrls = [];
        for (var i = 0, len = files.length; i < len; i++) {
            var fileUrl = Url.publicDirFileUrl(req, deploymentDirPath, files[i]);
            fileUrls.push(fileUrl);
        }
        var deploymentObj = {
            name: deploymentDir,
            files: fileUrls,
            url: Url.apiUrl(req, 'deployments/' + deploymentDir),
            listingUrl: Url.publicDirFileUrl(req, 'deployments', deploymentDir)
        };
        fs.readFile(Url.endWithSlash(deploymentDirFullPath) + 'manifest.json', function (err, manifest) {
            if (err) {
                res.status(500).json({
                    status: 500,
                    msg: 'Unable to find manifest file.',
                    err: err
                });
                return;
            }
            deploymentObj.manifest = JSON.parse(manifest);
            res.status(200).json(deploymentObj);
        });
    });
};
