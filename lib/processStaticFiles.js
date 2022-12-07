var AWS = require('aws-sdk');
var glob = require('glob');
var path = require('path');
var fs = require('fs');
var _ = require('lodash');
var async = require('async');
var mimeTypes = require('mime-types');
var shelljs = require('shelljs');

function getEnvVariable(name) {
  return process.env[name] || fs.readFileSync(path.join(process.env.ENV_DIR, name), {encoding: 'utf8'});
}

const upload = () => {
  try {

    // AWS.config.logger = process.stdout;
    AWS.config.maxRetries = 10;

    AWS.config.accessKeyId = getEnvVariable('AWS_ACCESS_KEY_ID');
    AWS.config.secretAccessKey = getEnvVariable('AWS_SECRET_ACCESS_KEY');
    AWS.config.region = getEnvVariable('AWS_DEFAULT_REGION');

    // bucket where static assets are uploaded to
    var AWS_STATIC_BUCKET_NAME = getEnvVariable('AWS_STATIC_BUCKET_NAME');
    // the source directory of static assets
    var AWS_STATIC_SOURCE_DIRECTORY = getEnvVariable('AWS_STATIC_SOURCE_DIRECTORY');
    // the prefix assigned to the path, can be used to configure routing rules in CDNs
    var AWS_STATIC_PREFIX = getEnvVariable('AWS_STATIC_PREFIX');
    AWS.config.getCredentials((err, cred) => {
      console.log(">>> cred err", err)
      console.log(">>> cred", cred)
  })
  } catch(error) {
    console.error('Static Uploader is not configured for this deploy');
    console.error(error);
    console.error('Exiting without error');
    process.exit(1);
  }

  // the sha-1 or version supplied by heroku used to version builds in the path
  var SOURCE_VERSION = (process.env.SOURCE_VERSION || '').slice(0, 7);
  var BUILD_DIR = process.env.BUILD_DIR;

  // location of public assets in the heroku build environment
  var PUBLIC_ASSETS_SOURCE_DIRECTORY = path.join(BUILD_DIR, AWS_STATIC_SOURCE_DIRECTORY);

  // uploaded files are prefixed with this to enable versioning
  var STATIC_PATH = path.join(AWS_STATIC_PREFIX);

  glob(PUBLIC_ASSETS_SOURCE_DIRECTORY + '/**/*.*', {}, function(error, files) {

      if (error || !files) {
        return process.exit(1);
      }

      console.log('Files to Upload:', files.length);
      console.time('Upload Complete In');

      var yearInMs = 365 * 24 * 60 * 60000;
      var yearFromNow = Date.now() + yearInMs;

      var s3 = new AWS.S3();
      async.eachLimit(files, 16, function(file, callback) {

          var stat = fs.statSync(file);
          if (!stat.isFile()) {
            console.log('Not a file', file);
            return callback(null);
          }

          var contentType = mimeTypes.lookup(path.extname(file)) || null;
          if (!_.isString(contentType)) {
            console.warn('Unknown ContentType:', contentType, file);
            contentType = 'application/octet-stream';
          }

          s3.upload({
            ACL: 'public-read',
            Key: path.join(STATIC_PATH, file.replace(PUBLIC_ASSETS_SOURCE_DIRECTORY, '')),
            Body: fs.createReadStream(file),
            Bucket: AWS_STATIC_BUCKET_NAME,
            Expires: new Date(yearFromNow),
            CacheControl: 'public,max-age=' + yearInMs + ',smax-age=' + yearInMs,
            ContentType: contentType
          }, callback)

        },
        function onUploadComplete(error) {
          console.timeEnd('Upload Complete In');

          if (error) {
            console.error('Static Uploader failed to upload to S3');
            console.error(error);
            console.error('Exiting without error');
            process.exit(1);
          }

          var profiled = process.env.BUILD_DIR + '/.profile.d';
          fs.writeFileSync(
            path.join(profiled, '00-upload-static-files-to-s3-export-env.sh'),
            'echo EXPORTING STATIC ENV VARIABLES\n' +
            'export STATIC_SERVER=${STATIC_SERVER:-' + AWS_STATIC_BUCKET_NAME + '.s3.amazonaws.com' + '}\n' +
            'export STATIC_PATH=${STATIC_PATH:-/' + STATIC_PATH + '}\n',
            {encoding: 'utf8'}
          );

          process.exit(0);
        });
    }
  );
}

module.exports = upload;
