#!/bin/sh
cd backend || exit 1
docker-compose build --no-cache || exit 1
docker-compose config || exit 1
docker-compose up -d inethi-user-management-mysql || exit 1
echo Waiting for MySQL container to initialise...
sleep 30
docker-compose up -d inethi-user-managementl || exit 1
inethi-user-management
cd ../front-end/inethi-portal || exit 1
docker-compose build --no-cache || exit 1
docker-compose config || exit 1
docker-compose up -d || exit 1
echo DONE
