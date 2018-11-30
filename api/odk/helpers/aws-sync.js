var s3 = require('@monolambda/s3');
var path = require('path');
var fs = require('fs');

var settings = require('../../../settings');

const AWSBUCKETPREFIX = process.env.AWSBUCKETPREFIX ? process.env.AWSBUCKETPREFIX : '/';

const syncDataDir = (extraPrefix) => {
  if (process.env.ENABLES3SYNC) {
    var localDir = settings.dataDir;
    var bucketPrefix = AWSBUCKETPREFIX;
    if (extraPrefix != undefined) {
      localDir = path.join(settings.dataDir, extraPrefix);
      bucketPrefix = path.join(AWSBUCKETPREFIX, extraPrefix);
    }
    var client = s3.createClient({
      s3Options: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      }
    });
    const params = {
      localDir: localDir,
      deleteRemoved: true,
      s3Params: {
        Bucket: process.env.AWSBUCKETNAME,
        Prefix: bucketPrefix
      }
    };
    var uploader = client.uploadDir(params);
    uploader.on('error', (err) => {
      console.error("Unable to sync:", err.stack);
    });
    uploader.on('end', () => {
      console.log("Upload to S3 completed.");
    });
  }
};


const downloadDataDir = () => {
  if (process.env.ENABLES3SYNC) {
    var client = s3.createClient({
      s3Options: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      }
    });
    const listParams = {
      recursive: false,
      s3Params: {
        Bucket: process.env.AWSBUCKETNAME,
        Prefix: AWSBUCKETPREFIX.endsWith('/') ? AWSBUCKETPREFIX : `${AWSBUCKETPREFIX}/`
      }
    };

    if (!fs.existsSync(settings.dataDir)) {
      fs.mkdir(settings.dataDir, (err) => {if (err) throw err;});
    }

    var finder = client.listObjects(listParams);
    finder.on('data', (data) => {
      if (data.Contents.length >= 4) {
        ['forms', 'deployments', 'submissions', 'archive'].map(item => {
          var downloader = client.downloadDir(getParams(item));
          downloader.on('error', (err) => {
            console.error(`Unable to sync ${item}:`, err.stack);
          });
          downloader.on('end', () => {
            console.log("Download from AWS S3 completed");
          });
        });
      }
      else {
        syncDataDir();
      }
    });
  }
};

const getParams = (extraPrefix) => {
  var localDir = settings.dataDir;
  var bucketPrefix = AWSBUCKETPREFIX;
  if (!extraPrefix) {
    localDir = path.join(settings.dataDir, extraPrefix);
    bucketPrefix = path.join(AWSBUCKETPREFIX, extraPrefix);
  }
  const params = {
    localDir: localDir,
    deleteRemoved: true,
    s3Params: {
      Bucket: process.env.AWSBUCKETNAME,
      Prefix: bucketPrefix
    }
  };
  return params;
};


module.exports = {
  syncDataDir,
  downloadDataDir
};
