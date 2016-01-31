'use strict';
const fs = require('fs');
const split = require("split");
const File = require('../../util/file');
const readline = require('readline');
const submissionsDir = __dirname + '/../../public/submissions';
var checksumHelper = require('../helpers/checksum-hash');

module.exports = function(req, res, next){

    var testChecksums = ['54ceb91256e8190e474aa752a6e0650a2df5ba37', '92cfceb39d57d914ed8b14d0e37643de0797ae56'];

    var checksumHash = checksumHelper.get();

    var editHash = new Map();

    testChecksums.forEach(function(keyString){
        var fileDir = checksumHash.get(keyString);

        if(!fileDir) {
            return;
        }

        var fileChecksumsToRemove = editHash.get(fileDir);

        if(fileChecksumsToRemove) {
            fileChecksumsToRemove.push(keyString);
        } else {
            fileChecksumsToRemove = [keyString];
        }

        editHash.set(fileDir, fileChecksumsToRemove);

        checksumHash.delete(keyString);
    });

    // Iterate over editHash map
    editHash.forEach(function(value, key, map){

        var rstream = fs.createReadStream(submissionsDir + '/' + key + '/finalized-osm-checksums.txt');
        var wstream = fs.createWriteStream(submissionsDir + '/' + key + '/checksum-temp.txt');

        rstream
            .pipe(split(function(line){
                if(value.indexOf(line) === -1)
                    return line + '\n';
            }))
            .pipe(wstream);


        fs.rename(submissionsDir + '/' + key + '/checksum-temp.txt', filePath, function(err){

            if(err) {
                next(err);
            }

        })

    });

    res.status(200).json({success: true});

};
