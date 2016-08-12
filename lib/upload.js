const AWS = require('aws-sdk');
const glob = require('glob');
const path = require('path');
const fs = require('fs');

function getEnvVariable(name) {
  return fs.readFileSync(path.join(process.env.ENV_DIR, name), {encoding: 'utf8'});
}

AWS.config.logger = process.stdout;
AWS.config.accessKeyId = getEnvVariable('AWS_ACCESS_KEY_ID');
AWS.config.secretAccessKey = getEnvVariable('AWS_SECRET_ACCESS_KEY');
AWS.config.region = getEnvVariable('AWS_DEFAULT_REGION');
AWS.config.maxRetries = 10;

const AWS_BUCKET_NAME = getEnvVariable('AWS_BUCKET_NAME');
const AWS_UPLOAD_DIRECTORY = getEnvVariable('AWS_UPLOAD_DIRECTORY');
// const HOME = process.env.HOME;
const SOURCE_VERSION = process.env.SOURCE_VERSION;
const BUILD_DIR = process.env.BUILD_DIR;

//
// var s3 = new AWS.S3({
//   params: {
//     Bucket: AWS_BUCKET_NAME
//   }
// });

// console.log(JSON.stringify(process.env, null, 2));

console.log(BUILD_DIR, AWS_UPLOAD_DIRECTORY);

const dir = path.join(BUILD_DIR, AWS_UPLOAD_DIRECTORY);
console.log('searching dir:', dir);
glob(
  dir + '/**/*.*',
  {
    root: dir
  },
  function(error, files) {
    if (error || !files) {
      return process.exit(1);
    }
    console.log(files);
    process.exit(0);
  }
);

