'use strict';
const fs = require('fs');
const Q = require('q');
const File = require('../../util/file');
const submissionsDir = __dirname + '/../../public/submissions';

// On startup, build the checksum hash;  Use a ES6 Map,
var checksumHash = new Map();

// Scan the submission directories for checksum files, add any checksums to checksumHash
fs.readdir(submissionsDir, function(err, dirContents){

    var childDirNames, checksumFilePaths = [];

    if(err) {
        console.error(err);
        return;
    }

    if (dirContents.length === 0) {
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

            // loop thru each directory and look for a finalized-osm-checksums.txt file, add its file path to an array
            childDirs.forEach(function(dir, index){
                if(dir.indexOf('finalized-osm-checksums.txt') > -1) {
                    checksumFilePaths.push(childDirNames[index]);
                }
            });

            // read the contents of each finalized-osm-checksums.txt file
            return Q.all(checksumFilePaths.map(function (dir) {
                return File.readFileDeferred(submissionsDir + '/' + dir + '/' + 'finalized-osm-checksums.txt', {encoding: 'utf8'})
            }));

        })
        .then(function(checksumFiles){

            // Use contents of checksum files to populate the checksumHash map
            checksumFiles.forEach(function(fileStr, index){
                fileStr.split('\n').forEach(function(checksum){
                    checksumHash.set(checksum, checksumFilePaths[index]);
                });
            });

        })
        .catch(function (err) {
            console.error(err);
        })
        .done();

});

module.exports.get = function(){
    return checksumHash;
};