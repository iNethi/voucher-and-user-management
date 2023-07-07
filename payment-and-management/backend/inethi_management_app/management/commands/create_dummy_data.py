import os
import django
import random

from django.db import IntegrityError
from faker import Faker
from django.core.management.base import BaseCommand
from django.utils import timezone


os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'inethi_management.settings')
django.setup()

from inethi_management_app.models import ServiceTypes, Users, UserPaymentLimits, Payment, \
    DefaultPaymentLimits, Package, PaymentMethods

fake = Faker()
fake.date_time_this_year(before_now=True, after_now=False, tzinfo=timezone.utc)


class Command(BaseCommand):
    """
    This will create various randomised data for testing.
    """
    help = 'Create random data'

    def create_service_types(self):
        service_type_list = [
            ("Internet", "access to the global internet"),
            ("iNethi", "access to iNethi local services"),
            ("iNethi Cloud Storage", "access to the iNethi cloud storage"),
        ]

        for name, desc in service_type_list:
            try:
                ServiceTypes.objects.create(name=name, description=desc)
            except IntegrityError:
                pass

    def create_payment_methods(self):
        payment_method_list = [
            ("krone", "community voucher"),
            ("sarafu", "community voucher"),
            ("cash", "local cash payment"),
            ("1foryou", "flash voucher payment"),
            ("free", "free service"),
        ]

        for name, desc in payment_method_list:
            PaymentMethods.objects.create(name=name, description=desc)

    def create_users(self):
        try:
            Users.objects.create(
                keycloak_username='inethi',
                email='inethi@inethi.com',
                phonenum='12345678',
                joindate_time=timezone.now(),
            )
        except IntegrityError:
            pass

    def create_default_payment_limits(self):
        default_payment_limits_list = [
            (ServiceTypes.objects.get(name="Internet"), PaymentMethods.objects.get(name="krone"), 100, 3600),
            (ServiceTypes.objects.get(name="Internet"), PaymentMethods.objects.get(name="sarafu"), 100, 3600),
            (ServiceTypes.objects.get(name="iNethi Cloud Storage"), PaymentMethods.objects.get(name="cash"), 100, 3600),
        ]

        for service, payment, limit, period in default_payment_limits_list:
            try:
                DefaultPaymentLimits.objects.create(service_id=service, payment_method=payment, payment_limit=limit,
                                                    payment_limit_period_sec=period)
            except IntegrityError:
                pass

    def create_packages(self):
        package_list = [
            ("Internet day voucher cash", "one day of uncapped internet", 10, PaymentMethods.objects.get(name="cash"),
             86400),
            ("Internet day voucher krone", "one day of uncapped internet", 100,
             PaymentMethods.objects.get(name="krone"), 86400),
        ]

        for name, desc, amount, payment_method, time_period in package_list:
            try:
                Package.objects.create(name=name, description=desc, amount=amount, payment_method=payment_method,
                                       time_period=time_period, service_id=ServiceTypes.objects.get(name="Internet"))
            except IntegrityError:
                pass

    def create_payments(self):
        payment_list = [
            ('iNethi', 'cash', 'Internet', 10, 86400, 'Internet day voucher cash'),
            ('iNethi', 'krone', 'Internet', 100, 86400, 'Internet day voucher krone'),
        ]

        for user, payment_method, service_type, amount, period, package_name in payment_list:
            try:
                Payment.objects.create(
                    user_id=Users.objects.get(keycloak_username=user),
                    payment_method=PaymentMethods.objects.get(name=payment_method),
                    service_type_id=ServiceTypes.objects.get(name=service_type),
                    amount=amount,
                    paydate_time=timezone.now(),
                    service_period_sec=period,
                    package=package_name
                )
            except IntegrityError:
                pass

    def handle(self, *args, **options):
        self.create_service_types()
        self.create_payment_methods()
        self.create_users()
        self.create_default_payment_limits()
        self.create_packages()
        self.create_payments()
