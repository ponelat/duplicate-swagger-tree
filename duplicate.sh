#!/bin/bash

docker run -it --rm \
  -e "url=https://api.swaggerhub.com/apis/???" \
  -e "token=???" \
  -e "new_token=???" \
  -e "new_owner=ponelat" \
  -e "new_base_url=https://staging-api.swaggerhub.com"  \
  ponelat/duplicate-swagger-tree:latest
