# Purpose
Uploads static assets to S3 when deploying to heroku

# Setting Mandatory Environment Variables

Example:

```sh
AWS_DEFAULT_REGION=eu-west-1
AWS_STATIC_BUCKET_NAME=lmn-website-static-assets
AWS_ACCESS_KEY_ID=<aws access key id>
AWS_SECRET_ACCESS_KEY=<aws secret access key>
# Prefix to include in path, used to distinguish between services
AWS_STATIC_PREFIX=phoenix
# The directory to upload to S3 (uploads the content of the directory)
AWS_STATIC_SOURCE_DIRECTORY=public
```

# Exposed Environment Variables

Example:

```sh
STATIC_SERVER=//s3-<AWS_DEFAULT_REGION>.amazonaws.com/<AWS_STATIC_BUCKET_NAME>
STATIC_PATH=/<AWS_STATIC_PREFIX>/<YYYY-MM-DD>/<git-commit-sha1>
```
