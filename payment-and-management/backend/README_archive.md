# Django Backend

## Running this Code
### Testing (No RadiusDesk)
1. To do this you will need to edit your ```settings.py```::
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
2. Start a mysql database, traefik instance and keycloak instance. This code is provided for you and explained in this 
[file](../../infrastructure/README.md).
3. Start the backend from the backend directory in this repo
   1. `python manage.py migrate`
   2. `python manage.py makemigrations inethi_management_app`
   3. `python manage.py migrate`
   4. `python manage.py createsuperuser`
   5. `python manage.py create_dummy_data`
   6. `python manage.py runserver`
4. Start the frontend
`npm start`

## Endpoints and Common tasks
List of tasks that this backend can carry out and the endpoint corresponding to that task.

### Create, Edit and Check Payment Limits
Below is the user and default payment limit info.
#### User Limits
- Create a user limit
- Check a user limit: '_userlimits/_'
- Edit a user limit
- Get all users limits: '_getuserlimits/<str:user>_'

#### Default Limits
- Create a default limit: '_create_default_payment_limit_'
- Edit a default payment limit
- Check default limit: '_defaultlimits/_'
- Get all default limits: '_getdefaultlimits/_'

### Payments/Purchases
- Make a purchase: '_purchase/_'
- Get the purchases in a time period: '_latestpurchasetimedif/_'

### Payment Types
- **TODO**

### Packages
- Create a package: '_create_package/_'
- Edit a package: '_edit_package/_'

### Services
- Get list of services: '_services/_'

### Users
- Get users data: '_userdata/_'
- Register a user: '_registeruser/_'
- Get latest purchases by a user: '_latestpurchase/_'
- Get user payments: '_getuserpayments/<str:user>_'
