var s3 = require('@monolambda/s3');
var path = require('path');

var settings = require('../../../settings');

const AWSBUCKETPREFIX = process.env.AWSBUCKETPREFIX ? process.env.AWSBUCKETPREFIX : '/';

const syncDataDir = () => {
  if (process.env.ENABLES3SYNC) {
    var client = s3.createClient({
      s3Options: {
        accessKeyId: process.env.AWSKEYID,
        secretAccessKey: process.env.AWSSECRETKEY
      }
    });
    var params = {
      localDir: settings.dataDir,
      deleteRemoved: true,
      s3Params: {
        Bucket: process.env.AWSBUCKETNAME,
        Prefix: AWSBUCKETPREFIX
      }
    };
    var uploader = client.uploadDir(params);
    uploader.on('error', function(err) {
      console.error("unable to sync:", err.stack);
    });
    uploader.on('end', function() {
      console.log("done uploading");
    });
  }
};

const downloadDataDir = () => {
  if (process.env.ENABLES3SYNC) {
    var client = s3.createClient({
      s3Options: {
        accessKeyId: process.env.AWSKEYID,
        secretAccessKey: process.env.AWSSECRETKEY
      }
    });
    var params = {
      localDir: settings.dataDir,
      deleteRemoved: true,
      s3Params: {
        Bucket: process.env.AWSBUCKETNAME,
        Prefix: AWSBUCKETPREFIX
      }
    };
    var uploader = client.downloadDir(params);
    uploader.on('error', function(err) {
      console.error("unable to sync:", err.stack);
    });
    uploader.on('end', function() {
      console.log("Download from AWS S3 done");
    });
  }
};

module.exports = {
  syncDataDir,
  downloadDataDir
};
