from django.db import models
from django.utils.translation import gettext_lazy as _
from django.utils import timezone


class ServiceTypes(models.Model):
    name = models.CharField(max_length=50, unique=True)
    description = models.CharField(max_length=100)

    def __str__(self):
        return str(self.description)


class PaymentMethods(models.Model):
    name = models.CharField(max_length=50, unique=True)
    description = models.CharField(max_length=100)

    class Meta:
        verbose_name = "Payment Method"
        verbose_name_plural = "Payment Methods"

    def __str__(self):
        return self.name


class Users(models.Model):
    keycloak_username = models.CharField(
        max_length=100, unique=True, null=True, blank=True)
    email = models.CharField(max_length=100, null=True, blank=True)
    phonenum = models.CharField(max_length=100, null=True, blank=True)
    joindate_time = models.DateTimeField()


class Payment(models.Model):
    user_id = models.ForeignKey(Users, on_delete=models.PROTECT)
    payment_method = models.ForeignKey(PaymentMethods, on_delete=models.PROTECT)
    service_type_id = models.ForeignKey(ServiceTypes, on_delete=models.PROTECT)
    amount = models.IntegerField()
    paydate_time = models.DateTimeField()
    service_period_sec = models.IntegerField()
    package = models.CharField(max_length=100, null=True)
    voucher = models.CharField(max_length=100, null=True)


class Service(models.Model):
    user_id = models.ForeignKey(Users, on_delete=models.CASCADE)
    service_id = models.ForeignKey(ServiceTypes, on_delete=models.CASCADE)
    user_encrypt = models.CharField(max_length=100)
    pass_encrypt = models.CharField(max_length=100)
    join_datetime = models.DateTimeField()
    misc1 = models.CharField(max_length=100, null=True, blank=True)
    misc2 = models.CharField(max_length=100, null=True, blank=True)


class DefaultPaymentLimits(models.Model):
    service_id = models.ForeignKey(ServiceTypes, on_delete=models.CASCADE)
    payment_method = models.ForeignKey(PaymentMethods, on_delete=models.CASCADE)
    payment_limit = models.IntegerField()
    payment_limit_period_sec = models.IntegerField()


class Package(models.Model):
    name = models.CharField(max_length=50, unique=True)
    service_id = models.ForeignKey(ServiceTypes, on_delete=models.CASCADE)
    description = models.CharField(max_length=200)
    amount = models.IntegerField(unique=True)
    payment_method = models.ForeignKey(PaymentMethods, on_delete=models.CASCADE)
    time_period = models.IntegerField()
    created_date = models.DateTimeField(default=timezone.now)
    updated_date = models.DateTimeField(auto_now=True)


class UserPaymentLimits(models.Model):
    user_id = models.ForeignKey(Users, on_delete=models.CASCADE)
    service_type_id = models.ForeignKey(ServiceTypes, on_delete=models.CASCADE)
    payment_method = models.ForeignKey(PaymentMethods, on_delete=models.CASCADE)
    payment_limit = models.IntegerField()
    payment_limit_period_sec = models.IntegerField()
