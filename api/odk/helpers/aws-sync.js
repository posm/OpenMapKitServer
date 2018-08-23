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
    const params = {
      localDir: settings.dataDir,
      deleteRemoved: true,
      s3Params: {
        Bucket: process.env.AWSBUCKETNAME,
        Prefix: AWSBUCKETPREFIX
      }
    };
    var uploader = client.uploadDir(params);
    uploader.on('error', function(err) {
      console.error("Unable to sync:", err.stack);
    });
    uploader.on('end', function() {
      console.log("Upload to S3 completed.");
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
    const params = {
      localDir: settings.dataDir,
      deleteRemoved: true,
      s3Params: {
        Bucket: process.env.AWSBUCKETNAME,
        Prefix: AWSBUCKETPREFIX
      }
    };
    const listParams = {
      recursive: false,
      s3Params: {
        Bucket: process.env.AWSBUCKETNAME,
        Prefix: AWSBUCKETPREFIX.endsWith('/') ? AWSBUCKETPREFIX : `${AWSBUCKETPREFIX}/`
      }
    };
    var finder = client.listObjects(listParams);
    finder.on('data', function(data) {
      if (data.Contents.length >= 4) {
        var downloader = client.downloadDir(params);
        downloader.on('error', function(err) {
          console.error("Unable to sync:", err.stack);
        });
        downloader.on('end', function() {
          console.log("Download from AWS S3 completed");
        });
      }
      else {
        syncDataDir();
      }
    });
  }
};

module.exports = {
  syncDataDir,
  downloadDataDir
};
