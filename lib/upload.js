const AWS = require('aws-sdk');
const glob = require('glob');
const path = require('path');

AWS.config.logger = process.stdout;
AWS.config.accessKeyId = process.env.AWS_ACCESS_KEY_ID;
AWS.config.secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
AWS.config.region = process.env.AWS_DEFAULT_REGION;
AWS.config.maxRetries = 10;

const AWS_BUCKET_NAME = process.env.AWS_BUCKET_NAME;
const SOURCE_VERSION = process.env.SOURCE_VERSION;
const AWS_UPLOAD_DIRECTORY = process.env.AWS_UPLOAD_DIRECTORY;
const HOME = process.env.HOME;

var s3 = new AWS.S3({
  params: {
    Bucket: AWS_BUCKET_NAME
  }
});

console.log(JSON.stringify(process.env, null, 2));

const dir = path.join(process.env.BUILD_DIR, AWS_UPLOAD_DIRECTORY);
console.log('searching dir:', dir);
glob(
  dir,
  {
    root: ''
  },
  function(error, files) {
    if (error || !files) {
      return process.exit(1);
    }
    console.log(files);
    process.exit(0);
  }
);

