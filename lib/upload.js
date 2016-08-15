var AWS = require('aws-sdk');
var glob = require('glob');
var path = require('path');
var fs = require('fs');
var _ = require('lodash');
var async = require('async');

function getEnvVariable(name) {
  return fs.readFileSync(path.join(process.env.ENV_DIR, name), {encoding: 'utf8'});
}

var SOURCE_VERSION = process.env.SOURCE_VERSION;
var BUILD_DIR = process.env.BUILD_DIR;

var AWS_BUCKET_NAME = getEnvVariable('AWS_BUCKET_NAME');
var AWS_UPLOAD_DIRECTORY = getEnvVariable('AWS_UPLOAD_DIRECTORY');
var AWS_STATIC_PREFIX = getEnvVariable('AWS_STATIC_PREFIX');

AWS.config.logger = process.stdout;
AWS.config.maxRetries = 10;
AWS.config.accessKeyId = getEnvVariable('AWS_ACCESS_KEY_ID');
AWS.config.secretAccessKey = getEnvVariable('AWS_SECRET_ACCESS_KEY');
AWS.config.region = getEnvVariable('AWS_DEFAULT_REGION');

//
var s3 = new AWS.S3();

var dir = path.join(BUILD_DIR, AWS_UPLOAD_DIRECTORY);
glob(dir + '/**/*.*', {}, function(error, files) {

    if (error || !files) {
      return process.exit(1);
    }

    files = _.map(files, function(file) {
      return {
        Expires: new Date(Date.now() + 365 * 24 * 60 * 60000), // a year from now
        ACL: 'public-read',
        Bucket: AWS_BUCKET_NAME,
        Key: path.join(AWS_STATIC_PREFIX, SOURCE_VERSION, file.replace(dir, '')),
        Body: file
      };
    });

    console.log('num files to upload:', files.length);

    async.eachLimit(files, 4,
      function(file, callback) {
        s3.upload(file, callback)
      },
      function(error) {
        if (error) {
          return process.exit(1);
        }
        process.exit(0);
      });
  }
);

