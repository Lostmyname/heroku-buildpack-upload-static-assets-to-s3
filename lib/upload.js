var AWS = require('aws-sdk');
var glob = require('glob');
var path = require('path');
var fs = require('fs');
var _ = require('lodash');
var async = require('async');
var mimeTypes = require('mime-types');
var shelljs = require('shelljs');

function getEnvVariable(name) {
  return fs.readFileSync(path.join(process.env.ENV_DIR, name), {encoding: 'utf8'});
}

var SOURCE_VERSION = process.env.SOURCE_VERSION;
var BUILD_DIR = process.env.BUILD_DIR;
var AWS_DEFAULT_REGION = getEnvVariable('AWS_DEFAULT_REGION');

var AWS_BUCKET_NAME = getEnvVariable('AWS_BUCKET_NAME');
var AWS_UPLOAD_DIRECTORY = getEnvVariable('AWS_UPLOAD_DIRECTORY');
var AWS_STATIC_PREFIX = getEnvVariable('AWS_STATIC_PREFIX');

AWS.config.logger = process.stdout;
AWS.config.maxRetries = 10;
AWS.config.accessKeyId = getEnvVariable('AWS_ACCESS_KEY_ID');
AWS.config.secretAccessKey = getEnvVariable('AWS_SECRET_ACCESS_KEY');
AWS.config.region = AWS_DEFAULT_REGION;

//
var s3 = new AWS.S3();

var dir = path.join(BUILD_DIR, AWS_UPLOAD_DIRECTORY);
var STATIC_PATH = path.join(AWS_STATIC_PREFIX, SOURCE_VERSION);
glob(dir + '/**/*.*', {}, function(error, files) {

    if (error || !files) {
      return process.exit(1);
    }

    console.log('num files to upload:', files.length);

    async.eachLimit(files, 4, function(file, callback) {

        s3.upload({
          Expires: new Date(Date.now() + 365 * 24 * 60 * 60000), // a year from now
          ACL: 'public-read',
          Bucket: AWS_BUCKET_NAME,
          Key: path.join(STATIC_PATH, file.replace(dir, '')),
          Body: fs.createReadStream(file),
          ContentType: mimeTypes.lookup(path.extname(file))
        }, callback)
      },

      function(error) {
        if (error) {
          return process.exit(1);
        }

        var profiled = process.env.BUILD_DIR + '/.profile.d';
        shelljs.exec('mkdir -p ' + profiled);
        fs.writeFileSync(
          path.join(profiled, '00-export-static-env.sh'),
          'STATIC_SERVER=//s3.' + AWS_DEFAULT_REGION + '.amazonaws.com/' + AWS_BUCKET_NAME + '\n' +
          'STATIC_PATH=/' + STATIC_PATH + '\n',
          {encoding: 'utf8'}
        );

        process.exit(0);
      });
  }
);

