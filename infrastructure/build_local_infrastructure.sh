#!/bin/bash

# Detect OS
# 1 = LINUX
# 2 = MACOS
myos=1
res=$(echo $OSTYPE)
res3=${res:0:3}
if [ "$res3" = "dar" ]; then
    myos=2
    echo "Operating System discovered: MACOSX"
    echo "Please run this on an Ubuntu system"
    exit 1
else
    echo "Operating System discovered: LINUX"
fi
echo "Setting up docker bridge network"

docker network create --attachable -d bridge inethi-bridge-traefik

echo "Settind up Traefik"
wget https://splash.inethicloud.net/acme.json -P ./traefikssl/letsencrypt || exit 1;
cd ./traefikssl || exit 1
chmod 600 ./letsencrypt/acme.json || exit 1
./build.sh || exit 1
cd .. || exit 1

echo "Setting up Keycloak"
cd ./keycloak || exit 1
./build.sh || exit 1
cd .. || exit 1