'use strict';
var fs = require('fs');
var readline = require('readline');
var Q = require('q');
var File = require('../../util/file');
var submissionsDir = __dirname + '/../../public/submissions';

var readlineDeferred = function(filePath, hashMap){

    var deferred = Q.defer();

    try {
        var rl = readline.createInterface({
            input: fs.createReadStream(filePath)
        });

        rl.on('line', function (line) {
            hashMap.set(line, true);
        });

        rl.on('close', function () {
            //console.log('finished loading: ' + filePath + ' into blacklist');
            deferred.resolve();
        });

    } catch(e) {
        deferred.reject(e);
    }
    return deferred.promise;
};

// On startup, build the form hash map;  Use a ES6 Map
var formHash = new Map();

module.exports.create = function(cb){
    // Scan the submission directories for checksum files, add any checksums to checksumHash
    fs.readdir(submissionsDir, function(err, dirContents){

        var childDirNames;

        if(err) {
            cb(err);
            return;
        }

        if (dirContents.length === 0) {
            cb(null);
            return;
        }

        // Loop thru the contents of the submissions directory and get file stats
        Q.all(dirContents.map(function (dirItem) {
                return File.statDeferred(submissionsDir + '/' + dirItem);
            }))
            .then(function (results) {

                // remove items that are not directories
                childDirNames = dirContents.filter(function (dirItem, index) {
                    return results[index].isDirectory();
                });

                // Read directory contents
                return Q.all(childDirNames.map(function (dirName) {
                    return File.readDirDeferred(submissionsDir + '/' + dirName)
                }));
            })
            .then(function (childDirs) {

                var formDirs = [];

                // loop thru each form directory; add an entry to the formHash, with key:form-name and value: new Map()
                childDirs.forEach(function(dir, index){

                    // Create a checksum hash map for each form in the formHash
                    formHash.set(childDirNames[index], new Map());

                    // Keep track of which directories have a finalized-osm-checksums.txt
                    if(dir.indexOf('finalized-osm-checksums.txt') > -1) {
                        formDirs.push(childDirNames[index]);
                    }
                });

                // Do all file reads in parallel
                return Q.all(formDirs.map(function(dir){

                    // Get the checksum hash map for the appropriate form
                    var checksumHash = formHash.get(dir);

                    return readlineDeferred(submissionsDir + '/' + dir + '/finalized-osm-checksums.txt', checksumHash);
                }));
            })
            .then(function(results){
                cb(null);
            })
            .catch(function (err) {
                console.error(err);
                cb(err);
            })
            .done();
    });
};
module.exports.get = function(formName){

    if(formName === undefined) {
        return formHash;
    }

    return formHash.get(formName);
};