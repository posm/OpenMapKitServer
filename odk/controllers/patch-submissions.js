'use strict';
const fs = require('fs');
const path = require('path');
const Q = require('q');
const glob = require("glob");
const File = require('../../util/file');
const readline = require('readline');
const submissionsDir = __dirname + '/../../public/submissions';
var checksumHelper = require('../helpers/checksum-hash');

var findFilesDeferred = function(checksum, cwd) {

    var deferred = Q.defer();

    // now find the file to append; this is async, so manage the errors appropriately
    glob('**/' + checksum + ".osm",{cwd: cwd}, function (err, files) {
        if(err) {
            deferred.reject(err);
        }

        if( files.length === 0 ) {
            deferred.reject(new Error("Incoming checksum " + checksum + " cannot be paired with a matching .osm file!"));
        }

        if(files.length > 1) {
            deferred.reject(new Error("More than 1 " +checksum + ".osm file!\n" + files.join('\n')));
        }

        // Get the parent directory of the the file
        var checksumFilePath = cwd + '/' + path.dirname(path.dirname(files[0])) + '/finalized-osm-checksums.txt';

        fs.appendFile(checksumFilePath, '\n' + checksum, function(err){
            if (err) {
                deferred.reject(err);
            }
            deferred.resolve();
        });
    });

    return deferred.promise;

};

module.exports = function(req, res, next){

    var entityChecksums = req.body.entityChecksums || null;

    if(!entityChecksums || !entityChecksums instanceof Array) {
        var err =new Error('Bad Request: entityChecksum must be a string array.');
        err.status = 400;
        next(err)
    }

    // Get the current blacklist
    var checksumBlacklist = checksumHelper.get();

    console.log(checksumBlacklist.size);

    // Parallel async call to find and append the finialized-osm-checksum.txt files that managed the patched checksums
    Q.all(entityChecksums.map(function(keyString){

        if(checksumBlacklist.has(keyString)) {
            var err = new Error('Checksum already found in blacklist!');
            err.status = 400;
            throw  err;
        }
        checksumBlacklist.set(keyString, true);
        return findFilesDeferred(keyString, submissionsDir);
    }))
        .then(function(results){
            res.status(200).json({success: true});
        })
        .catch(function(err){
            next(err);
        })
        .done();
};
