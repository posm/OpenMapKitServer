'use strict';

var fs = require('fs');
var Q  = require('q');
var recursive = require('recursive-readdir');

/**
 *
 * @param fd - full path to a file or directory
 * @returns Returns a deferred promise. Resolve with "stat" object for the passed in file descriptor.
 */
module.exports.statDeferred = function(fd){
    var deferred = Q.defer();
    fs.stat(fd, function(err, stats){
        if(err) {
            deferred.reject(err);
        }
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
    var deferred = Q.defer();
    fs.readdir(dirPath, function(err, contents){
        if(err) {
            deferred.reject(err);
        }
        deferred.resolve(contents);
    });
    return deferred.promise;
};

module.exports.readDirRecursiveDeferred = function (dirPath) {
    var deferred = Q.defer();
    recursive(dirPath, function(err, contents){
        if(err) {
            deferred.reject(err);
        }
        var contentsRelativePath = contents.map(function (absPath) {
            return absPath.replace(dirPath+'/', '');
        });
        deferred.resolve(contentsRelativePath);
    });
    return deferred.promise;
};

/**
 *
 * @param filePath
 * @returns Returns a deferred promise. Resolved with a string of file contents.
 */
module.exports.readFileDeferred = function(filePath, opts){
    var options = opts || {};
    var deferred = Q.defer();
    fs.readFile(filePath, options, function(err, filestream){
        if(err) {
            deferred.reject(err);
        }
        deferred.resolve(filestream);
    });
    return deferred.promise;
};
