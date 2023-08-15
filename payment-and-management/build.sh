#!/bin/sh
cd backend || exit
docker-compose build --no-cache || exit
docker-compose config || exit
docker-compose up -d || exit
cd ../front-end/inethi-portal || exit
docker-compose build --no-cache || exit
docker-compose config || exit
docker-compose up -d || exit
echo DONE
sleep 5