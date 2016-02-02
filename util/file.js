'use strict';

const fs = require('fs');
const Q  = require('q');

/**
 *
 * @param fd - full path to a file or directory
 * @returns Returns a deferred promise. Resolve with "stat" object for the passed in file descriptor.
 */
module.exports.statDeferred = function(fd){

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
module.exports.readDirDeferred = function(dirPath){

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
 * @param filePath
 * @returns Returns a deferred promise. Resolved with a string of file contents.
 */
module.exports.readFileDeferred = function(filePath, opts){

    const options = opts || {};
    const deferred = Q.defer();

    fs.readFile(filePath, options, function(err, filestream){

        if(err)
            deferred.reject(err);

        deferred.resolve(filestream);
    });

    return deferred.promise;
};


module.exports.getChildDirs = function(parentDirPath) {

    var deferred = Q.defer();

    // Scan the submission directories for checksum files, add any checksums to checksumHash
    fs.readdir(parentDirPath, function(err, dirContents){

        var childDirNames;

        if(err) {
            console.error(err);
            return;
        }

        if (dirContents.length === 0) {
            return;
        }

        // Loop thru the contents of the submissions directory and get file stats
        Q.all(dirContents.map(function (dirItem) {
                return File.statDeferred(parentDirPath + '/' + dirItem);
            }))
            .then(function (results) {

                // remove items that are not directories
                childDirNames = dirContents.filter(function (dirItem, index) {
                    return results[index].isDirectory();
                });


                // Read directory contents
                return Q.all(childDirNames.map(function (dirName) {
                    return File.readDirDeferred(parentDirPath + '/' + dirName)
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
                    return File.readFileDeferred(parentDirPath + '/' + dir + '/' + 'finalized-osm-checksums.txt', {encoding: 'utf8'})
                }));

            })
            .then(function(checksumFiles){

                // Use contents of checksum files to populate the checksumHash map
                checksumFiles.forEach(function(fileStr, index){
                    fileStr.split('\n').forEach(function(checksum){
                        checksumHash.set(checksum, true);
                    });
                });

            })
            .catch(function (err) {
                console.error(err);
            })
            .done();

    });

    return deferred.promise;
};