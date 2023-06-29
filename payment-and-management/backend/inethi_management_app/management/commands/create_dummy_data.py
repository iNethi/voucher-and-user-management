import os
import django
import random
from faker import Faker
from django.utils import timezone
from django.core.management.base import BaseCommand
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'inethi_management.settings')
django.setup()

from inethi_management_app.models import (
    ServiceTypes, Users, UserPaymentLimits, Payment,
    Service, DefaultPaymentLimits, Package, PaymentMethods
)

fake = Faker()


def create_service_types():
    descriptions = ['Type1', 'Type2', 'Type3', 'Type4', 'Type5']
    pay_types = [ServiceTypes.PayTypes.FREE, ServiceTypes.PayTypes.PAID]
    for i in range(5):
        ServiceTypes.objects.create(
            description=fake.word(ext_word_list=descriptions),
            pay_type=random.choice(pay_types),
            service_type_id=fake.random_int(min=1, max=100),
        )


def create_users():
    for i in range(5):
        Users.objects.create(
            keycloak_id=fake.uuid4(),
            email_encrypt=fake.sha256(),
            phonenum_encrypt=fake.sha256(),
            joindate_time=fake.date_time_this_year(),
        )


def create_user_payment_limits():
    for i in range(5):
        UserPaymentLimits.objects.create(
            user_id=Users.objects.order_by('?').first(),
            service_type_id=fake.random_int(min=1, max=100),
            payment_method=random.choice(list(PaymentMethods)),
            payment_limit=fake.random_int(min=100, max=1000),
            payment_limit_period_sec=fake.random_int(min=3600, max=86400),
        )


def create_payments():
    for i in range(5):
        Payment.objects.create(
            user_id=Users.objects.order_by('?').first(),
            payment_method=random.choice(list(PaymentMethods)),
            service_type_id=fake.random_int(min=1, max=100),
            amount=fake.random_int(min=100, max=1000),
            paydate_time=fake.date_time_this_year(),
            service_period_sec=fake.random_int(min=3600, max=86400),
            package=fake.word(),
            voucher=fake.sha1(),
        )


def create_services():
    for i in range(5):
        Service.objects.create(
            user_id=Users.objects.order_by('?').first(),
            service_type_id=fake.random_int(min=1, max=100),
            user_encrypt=fake.sha256(),
            pass_encrypt=fake.sha256(),
            join_datetime=fake.date_time_this_year(),
            misc1=fake.word(),
            misc2=fake.word(),
        )


def create_default_payment_limits():
    for i in range(5):
        DefaultPaymentLimits.objects.create(
            service_type_id=fake.random_int(min=1, max=100),
            payment_method=random.choice(list(PaymentMethods)),
            payment_limit=fake.random_int(min=100, max=1000),
            payment_limit_period_sec=fake.random_int(min=3600, max=86400),
        )


def create_packages():
    for i in range(5):
        Package.objects.create(
            name=fake.word(),
            amount=fake.random_int(min=100, max=1000),
            time_period=fake.random_int(min=3600, max=86400),
            created_date=timezone.now(),
            updated_date=timezone.now(),
        )


def main():
    create_service_types()
    create_users()
    create_user_payment_limits()
    create_payments()
    create_services()
    create_default_payment_limits()
    create_packages()


class Command(BaseCommand):
    help = 'Create dummy data'

    def handle(self, *args, **kwargs):
        # your data creation functions here
        create_service_types()
        create_users()
        create_user_payment_limits()
        create_payments()
        create_services()
        create_default_payment_limits()
        create_packages()


if __name__ == "__main__":
    main()
