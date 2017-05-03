# Purpose

Uploads static assets to S3 when deploying to heroku.
Requires NodeJS to be installed when building.

# Setting Mandatory Environment Variables for build

```
AWS_ACCESS_KEY_ID=<aws access key id>
AWS_SECRET_ACCESS_KEY=<aws secret access key>
AWS_DEFAULT_REGION=<aws-region>
AWS_STATIC_BUCKET_NAME=<s3-bucket-name>
# prefix to include in path
AWS_STATIC_PREFIX=static
# The directory to upload to S3 (uploads the content of the directory)
AWS_STATIC_SOURCE_DIRECTORY=public
```

**Note:** We found that when apps shared the same `AWS_STATIC_BUCKET_NAME`,
`AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` deploying any of these
apps would create variable bleed, essentially environment variables within Heroku would
be bundled into a js file and uploaded to the shared AWS bucket..

One of the issues with this was that the browser would try to make calls to domains
different to the one we were on. This was particualrly prevalent on the staging
website were we would see redirect calls to `seotesting.lostmy.name`.

To resolve this, Infra have created new S3 buckets for QA and SEO apps:

```
lmn-website-qa1
lmn-website-aq2
lmn-website-seo
```

In order to avoid issues going forward it would be best to request a new bucket
to be created for each app.

# Exported Environment Variables to runtime

```sh
STATIC_SERVER=<AWS_STATIC_BUCKET_NAME>.s3.amazonaws.com
STATIC_PATH=/<AWS_STATIC_PREFIX>/<YYYY-MM-DD>/<git-commit-sha1>
```

These variables can be overriden with config vars as expected

```
heroku config:set STATIC_SERVER=your.cdn.host
```

To return to the default value just unset the config vars

```
heroku config:unset STATIC_SERVER
```
