import json
from _datetime import datetime
from datetime import timedelta

from django.http import JsonResponse, HttpResponse
from django.shortcuts import get_object_or_404
from django.core.exceptions import ObjectDoesNotExist
from .models import *
from django.db import IntegrityError
from .radiusdesk.models import *
from .serializers import *
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
import pytz
from keycloak import KeycloakOpenID
from urllib.parse import unquote
keycloak_openid = KeycloakOpenID(
    server_url="https://keycloak.inethilocal.net/auth/",
    client_id="portal-local",
    realm_name="master",
)

def authenticate_keycloak_user(request):
    token = request.META.get('HTTP_AUTHORIZATION')

    if not token:
        return False
    try:
        token = token.split(" ")
        user_info = keycloak_openid.userinfo(token[1])
        print(user_info)
        if user_info:
            return True
        else:
            return False
    except:
        return False

def get_user_name(request):
    token = request.META.get('HTTP_AUTHORIZATION')
    if not token:
        return None
    try:
        token = token.split(" ")
        user_info = keycloak_openid.userinfo(token[1])
        user_name = user_info['preferred_username']
        return user_name
    except:
        return None

def authenticate_admin_user(request):
    token = request.META.get('HTTP_AUTHORIZATION')
    if not token:
        return False
    try:
        token = token.split(" ")
        user_info = keycloak_openid.userinfo(token[1])
        if user_info['preferred_username'] == 'inethi':
            return True
        else:
            return False
    except:
        return False


@api_view(['GET'])
def get_payment_methods(request):
    if not authenticate_keycloak_user(request):
        return JsonResponse(status=403, data={'error': 'Unauthorized user'})
    payment_methods = PaymentMethods.objects.all()
    payment_methods_data = [{'id': method.id, 'name': method.name} for method in payment_methods]
    return JsonResponse(payment_methods_data, safe=False)



@api_view(['GET'])
def check_payment_user_limit(request, format=None):
    if not authenticate_admin_user(request):
        return JsonResponse(status=403, data={'error': 'Unauthorized user'})

    service_type_name = request.GET.get('service_type_name', None)
    payment_method = request.GET.get('payment_method', None)
    phone_num = request.GET.get('phone_num', None)
    email = request.GET.get('email', None)
    keycloak_username = request.GET.get('keycloak_username', None)

    if not service_type_name or not payment_method or not (phone_num or email or keycloak_username):
        return JsonResponse(status=400, data={'error': 'Missing required parameters in the request'})

    try:
        service_type = ServiceTypes.objects.get(name=service_type_name)
    except ServiceTypes.DoesNotExist:
        return JsonResponse(status=404, data={'error': 'service type not found'})

    try:
        if phone_num:
            user = Users.objects.get(phonenum_encrypt=phone_num)
        elif email:
            user = Users.objects.get(email_encrypt=email)
        else:  # keycloak_id
            user = Users.objects.get(keycloak_id=keycloak_username)

        limit = UserPaymentLimits.objects.get(user_id=user, service_type=service_type,
                                              payment_method=payment_method)
        serializer = UserPaymentLimitsSerializer(limit)
        return Response(serializer.data, status=status.HTTP_200_OK)

    except Users.DoesNotExist:
        return JsonResponse(status=404, data={'error': 'user not registered'})
    except UserPaymentLimits.DoesNotExist:
        return JsonResponse(status=404, data={'error': 'user payment limit not set'})


@api_view(['GET'])
def check_payment_default_limit(request, format=None):
    if not authenticate_admin_user(request):
        return JsonResponse(status=403, data={'error': 'Unauthorized user'})

    if request.method == 'GET':
        try:
            service_type_name = request.GET.get('service_type_name', None)
            payment_method = request.GET.get('payment_method', None)

            if not service_type_name or not payment_method:
                return JsonResponse(status=400, data={'error': 'Missing required parameters in the request'})

            service_type = ServiceTypes.objects.get(name=service_type_name)

            limit = DefaultPaymentLimits.objects.get(
                service_type=service_type, payment_method=payment_method)
            serializer = DefaultPaymentLimitsSerializer(limit)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except ServiceTypes.DoesNotExist:
            return JsonResponse(status=404, data={'error': 'service type not found'})
        except DefaultPaymentLimits.DoesNotExist:
            return JsonResponse(status=404, data={'error': 'default payment limit not set'})
        except:
            return JsonResponse(status=400, data={'error': 'incorrectly formatted request'})


