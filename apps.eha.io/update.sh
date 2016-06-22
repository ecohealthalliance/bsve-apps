#!/bin/bash

echo "Now syncing with S3"
aws s3 sync ./dist s3://apps.eha.io --acl public-read

echo "Done"
