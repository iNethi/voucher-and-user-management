import os
import django
import random
from faker import Faker
from django.core.management.base import BaseCommand
from django.utils import timezone


os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'inethi_management.settings')
django.setup()

from inethi_management_app.models import ServiceTypes, Users, UserPaymentLimits, Payment, Service, \
    DefaultPaymentLimits, Package, PaymentMethods

fake = Faker()
fake.date_time_this_year(before_now=True, after_now=False, tzinfo=timezone.utc)

class Command(BaseCommand):
    """
    this will create various randomised data for testing. IDs will be incorrect for services TODO fix this
    """
    help = 'Create random users'

    def create_service_types(self):
        for _ in range(5):
            ServiceTypes.objects.create(
                description=fake.text(max_nb_chars=50),
                pay_type=random.choice(['FR', 'PA']),
                service_type_id=fake.random_int(min=1, max=100),
            )

    def create_users(self):
        for _ in range(5):
            Users.objects.create(
                keycloak_id=fake.uuid4(),
                email_encrypt=fake.sha256(),
                phonenum_encrypt=fake.sha256(),
                joindate_time=fake.date_time_this_year(before_now=True, after_now=False, tzinfo=timezone.utc),
            )

    def create_user_payment_limits(self):
        for _ in range(5):
            UserPaymentLimits.objects.create(
                user_id=Users.objects.order_by('?').first(),
                service_type_id=fake.random_int(min=1, max=100),
                payment_method=random.choice(list(PaymentMethods)),
                payment_limit=fake.random_int(min=1, max=5000),
                payment_limit_period_sec=fake.random_int(min=1, max=100000),
            )

    def create_payments(self):
        """
        this will genereate payments but the service ID will be incorrect
        :return:
        """
        for _ in range(5):
            Payment.objects.create(
                user_id=Users.objects.order_by('?').first(),
                payment_method=random.choice(list(PaymentMethods)),
                service_type_id=fake.random_int(min=1, max=100),
                amount=fake.random_int(min=1, max=5000),
                paydate_time=fake.date_time_this_year(before_now=True, after_now=False),
                service_period_sec=fake.random_int(min=1, max=100000),
                package=fake.text(max_nb_chars=50),
                voucher=fake.text(max_nb_chars=50),
            )

    def create_services(self):
        for _ in range(5):
            Service.objects.create(
                user_id=Users.objects.order_by('?').first(),
                service_type_id=fake.random_int(min=1, max=100),
                user_encrypt=fake.sha256(),
                pass_encrypt=fake.sha256(),
                join_datetime=fake.date_time_this_year(before_now=True, after_now=False),
                misc1=fake.text(max_nb_chars=50),
                misc2=fake.text(max_nb_chars=50),
            )


    def create_default_payment_limits(self):
        for _ in range(5):
            DefaultPaymentLimits.objects.create(
                service_type_id=fake.random_int(min=1, max=100),
                payment_method=random.choice(list(PaymentMethods)),
                payment_limit=fake.random_int(min=1, max=5000),
                payment_limit_period_sec=fake.random_int(min=1, max=100000),
            )

    def create_packages(self):
        for _ in range(5):
            Package.objects.create(
                name=fake.unique.word(),
                amount=fake.random_int(min=1, max=5000),
                time_period=fake.random_int(min=1, max=100000),
                created_date=timezone.now(),
            )

    def handle(self, *args, **options):
        self.create_service_types()
        self.create_users()
        self.create_user_payment_limits()
        self.create_payments()
        self.create_services()
        self.create_default_payment_limits()
        self.create_packages()
