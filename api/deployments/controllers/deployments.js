'use strict';

var fs = require('fs');
var path = require('path');
var Q = require('q');
var Url = require('../../../util/url');
var File = require('../../../util/file');
var settings = require('../../../settings');
var deploymentParentDir = 'deployments' ;
var deploymentParentDirPath = settings.dataDir + '/' + deploymentParentDir;


/**
 *
 * @param dirName
 * @param contents
 *
 * returns object with properties describing contents of a deployment directory
 */
var digestDeploymentDir = function(req, dirName, contents){

    var deferred = Q.defer();

    // If no manifest file, message this deployment directory as invalid
    if (contents.indexOf('manifest.json') === -1) {
        return {name: dirName, valid: false, message: "Unable to find manifest file."};
    }

    // Create object that describes deployment
    var deploymentObj = {
        name: dirName,
        totalSize: 0,
        valid: true,
        files: {"osm": [], "mbtiles": []},
        url: Url.apiUrl(req, '/omk/' + deploymentParentDir + '/' + dirName),
        listingUrl: Url.dataDirFileUrl(req, deploymentParentDir, dirName)
    };

    File.readFileDeferred(deploymentParentDirPath + '/' + dirName + '/manifest.json')
        .then(function(manifest){
            deploymentObj.manifest = JSON.parse(manifest);

            return  Q.all(contents.map(function(dirItem){
                return File.statDeferred(deploymentParentDirPath + '/' + dirName + '/' + dirItem);
            }));
        })
        .then(function(results){

            results.forEach(function(stat, index){

                // Get the file extentions
                var fileExt = path.extname(contents[index]);

                // Check the file extension, and if its a match, add to deploy object
                if ([".osm", ".mbtiles"].indexOf(fileExt) > -1) {
                    deploymentObj.totalSize += stat.size;
                    deploymentObj.files[fileExt.substring(1)].push({
                        name: contents[index],
                        url: Url.dataDirFileUrl(req, 'deployments/' + dirName, contents[index]),
                        size: stat.size,
                        lastModified: stat.mtime

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

module.exports.getAll = function(req, res, next) {
    var deployments = [];
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
                return File.statDeferred(deploymentParentDirPath + '/' + dirItem);
            }))
            .then(function (results) {

                // remove items that are not directories
                deploymentDirs = deploymentDirContents.filter(function (dirItem, index) {
                    return results[index].isDirectory();
                });

                // Read directory contents
                return Q.all(deploymentDirs.map(function (dirName) {
                    return File.readDirRecursiveDeferred(deploymentParentDirPath + '/' + dirName)
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

module.exports.get = function(req, res, next) {

    var deploymentDir = req.params.deployment;

    // Make sure it exists
    File.statDeferred(deploymentParentDirPath + '/' + deploymentDir)
        .then(function(stat){

            // read the directory contents
            return File.readDirRecursiveDeferred(deploymentParentDirPath + '/' + deploymentDir);
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
