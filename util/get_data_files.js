var exec = require('child_process').exec;
var settings = require('../settings');

var child;
const AWSBUCKETPREFIX = process.env.AWSBUCKETPREFIX ? process.env.AWSBUCKETPREFIX : '/';

child = exec(
  `aws s3 sync s3://${process.env.AWSBUCKETNAME}/${AWSBUCKETPREFIX}/ ${settings.dataDir}`,
  {maxBuffer: 1024 * 5000},
  function (error, stdout, stderr) {
    console.log('stdout: ' + stdout);
    console.log('stderr: ' + stderr);
    if (error !== null) {
      console.log('exec error: ' + error);
    }
  }
);
