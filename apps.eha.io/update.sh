#!/bin/bash

echo "Now syncing with S3"
aws s3 sync . s3://apps.eha.io --acl public-read --exclude "node_modules/*"

echo "Done"
