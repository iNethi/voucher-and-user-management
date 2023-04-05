#!/bin/bash
echo Have you changed the settings.py file?
sleep 2
docker-compose -f docker-compose-no-reverse-proxy.yml up -d inethi-user-management-mysql
echo Waitng for database to come up...
sleep 15
python manage.py runserver