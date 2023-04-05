# Django Backend

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

## Local Testing of Django (no radiusdesk or keycloak)
To do this you will need to edit your ```settings.py``` file and then run the ```run_local_test.sh``` script. You
settings file should look like this:
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
Run the following:
```
./run_local_test.sh
```
Then run the following in a separate terminal window:
```
python manage.py makemigrations inethi_management
python manage.py migrate
python manage.py createsuperuser
```


## Terminal Endpoint Testing
1. Create a package
```
http POST http://localhost:8000/create_package/ name='Package B' amount=1010 time_period=30
```
2. Edit a package
```
curl -X PUT -H "Content-Type: application/json" -d '{"name": "Package 1", "amount": 100, "time_period": 30}' http://localhost:8000/edit_package/
```
3. Create default payment limit:
```
curl -X POST -H "Content-Type: application/json" -d '{"service_type_id": 1, "payment_method": 1, "payment_limit": 100, "payment_limit_period_sec": 3600}' http://localhost:8000/create_default_payment_limit/
```
