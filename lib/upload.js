const AWS = require('aws-sdk');
const glob = require('glob');
const path = require('path');
const fs = require('fs');
const _ = require('lodash');
const async = require('async');

function getEnvVariable(name) {
  return fs.readFileSync(path.join(process.env.ENV_DIR, name), {encoding: 'utf8'});
}

const SOURCE_VERSION = process.env.SOURCE_VERSION;
const BUILD_DIR = process.env.BUILD_DIR;

const AWS_BUCKET_NAME = getEnvVariable('AWS_BUCKET_NAME');
const AWS_UPLOAD_DIRECTORY = getEnvVariable('AWS_UPLOAD_DIRECTORY');

AWS.config.logger = process.stdout;
AWS.config.maxRetries = 10;
AWS.config.accessKeyId = getEnvVariable('AWS_ACCESS_KEY_ID');
AWS.config.secretAccessKey = getEnvVariable('AWS_SECRET_ACCESS_KEY');
AWS.config.region = getEnvVariable('AWS_DEFAULT_REGION');

//
const s3 = new AWS.S3();

const dir = path.join(BUILD_DIR, AWS_UPLOAD_DIRECTORY);
glob(dir + '/**/*.*', {}, function(error, files) {

    if (error || !files) {
      return process.exit(1);
    }

    files = _.map(files, function(file) {
      return {
        Expires: new Date(Date.now() + 365 * 24 * 60 * 60000), // a year from now
        ACL: 'public-read',
        Bucket: AWS_BUCKET_NAME,
        Key: path.join(SOURCE_VERSION, file.replace(dir, '')),
        Body: file
      };
    });

    async.eachLimit(files, 4, s3.upload, function(error) {
      if (error) {
        return process.exit(1);
      }
      process.exit(0);
    });

    process.exit(0);
  }
);

