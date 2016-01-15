const fs = require('fs');
const path = require('path');
const Q = require('q');
const Url = require('../../util//url');
const settings = require('../../settings');
const deploymentParentDir = 'deployments' ;
var deploymentParentDirPath = settings.publicDir + '/' + deploymentParentDir;

/**
 *
 * @param fd - full path to a file or directory
 * @returns Returns a deferred promise. Resolve with "stat" object for the passed in file descriptor.
 */
const statDeferred = function(fd){

    const deferred = Q.defer();

    fs.stat(fd, function(err, stats){

        if(err)
            deferred.reject(err);

        deferred.resolve(stats);
    });

    return deferred.promise;
};

/**
 *
 * @param dirPath - full path to a directory
 * @returns Returns a deferred promise. Resolved with an array of names of items in a directory.
 */
const readDirDeferred = function(dirPath){

    const deferred = Q.defer();

    fs.readdir(dirPath, function(err, contents){

        if(err)
            deferred.reject(err);

        deferred.resolve(contents);
    });

    return deferred.promise;

};

/**
 *
 * @param dirName
 * @param contents
 *
 * returns object with properties describing contents of a deployment directory
 */
const digestDeploymentDir = function(req, dirName, contents){

    var deferred = Q.defer();

    // If no manifest file, message this deployment directory as invalid
    if (contents.indexOf('manifest.json') === -1) {
        return {name: dirName, valid: false, message: "Unable to find manifest file."};
    }

    // Create object that describes deployment
    var deploymentObj = {
        name: dirName,
        valid: true,
        files: {"osm": [], "mbtiles": []},
        url: Url.apiUrl(req, deploymentParentDir + '/' + dirName),
        listingUrl: Url.publicDirFileUrl(req, deploymentParentDir, dirName)
    };

    Q.all(contents.map(function(dirItem){
        return statDeferred(deploymentParentDirPath + '/' + dirName + '/' + dirItem);
        }))
        .then(function(results){

            results.forEach(function(stat, index){

                // Get the file extentions
                var fileExt = path.extname(contents[index])

                // Check the file extension, and if its a match, add to deploy object
                if ([".osm", ".mbtiles"].indexOf(fileExt) > -1) {

                    deploymentObj.files[fileExt.substring(1)].push({
                        name: contents[index],
                        downloadUrl: Url.publicDirFileUrl(req, 'deployments/' + dirName, contents[index]),
                        size: stat.size,
                        last_modified: stat.mtime

                    });
                }
            });

            deferred.resolve(deploymentObj);
        })
        .catch(function(err){
            deferred.reject(err);
        })
        .done();

    return deferred.promise;
};

/**
 * Override the default parent directory of the deployments data directory.  This allows us to test these endpoints
 * with fixtures.
 *
 * @param parentDir
 * @private
 */
module.exports._setParentDirectory = function(parentDir){
    deploymentParentDirPath = parentDir + '/' + deploymentParentDir;
};

module.exports.find = function(req, res, next) {
    const deployments = [];
    var deploymentDirContents;
    var deploymentDirs;

    fs.readdir(deploymentParentDirPath, function(err, deploymentDirContents){
        if(err) {
            if (err.errno === -2) {
                res.status(200).json([]);
                return;
            }
            next(err);
            return;
        }

        // Return empty array if deployments directory is empty
        if (deploymentDirContents.length === 0) {
            res.status(200).json([]);
            return;
        }

        // Get stats on contents of the deployment directory
        Q.all(deploymentDirContents.map(function (dirItem) {
                return statDeferred(deploymentParentDirPath + '/' + dirItem);
            }))
            .then(function (results) {

                // remove items that are not directories
                deploymentDirs = deploymentDirContents.filter(function (dirItem, index) {
                    return results[index].isDirectory();
                });

                // Read directory contents
                return Q.all(deploymentDirs.map(function (dirName) {
                    return readDirDeferred(deploymentParentDirPath + '/' + dirName)
                }))
            })
            .then(function (results) {

                // Digest the contents of the deployment directories
                return Q.all(results.map(function (directoryContents, index) {
                    return digestDeploymentDir(req, deploymentDirs[index], directoryContents);
                }));
            })
            .then(function(deployments){
                res.status(200).json(deploymentsSorted(deployments));
            })
            .catch(function (err) {
                next(err);
            })
            .done();
    });
};

module.exports.findOne = function(req, res, next) {

    const deploymentDir = req.params.deployment;

    // Make sure it exists
    statDeferred(deploymentParentDirPath + '/' + deploymentDir)
        .then(function(stat){

            // read the directory contents
            return readDirDeferred(deploymentParentDirPath + '/' + deploymentDir);
        })
        .then(function(contents){

            // Digest the contents of the deployment directories
            return digestDeploymentDir(req,deploymentDir, contents );
        })
        .then(function(deployment){

            res.status(200).json(deployment);
        })
        .catch(function(err){
            next(err);
        })
        .done();

};

function deploymentsSorted(deployments) {
    return deployments.sort(function (a, b) {
        if (a.name < b.name) return -1;
        if (a.name > b.name) return 1;
        return 0;
    });
}
