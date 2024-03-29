# iNethi Management and Payment System
A user management portal for iNethi that uses React and Django.

## Notes
- Ensure your server can locate `paum.inethilocal.net`, `keycloal.inethilocal.net`, etc.
## Running this code (PROD)
1. Ensure you have keycloak and traefik running and a volume folder to store data at 
`/mnt/data/inethi_user_management_mysql`. Set up a keycloak client found in the config file. Use local or prod version,
depending on whether you're building a prod or test version, but make sure to name the client 'portal-local' in the 
keycloak UI to ensure the code works. **Recreate your JWT credentials after importing the client to ensure 
your credentials are unique to you.**
2. run the build script located at `payment-and-management/build.sh`:
```
./build.sh
```
## Running this code (no radius desk)
1. Ensure you have traefik running with a keycloak instance running.
   1. Ensure a keycloak client is set up for both django and react purposes. The configs can be found in [here](./config) and can 
   be imported when creating a new client. **Recreate your JWT credentials after importing the client to ensure your 
   credentials are unique to you.**
2. Start a mysql database for the django backend by running the build script [here](./infrastructure/mysql):
```
./build.sh
```
3. Set up and run the backend
   1. To do this you will need to edit your ```settings.py``` file [here](./payment-and-management/backend/inethi_management/settings.py)
   to look like this:
```
DATABASES = {
    'default': {
        # MySQL engine. Powered by the mysqlclient module.
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'inethi-user-management-api',
        'USER': 'root',
        'PASSWORD': '',
        'HOST': '0.0.0.0',
        # 'HOST': 'inethi-user-management-mysql',
        'PORT': '3316',
    },
    # 'radiusdeskdb': {
    #     'NAME': 'rd',
    #     'ENGINE': 'django.db.backends.mysql',
    #     'USER': 'rd',
    #     'PASSWORD': 'rd',
    #     'HOST': 'inethi-radiusdesk-mariadb',
    #     'PORT': '3306',
    # }

}
```
   2. Start the backend from the backend directory in this repo [here](./payment-and-management/backend) by running:
   3. `python manage.py migrate`
   4. `python manage.py makemigrations inethi_management_app`
   5. `python manage.py migrate`
   6. `python manage.py createsuperuser`
   7. `python manage.py create_dummy_data`
   8. `python manage.py runserver`

3. Start the frontend from [here](./payment-and-management/front-end/inethi-portal):
```
npm start
```
4. Navigate to `payment-and-management/front-end/inethi-portal/src/pages` and change the lines 
`axios.defaults.baseURL =` variable to have a value of `'http://127.0.0.1:8000';`
7. Navigate to [the front end](http://localhost:3000/) in your browser. Login with a keycloak user and test the app.

## Keycloak
### Clients
1. **portal-local client**: a public client used to authenticate users when they want to make an API call and login to 
the React app. It allows the backend token-based authentication.