@api_view(['GET'])
def request_services(request, format=None):
    if not authenticate_keycloak_user(request):
        return JsonResponse(status=403, data={'error': 'Unauthorized user'})

    if request.method == 'GET':
        services = ServiceTypes.objects.all()
        serializer = ServiceTypesSerializer(services, many=True)
        return Response(serializer.data)


@api_view(['GET'])
def get_package(request, format=None):
    if not authenticate_keycloak_user(request):
        return JsonResponse(status=403, data={'error': 'Unauthorized user'})

    if request.method == 'GET':
        try:
            packages = Package.objects.all()
            serializer = PackageSerializer(packages, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            print(e)
            return Response(status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT'])
def update_default_payment_limit(request, format=None):
    if not authenticate_admin_user(request):
        return JsonResponse(status=403, data={'error': 'Unauthorized user'})
    if request.method == 'PUT':
        service_type_id = request.data.get('service_type_id')
        payment_method = request.data.get('payment_method')
        payment_limit = request.data.get('payment_limit')
        payment_limit_period_sec = request.data.get('payment_limit_period_sec')

        # Check if service_type_id is valid
        try:
            service_type = ServiceTypes.objects.get(service_type_id=service_type_id)
        except ServiceTypes.DoesNotExist:
            return JsonResponse(status=400, data={'error': 'Invalid service type id'})

        # Check if default payment limit exists for given service type and payment method
        try:
            limit = DefaultPaymentLimits.objects.get(service_type_id=service_type_id, payment_method=payment_method)
        except DefaultPaymentLimits.DoesNotExist:
            return JsonResponse(status=404, data={
                'error': 'Default payment limit does not exist for this service type and payment method'})

        limit.payment_limit = payment_limit
        limit.payment_limit_period_sec = payment_limit_period_sec
        limit.save()

        serializer = DefaultPaymentLimitsSerializer(limit)
        return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['POST'])
def create_service_type(request):
    if not authenticate_admin_user(request):
        return JsonResponse(status=403, data={'error': 'Unauthorized user'})
    service_type_id = request.data.get('service_type_id')
    description = request.data.get('description')
    pay_type = request.data.get('pay_type')

    # Check if a ServiceType with the provided service_type_id already exists
    try:
        service_type = ServiceTypes.objects.get(service_type_id=service_type_id)
        return Response({"message": "ServiceType with this service_type_id already exists."},
                        status=status.HTTP_400_BAD_REQUEST)
    except ObjectDoesNotExist:
        # If it doesn't exist, create a new one
        new_service_type = ServiceTypes(service_type_id=service_type_id, description=description, pay_type=pay_type)
        new_service_type.save()

        serializer = ServiceTypesSerializer(new_service_type)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
def get_user_payments(request):
    if not authenticate_admin_user(request):
        return JsonResponse(status=403, data={'error': 'Unauthorized user'})
    if request.method == 'GET':
        phone_num = request.GET.get('phone_num', None)
        email = request.GET.get('email', None)
        keycloak_username = request.GET.get('keycloak_username', None)

        if not (phone_num or email or keycloak_username):
            return JsonResponse({'error': 'Missing required parameters in the request'}, status=400)

        try:
            if phone_num:
                user = Users.objects.get(phonenum_encrypt=phone_num)
            elif email:
                user = Users.objects.get(email_encrypt=email)
            else:  # keycloak_username
                user = Users.objects.get(keycloak_username=keycloak_username)

            latest_payments = Payment.objects.filter(user_id=user)
            serializer = PaymentSerializer(latest_payments, many=True)
            return JsonResponse(serializer.data, status=200, safe=False)

        except Users.DoesNotExist:
            return JsonResponse({'error': 'User not found'}, status=404)

        except Exception as e:
            print(e)
            return JsonResponse({'error': 'Bad Request'}, status=400)


def get_keycloak_payments_from_token(request):
    if not authenticate_admin_user(request):
        return JsonResponse(status=403, data={'error': 'Unauthorized user'})
    if request.method == 'GET':
        keycloak_username = get_user_name(request)
        try:
            user = Users.objects.get(keycloak_username=keycloak_username)
            latest_payments = Payment.objects.filter(user_id=user)
            serializer = PaymentSerializer(latest_payments, many=True)
            return JsonResponse(serializer.data, status=200, safe=False)
        except Users.DoesNotExist:
            return JsonResponse({'error': 'User not found'}, status=404)
    return JsonResponse({'error': 'Bad Request'}, status=400)


@api_view(['GET'])
def get_default_limits(request, format=None):
    if not authenticate_keycloak_user(request):
        return JsonResponse(status=403, data={'error': 'Unauthorized user'})
    if request.method == 'GET':
        try:
            limits = DefaultPaymentLimits.objects.all()
            serializer = DefaultPaymentLimitsSerializer(limits, many=True)
            return JsonResponse(data=serializer.data, status=status.HTTP_200_OK, safe=False)
        except DefaultPaymentLimits.DoesNotExist:
            return JsonResponse(status=404, data={'error': 'Default payment limits not set'})
        except Exception as e:
            print(e)
            return Response(status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def create_package(request, format=None):
    if not authenticate_admin_user(request):
        return JsonResponse(status=403, data={'error': 'Unauthorized user'})
    print(request.data)
    serializer = PackageSerializer(data=request.data)
    if serializer.is_valid():
        try:
            # Check if there is an existing Package object with the same name or amount
            existing_package = Package.objects.get(name=serializer.validated_data['name'])
            return JsonResponse({'error': 'A Package with this name already exists.'}, status=400)
        except Package.DoesNotExist:
            pass

        try:
            existing_package = Package.objects.get(amount=serializer.validated_data['amount'])
            return JsonResponse({'error': 'A Package with this amount already exists.'}, status=400)
        except Package.DoesNotExist:
            pass

        # Retrieve the ServiceTypes object

        print(serializer.validated_data)
        # Create a new Package object
        new_package = Package(
            name=serializer.validated_data['name'],
            service_id=serializer.validated_data['service_id'],  # Assign the service object to service_id field
            description=serializer.validated_data['description'],
            amount=serializer.validated_data['amount'],
            payment_method=PaymentMethods.objects.get(id=request.data['payment_method']),
            time_period=serializer.validated_data['time_period'],
        )
        new_package.save()

        serializer = PackageSerializer(new_package)
        return JsonResponse(serializer.data, status=201)
    print(serializer.errors)
    return JsonResponse(serializer.errors, status=400)


@api_view(['GET'])
def get_package(request, format=None):
    if not authenticate_keycloak_user(request):
        return JsonResponse(status=403, data={'error': 'Unauthorized user'})
    if request.method == 'GET':
        try:
            packages = Package.objects.all()
            serializer = PackageSerializer(packages, many=True)

            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            print(e)
            return Response(status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT'])
def edit_package(request, package_name):
    if not authenticate_admin_user(request):
        return JsonResponse(status=403, data={'error': 'Unauthorized user'})
    decoded_package_name = unquote(package_name)

    try:
        package = Package.objects.get(name=decoded_package_name)

    except Package.DoesNotExist:
        return JsonResponse({'error': 'Package does not exist.'}, status=404)

    serializer = PackageSerializer(package, data=request.data)

    if serializer.is_valid():
        # Get the new amount and time_period
        new_amount = serializer.validated_data.get('amount', package.amount)
        new_time_period = serializer.validated_data.get('time_period', package.time_period)

        # Check if amount and time_period didn't change
        if package.amount == new_amount and package.time_period == new_time_period:

            return JsonResponse({'error': 'No changes were made to the package.'}, status=400)

        # Check if there is an existing Package object with the same name or amount
        name = serializer.validated_data.get('name', package.name)
        try:
            existing_package = Package.objects.exclude(pk=package.id).get(name=name)

            return JsonResponse({'error': 'A Package with this name already exists.'}, status=400)
        except Package.DoesNotExist:
            pass

        amount = serializer.validated_data.get('amount', package.amount)
        try:
            existing_package = Package.objects.exclude(pk=package.id).get(amount=amount)
            return JsonResponse({'error': 'A Package with this cost already exists.'}, status=400)
        except Package.DoesNotExist:
            pass

        # Update the existing Package object
        serializer.save()
        return JsonResponse(serializer.data)
    print(serializer.errors)

    return JsonResponse(serializer.errors, status=400)


@api_view(['POST'])
def create_default_payment_limit(request, format=None):
    if not authenticate_admin_user(request):
        return JsonResponse(status=403, data={'error': 'Unauthorized user'})
    if request.method == 'POST':
        data = json.loads(request.body)
        service_type_id = data.get('service_type_id')
        payment_method = data.get('payment_method')
        payment_limit = data.get('payment_limit')
        payment_limit_period_sec = data.get('payment_limit_period_sec')

        # Check if service_type_id is valid
        try:
            service_type = ServiceTypes.objects.get(service_type_id=service_type_id)
        except ServiceTypes.DoesNotExist:
            return JsonResponse(status=400, data={'error': 'Invalid service type id'})

        # Check if default payment limit already exists for given service type and payment method
        if DefaultPaymentLimits.objects.filter(service_type=service_type, payment_method=payment_method).exists():
            return JsonResponse(status=400, data={
                'error': 'Default payment limit already exists for this service type and payment method'})

        default_payment_limit = DefaultPaymentLimits(service_type=service_type, payment_method=payment_method,
                                                     payment_limit=payment_limit,
                                                     payment_limit_period_sec=payment_limit_period_sec)
        default_payment_limit.save()
        serializer = DefaultPaymentLimitsSerializer(default_payment_limit)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['PUT'])
def update_default_payment_limit(request, format=None):
    if not authenticate_admin_user(request):
        return JsonResponse(status=403, data={'error': 'Unauthorized user'})
    if request.method == 'PUT':
        data = json.loads(request.body)
        service_type_id = data.get('service_type_id')
        payment_method = data.get('payment_method')
        payment_limit = data.get('payment_limit')
        payment_limit_period_sec = data.get('payment_limit_period_sec')
        # Check if service_type_id is valid
        try:
            service_type = ServiceTypes.objects.get(service_type_id=service_type_id)
        except ServiceTypes.DoesNotExist:
            return JsonResponse(status=400, data={'error': 'Invalid service type id'})

        # Check if default payment limit exists for given service type and payment method
        try:
            limit = DefaultPaymentLimits.objects.get(service_type=service_type, payment_method=payment_method)
        except DefaultPaymentLimits.DoesNotExist:
            return JsonResponse(status=404, data={
                'error': 'Default payment limit does not exist for this service type and payment method'})

        limit.payment_limit = payment_limit
        limit.payment_limit_period_sec = payment_limit_period_sec
        limit.save()

        serializer = DefaultPaymentLimitsSerializer(limit)
        return Response(serializer.data, status=status.HTTP_200_OK)


@api_view(['POST'])
def create_service_type(request):
    if not authenticate_admin_user(request):
        return JsonResponse(status=403, data={'error': 'Unauthorized user'})
    data = json.loads(request.body)
    name = data.get('name')
    description = data.get('description')

    # Check if a ServiceType with the provided service_type_id already exists
    try:
        service_name = ServiceTypes.objects.get(name=name)
        print(service_name)
        return Response({"error": "FAIL: Service with this name already exists."},
                        status=status.HTTP_400_BAD_REQUEST)
    except ServiceTypes.DoesNotExist:
        # If it doesn't exist, create a new one
        new_service_type = ServiceTypes(name=name, description=description)
        new_service_type.save()

        serializer = ServiceTypesSerializer(new_service_type)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
