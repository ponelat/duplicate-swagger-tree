#!/bin/bash

img=ponelat/duplicate-swagger-tree:latest

# Get these specs
urls="
https://api.swaggerhub.com/apis/ponelat/petstore/1.0.0
"
for url in $urls; do
docker run -it --rm \
  -e "url=$url" \
  -e "token=???" \
  -e "new_owner=ponelat" \
  -e "new_token=???" \
  -e "new_base_url=https://dev-api.swaggerhub.com"  \
  $img
done
