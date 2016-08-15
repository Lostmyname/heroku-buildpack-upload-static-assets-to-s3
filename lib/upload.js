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

try {
  var AWS_DEFAULT_REGION = getEnvVariable('AWS_DEFAULT_REGION');

  var AWS_BUCKET_NAME = getEnvVariable('AWS_STATIC_BUCKET_NAME');
  var AWS_UPLOAD_DIRECTORY = getEnvVariable('AWS_STATIC_SOURCE_DIRECTORY');
  var AWS_STATIC_PREFIX = getEnvVariable('AWS_STATIC_PREFIX');

  // AWS.config.logger = process.stdout;
  AWS.config.accessKeyId = getEnvVariable('AWS_ACCESS_KEY_ID');
  AWS.config.secretAccessKey = getEnvVariable('AWS_SECRET_ACCESS_KEY');

  AWS.config.maxRetries = 10;
  AWS.config.region = AWS_DEFAULT_REGION;

} catch(error) {
  console.warn('Static Uploader is not configured for this deploy');
  console.error(error);
  process.exit(0);
}

var SOURCE_VERSION = process.env.SOURCE_VERSION;
var BUILD_DIR = process.env.BUILD_DIR;



//
var s3 = new AWS.S3();

var dir = path.join(BUILD_DIR, AWS_UPLOAD_DIRECTORY);
var STATIC_PATH = path.join(AWS_STATIC_PREFIX, new Date().toISOString().split('T')[0], SOURCE_VERSION);
glob(dir + '/**/*.*', {}, function(error, files) {

    if (error || !files) {
      return process.exit(1);
    }

    console.log('Files to Upload:', files.length);
    console.time('Upload Complete In');

    var yearInMs = 365 * 24 * 60 * 60000;
    var yearFromNow = Date.now() + yearInMs;

    async.eachLimit(files, 16, function(file, callback) {
        s3.upload({
          ACL: 'public-read',
          Key: path.join(STATIC_PATH, file.replace(dir, '')),
          Body: fs.createReadStream(file),
          Bucket: AWS_BUCKET_NAME,
          Expires: new Date(yearFromNow),
          CacheControl: 'public,max-age=' + yearInMs + ',smax-age=' + yearInMs,
          ContentType: mimeTypes.lookup(path.extname(file))
        }, callback)
      },
      function onUploadError(error) {
        if (error) {
          console.error(error);
          return process.exit(1);
        }
        console.timeEnd('Upload Complete In');

        var profiled = process.env.BUILD_DIR + '/.profile.d';
        // shelljs.exec('mkdir -p ' + profiled);
        fs.writeFileSync(
          path.join(profiled, '00-upload-static-files-to-s3-export-env.sh'),
          'export STATIC_SERVER=//s3-' + AWS_DEFAULT_REGION + '.amazonaws.com/' + AWS_BUCKET_NAME + '\n' +
          'export STATIC_PATH=/' + STATIC_PATH + '\n',
          {encoding: 'utf8'}
        );

        process.exit(0);
      });
  }
);

