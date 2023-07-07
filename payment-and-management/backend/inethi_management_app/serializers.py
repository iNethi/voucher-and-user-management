from rest_framework import serializers
from .models import *


class ServiceTypesSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceTypes
        fields = '__all__'


class UsersSerializer(serializers.ModelSerializer):
    class Meta:
        model = Users
        fields = '__all__'


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = '__all__'


class ServiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Service
        fields = '__all__'


class DefaultPaymentLimitsSerializer(serializers.ModelSerializer):
    class Meta:
        model = DefaultPaymentLimits
        fields = '__all__'


class PaymentMethodSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentMethods
        fields = '__all__'


class PackageSerializer(serializers.ModelSerializer):
    payment_method = PaymentMethodSerializer(read_only=True)

    class Meta:
        model = Package
        fields = ['name', 'service_id', 'description', 'amount', 'payment_method', 'time_period', 'created_date', 'updated_date']
        read_only_fields = ['payment_method']

    def update(self, instance, validated_data):
        instance.name = validated_data.get('name', instance.name)
        instance.service_id = validated_data.get('service_id', instance.service_id)
        instance.description = validated_data.get('description', instance.description)
        instance.amount = validated_data.get('amount', instance.amount)
        instance.time_period = validated_data.get('time_period', instance.time_period)
        instance.save()
        return instance

class UserPaymentLimitsSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserPaymentLimits
        fields = '__all__'
