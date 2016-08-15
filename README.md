# Purpose
Uploads static assets to S3 when deploying to heroku

# Setting Enviroment Variables

Example:

```sh
AWS_DEFAULT_REGION=eu-west-1
AWS_BUCKET_NAME=website-static-assets
AWS_STATIC_PREFIX=phoenix
AWS_UPLOAD_DIRECTORY=public
AWS_ACCESS_KEY_ID=<aws access key id>
AWS_SECRET_ACCESS_KEY=<aws secret access key>
```

# Exposed Enviroment Variables

Example:

```sh
STATIC_SERVER=//s3-eu-west-1.amazonaws.com/website-static-assets
STATIC_PATH=/public/<Date>/<sha1>
```
