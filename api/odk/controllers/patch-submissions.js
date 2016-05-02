'use strict';
var fs = require('fs');
var path = require('path');
var Q = require('q');
var File = require('../../../util/file');
var submissionsDir = __dirname + '/../../data/submissions';
var checksumHelper = require('../helpers/checksum-hash');

var appendFileDeferred = function(filePath, append) {

    var deferred = Q.defer();

    fs.appendFile(filePath, '\n' + append, function(err){
        if (err) {
            deferred.reject(err);
        }
        deferred.resolve();
    });

    return deferred.promise;

};

module.exports = function(req, res, next){
    var formName = path.basename(req.params.formName);

    var entityChecksums = req.body.finalizedOsmChecksums || null;

    if(!entityChecksums || !entityChecksums instanceof Array) {
        var err = new Error('Bad Request: finalizedOsmChecksums must be a string array.');
        err.status = 400;
        next(err);
    }

    // Get the current blacklist
    var blacklist = checksumHelper.get(formName);

    // Parallel async call to find and append the finialized-osm-checksum.txt files that managed the patched checksums
    Q.all(entityChecksums.map(function(checksum){

        blacklist.set(checksum, true);
        return appendFileDeferred(submissionsDir + '/' + formName + '/finalized-osm-checksums.txt', checksum);

    }))
    .then(function(results){
        res.status(200).json({success: true});
    })
    .catch(function(err){
        next(err);
    })
    .done();
};
