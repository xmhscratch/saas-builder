#!/bin/bash

REGISTRY_BASE_URL=http://localhost:5000
REGISTRY_USERNAME=root
REGISTRY_PASSWORD=123456

docker run --rm anoxis/registry-cli -l $REGISTRY_USERNAME:$REGISTRY_PASSWORD -r $REGISTRY_BASE_URL --no-validate-ssl --delete --num 1
docker exec $(docker ps | grep registry:2 | awk '{print $1}') /bin/registry garbage-collect /etc/docker/registry/config.yml
