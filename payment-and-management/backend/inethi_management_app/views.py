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


@api_view(['GET'])
def get_payment_methods(request):
    choices = dict(PaymentMethods.choices)
    return JsonResponse(choices)


keycloak_openid = KeycloakOpenID(
    server_url="https://keycloak.inethilocal.net/auth/",
    client_id="portal-local",
    realm_name="master",
)


@api_view(['POST'])
def get_user_from_token(request):
    data = json.loads(request.body)
    token = data.get('token')
    try:
        user = keycloak_openid.userinfo(token)
        print(user)
        return Response(user, status=status.HTTP_200_OK)
    except Exception as e:
        print(e)
        return HttpResponse('Unauthorized', status=401)


@api_view(['GET'])
def check_payment_user_limit(request, format=None):
    if request.method == 'GET':
        try:
            dic = json.load(request)
            service_type = dic['service_type_id']
            payment_method = dic["payment_method"]
            if 'phone_num' in dic:
                phone_num = dic['phone_num']
                try:
                    user = Users.objects.get(phonenum_encrypt=phone_num)
                    limit = UserPaymentLimits.objects.get(user_id=user, service_type_id=service_type,
                                                          payment_method=payment_method)

                    serializer = UserPaymentLimitsSerializer(limit)
                    return Response(serializer.data, status=status.HTTP_200_OK)
                except Users.DoesNotExist:
                    return JsonResponse(status=404, data={'error': 'user not registered'})
                except UserPaymentLimits.DoesNotExist:
                    return JsonResponse(status=404, data={'error': 'user payment limit not set'})
            elif 'email' in dic:
                email = dic['email']
                try:
                    user = Users.objects.get(email_encrypt=email)
                    limit = UserPaymentLimits.objects.get(user_id=user, service_type_id=service_type,
                                                          payment_method=payment_method)
                    serializer = UserPaymentLimitsSerializer(limit)
                    return Response(serializer.data, status=status.HTTP_200_OK)
                except Users.DoesNotExist:
                    return JsonResponse(status=404, data={'error': 'user not registered'})
                except UserPaymentLimits.DoesNotExist:
                    return JsonResponse(status=404, data={'error': 'user payment limit not set'})
            elif 'keycloak_id' in dic:
                keycloak_id = dic['keycloak_id']
                try:
                    user = Users.objects.get(keycloak_id=keycloak_id)
                    limit = UserPaymentLimits.objects.get(user_id=user, service_type_id=service_type,
                                                          payment_method=payment_method)
                    serializer = UserPaymentLimitsSerializer(limit)
                    return Response(serializer.data, status=status.HTTP_200_OK)
                except Users.DoesNotExist:
                    return JsonResponse(status=404, data={'error': 'user not registered'})
                except UserPaymentLimits.DoesNotExist:
                    return JsonResponse(status=404, data={'error': 'user payment limit not set'})
        except:
            return JsonResponse(status=400, data={'error': 'incorrectly formatted request'})


@api_view(['GET'])
def check_payment_default_limit(request, format=None):
    if request.method == 'GET':
        try:
            service_type = request.data['service_type']
            payment_method = request.data['payment_method']
            try:
                limit = DefaultPaymentLimits.objects.get(
                    service_type_id=service_type, payment_method=payment_method)
                serializer = DefaultPaymentLimitsSerializer(limit)
                return Response(serializer.data, status=status.HTTP_200_OK)
            except DefaultPaymentLimits.DoesNotExist:
                return JsonResponse(status=404, data={'error': 'default payment limit not set'})
        except:
            return JsonResponse(status=400, data={'error': 'incorrectly formatted request'})


@api_view(['POST'])
def purchase(request, format=None):
    """
    End point to register a purchase. User is registered if not already registered, payment method is checked, payment
    limit is checked and a payment is added to the DB if all these requirements are met.
    :param request: JSON object
    :param format: optional requirement to change browser format
    :return: http status and message
    """
    if request.method == 'POST':
        try:
            phone_num = None
            email = None
            keycloak_id = None

            voucher = False
            dic = json.load(request)
            print(dic)
            # int indicating payment method (type)
            payment_method = dic['payment_method']
            amount = int(dic['amount'])
            service_period_sec = dic['service_period_sec']
            package = dic['package']  # description of service
            service_type = dic['service_type_id']  # registered service IDs

            if 'phone_num' in dic:
                phone_num = dic['phone_num']
                try:
                    user = Users.objects.get(phonenum_encrypt=phone_num)
                except Users.DoesNotExist:
                    user = Users.objects.create(
                        phonenum_encrypt=phone_num, joindate_time=datetime.now())  # create
                    # user if they do not exist in the DB
            elif 'email' in dic:
                email = dic['email']
                try:
                    user = Users.objects.get(email_encrypt=email)
                except Users.DoesNotExist:
                    user = Users.objects.create(
                        email_encrypt=email, email=datetime.now())  # create
                    # user if they do not exist in the DB
            elif 'keycloak_id' in dic:
                keycloak_id = dic['keycloak_id']
                try:
                    user = Users.objects.get(keycloak_id=keycloak_id)
                except Users.DoesNotExist:
                    user = Users.objects.create(
                        keycloak_id=keycloak_id, joindate_time=datetime.now())  # create
                    # user if they do not exist in the DB
            else:
                return JsonResponse(status=400, data={'error': 'no user identifier found'})
            try:
                limit = DefaultPaymentLimits.objects.get(
                    service_type_id=service_type, payment_method=payment_method)
            except DefaultPaymentLimits.DoesNotExist:
                return JsonResponse(status=404, data={'error': 'default payment limit not set'})
            limit_user_exists = False
            try:
                limit_user = UserPaymentLimits.objects.get(user_id=user, service_type_id=service_type,
                                                           payment_method=payment_method)
                limit_user_exists = True
            except UserPaymentLimits.DoesNotExist:
                pass  # this doesn't matter as limit would have been set above by default
            if limit_user_exists:
                limit = limit_user
            total_spent = 0
            if service_type == 1:
                voucher = True
            try:
                last_payment = Payment.objects.filter(user_id=user, service_type_id=service_type,
                                                      payment_method=payment_method).latest('paydate_time')
            except Payment.DoesNotExist:
                last_payment = None
            print("The payment limit is", limit.payment_limit)
            if last_payment is not None:
                print("Found last payment")
                try:
                    start = datetime.now() - timedelta(seconds=limit.payment_limit_period_sec)
                    latest_payments = Payment.objects.filter(user_id=user,
                                                             paydate_time__range=[start, datetime.now(
                                                                 tz=pytz.utc)]).values_list('amount', flat=True)
                    latest_payments = list(latest_payments)
                    for payments in latest_payments:
                        total_spent = total_spent + payments
                except Exception as e:
                    print(e)
                    return JsonResponse(status=404, data={'error': 'cannot retrieve payments'})
            total_spent = total_spent + amount
            print("total spent", total_spent)
            if last_payment is not None:

                # Get new voucher
                # chosenProfile = "TIME30M"
                # print(PriceToPackageMap)

                if Package.objects.filter(amount=amount).exists():
                    # Get new voucher
                    package = get_object_or_404(Package, amount=amount)
                    chosenProfile = package.name
                    service_period_sec = package.time_period
                    print("Profile", chosenProfile)
                    nextVoucher = Vouchers.objects.using('radiusdeskdb').filter(
                        status="new", profile=chosenProfile).filter(batch__icontains="digital").first()
                    if (nextVoucher):
                        voucherName = nextVoucher.name
                    else:
                        return JsonResponse(status=400, data={'error': 'packages still need to be setup in RadiusDesk'})

                    # Reserve vouhcer
                    nextVoucher.status = "issued"  # reserve voucher in DB
                    nextVoucher.paytype = "cic"
                    if (phone_num):
                        nextVoucher.phone_number = phone_num
                    elif (email):
                        nextVoucher.phone_number = email
                    else:
                        nextVoucher.phone_number = keycloak_id
                    nextVoucher.amount = str(amount)
                    nextVoucher.save(using='radiusdeskdb')

                    # match.voucher_pin = voucher_pin can't do this as this is unique and will cause a DB error if user tries to
                    # reuse a 1FORYOU voucher
                    print("reserving voucher code: ", voucherName)

                    last_payment_time = last_payment.paydate_time
                    time_now = datetime.now()
                    naive_payment_time = last_payment_time.replace(tzinfo=None)
                    naive_time_now = time_now.replace(tzinfo=None)
                    delta = naive_time_now - naive_payment_time  # fixes naive vs aware time
                    if delta.seconds > limit.payment_limit_period_sec or total_spent <= limit.payment_limit:
                        try:
                            if voucher:
                                payment = Payment.objects.create(user_id=user, payment_method=payment_method,
                                                                 amount=amount,
                                                                 paydate_time=datetime.now(
                                                                     tz=pytz.UTC),
                                                                 service_type_id=service_type,
                                                                 service_period_sec=service_period_sec,
                                                                 package=chosenProfile,
                                                                 voucher=voucherName)
                            else:
                                payment = Payment.objects.create(user_id=user, payment_method=payment_method,
                                                                 amount=amount,
                                                                 paydate_time=datetime.now(
                                                                     tz=pytz.UTC),
                                                                 service_type_id=service_type,
                                                                 service_period_sec=service_period_sec,
                                                                 package=package)
                        except Exception as e:
                            print(e)
                        serializer = PaymentSerializer(payment)
                        print("first if (last payment exists)")
                        return Response(serializer.data, status=status.HTTP_201_CREATED)
                    elif total_spent >= limit.payment_limit:
                        print("second elif (last payment exists)")
                        remaining_time = int(
                            limit.payment_limit_period_sec) - int(delta.seconds)
                        return JsonResponse(status=400, data={'error': 'payment limit exceeded in time window',
                                                              'time_left': remaining_time,
                                                              'payment_limit': limit.payment_limit,
                                                              'amount_spent': int(total_spent - amount)})
                else:
                    return JsonResponse(status=400, data={'error': 'amount not available for internet coupon',
                                                          'payment_limit': limit.payment_limit,
                                                          'amount_spent': int(total_spent - amount)})

            elif limit.payment_limit >= total_spent:
                print("first elif (last payment does not exist)")

                if Package.objects.filter(amount=amount).exists():
                    # Get new voucher
                    package = get_object_or_404(Package, amount=amount)
                    chosenProfile = package.name
                    service_period_sec = package.time_period
                    print("Profile", chosenProfile)
                    nextVoucher = Vouchers.objects.using('radiusdeskdb').filter(
                        status="new", profile=chosenProfile).filter(batch__icontains="digital").first()
                    if (nextVoucher):
                        voucherName = nextVoucher.name
                    else:
                        return JsonResponse(status=400, data={'error': 'packages still need to be setup in RadiusDesk'})

                    # Reserve vouhcer
                    nextVoucher.status = "issued"  # reserve voucher in DB
                    nextVoucher.paytype = "cic"
                    if (phone_num):
                        nextVoucher.phone_number = phone_num
                    elif (email):
                        nextVoucher.phone_number = email
                    else:
                        nextVoucher.phone_number = keycloak_id
                    nextVoucher.amount = str(amount)
                    nextVoucher.save(using='radiusdeskdb')

                    if voucher:
                        payment = Payment.objects.create(user_id=user, payment_method=payment_method, amount=amount,
                                                         paydate_time=datetime.now(
                                                             tz=pytz.UTC),
                                                         service_type_id=service_type,
                                                         service_period_sec=service_period_sec,
                                                         package=chosenProfile,
                                                         voucher=voucherName)
                    else:
                        payment = Payment.objects.create(user_id=user, payment_method=payment_method, amount=amount,
                                                         paydate_time=datetime.now(
                                                             tz=pytz.UTC),
                                                         service_type_id=service_type,
                                                         service_period_sec=service_period_sec,
                                                         package=package)
                    serializer = PaymentSerializer(payment)
                    return Response(serializer.data, status=status.HTTP_201_CREATED)
                else:
                    return JsonResponse(status=400, data={'error': 'amount not available for internet coupon',
                                                          'payment_limit': limit.payment_limit,
                                                          'amount_spent': int(total_spent - amount)})

            else:
                remaining_time = int(limit.payment_limit_period_sec)
                return JsonResponse(status=400,
                                    data={'error': 'payment limit exceeded in time window', 'time_left': remaining_time,
                                          'payment_limit': limit.payment_limit,
                                          'amount_spent': int(total_spent - amount)})  # TODO add payment limit

        except Exception as e:
            print(e)
            return JsonResponse(status=400, data={'error': 'incorrectly formatted request'})


@api_view(['GET'])
def request_user_data(request, format=None):
    if request.method == 'GET':
        try:
            keycloak_id = request.data['keycloak_id']
            try:
                user = Users.objects.get(keycloak_id=keycloak_id)
                serializer = UsersSerializer(user)
                return Response(serializer.data, status=status.HTTP_200_OK)
            except DefaultPaymentLimits.DoesNotExist:
                return Response(status=status.HTTP_404_NOT_FOUND)
        except:
            return Response(status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def register_user(request, format=None):
    if request.method == 'POST':
        dic = json.load(request)
        print(dic)
        if 'phone_num' in dic:
            phone_num = dic['phone_num']
            try:
                user = Users.objects.get(phonenum_encrypt=phone_num)
                return JsonResponse(status=400, data={'error': 'user already exists'})
            except Users.DoesNotExist:
                user = Users.objects.create(
                    phonenum_encrypt=phone_num, joindate_time=datetime.now(tz=pytz.UTC))
                serializer = UsersSerializer(user)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
        elif 'email' in dic:
            email = dic['email']
            try:
                user = Users.objects.get(email_encrypt=email)
                return JsonResponse(status=400, data={'error': 'user already exists'})
            except Users.DoesNotExist:
                user = Users.objects.create(
                    email_encrypt=email, joindate_time=datetime.now(tz=pytz.UTC))
                serializer = UsersSerializer(user)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
        elif 'keycloak_id' in dic:
            keycloak_id = dic['keycloak_id']
            try:
                user = Users.objects.get(keycloak_id=keycloak_id)
                return JsonResponse(status=400, data={'error': 'user already exists'})
            except Users.DoesNotExist:
                user = Users.objects.create(
                    phonenum_encrypt=keycloak_id, joindate_time=datetime.now(tz=pytz.UTC))
                serializer = UsersSerializer(user)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return JsonResponse(status=400, data={'error': 'no user identifier found'})


@api_view(['GET'])
def request_services(request, format=None):
    if request.method == 'GET':
        services = ServiceTypes.objects.all()
        serializer = ServiceTypesSerializer(services, many=True)
        return Response(serializer.data)


@api_view(['GET'])
def get_latest_purchase(request, format=None):  # TODO make this not phone number only!
    if request.method == 'GET':
        dic = json.load(request)
        service_type_id = dic['service_type_id']
        phone_num = dic['phone_num']
        user = Users.objects.get(phonenum_encrypt=phone_num)
        payment_method = dic['payment_method']
        try:
            latest_payment = Payment.objects.filter(user_id=user, service_type_id=service_type_id,
                                                    payment_method=payment_method).latest('paydate_time')
            serializer = PaymentSerializer(latest_payment)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Payment.DoesNotExist:
            return JsonResponse(status=404, data={'error': 'no payments found'})


@api_view(['GET'])
def get_time_since_last_purchase(request, format=None):  # TODO make this not phone number only!
    if request.method == 'GET':
        dic = json.load(request)
        service_type_id = dic['service_type_id']
        phone_num = dic['phone_num']
        user = Users.objects.get(phonenum_encrypt=phone_num)
        payment_method = dic['payment_method']
        try:
            latest_payment = Payment.objects.filter(user_id=user, service_type_id=service_type_id,
                                                    payment_method=payment_method).latest('paydate_time')
        except Payment.DoesNotExist:
            return JsonResponse(status=404, data={'error': 'no payments found'})
        except Users.DoesNotExist:
            return JsonResponse(status=404, data={'error': 'no user found'})
        last_payment_time = latest_payment.paydate_time
        time_now = datetime.now()
        naive_payment_time = last_payment_time.replace(tzinfo=None)
        naive_time_now = time_now.replace(tzinfo=None)
        delta = naive_time_now - naive_payment_time  # fixes naive vs aware time
        return JsonResponse(status=200, data={'time_difference': delta.seconds})


@api_view(['GET'])
def get_last_payments_by_time_period(request, format=None):
    if request.method == 'GET':
        try:
            dic = json.load(request)
            payment_limit_period_sec = dic["payment_limit_period_sec"]
            start = datetime.now() - timedelta(seconds=payment_limit_period_sec)
            latest_payments = Payment.objects.filter(
                paydate_time__range=[start, datetime.now(tz=pytz.utc)]).values_list('amount', flat=True)
            latest_payments = list(latest_payments)
            print(latest_payments)
            return JsonResponse(status=200, data=latest_payments, safe=False)
        except Exception as e:
            print(e)
            return Response(status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def get_user_payments(request):  # TODO make not keycloack ID only
    if request.method == 'GET':
        # Get the token from the request headers
        token = request.headers.get('Authorization')
        if not token:
            return JsonResponse({'error': 'Token not provided'}, status=400)

        # Remove the 'Bearer ' part
        token = token[7:]

        try:
            userinfo = keycloak_openid.userinfo(token)
            username = userinfo['preferred_username']
        except Exception as e:
            print(e)
            return Response(status=status.HTTP_400_BAD_REQUEST)
        try:
            try:
                user = Users.objects.get(keycloak_id=username)
            except Users.DoesNotExist:
                return JsonResponse(status=400, data={'error': 'no user found'})
            latest_payments = Payment.objects.filter(user_id=user)
            serializer = PaymentSerializer(latest_payments, many=True)
            # latest_payments = list(serializer)
            print(serializer.data)

            return JsonResponse(status=200, data=serializer.data, safe=False)
        except Exception as e:
            print(e)
            return Response(status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def get_default_limits(request, format=None):
    if request.method == 'GET':
        try:
            try:
                limit = DefaultPaymentLimits.objects.filter()
                serializer = DefaultPaymentLimitsSerializer(limit, many=True)
                return JsonResponse(data=serializer.data, status=status.HTTP_200_OK, safe=False)
            except DefaultPaymentLimits.DoesNotExist:
                return JsonResponse(status=404, data={'error': 'default payment limits not set'})
        except Exception as e:
            print(e)
            return Response(status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def check_payment_user_limit(request, user):  # TODO make this not only work for Keycloak ID
    if request.method == 'GET':
        keycloak_id = user
        try:
            user = Users.objects.get(keycloak_id=keycloak_id)
            limit = UserPaymentLimits.objects.filter(user_id=user)
            serializer = UserPaymentLimitsSerializer(limit, many=True)
            return JsonResponse(serializer.data, status=status.HTTP_200_OK, safe=False)
        except Users.DoesNotExist:
            return JsonResponse(status=400, data={'error': 'no user found'})
        except UserPaymentLimits.DoesNotExist:
            return JsonResponse(status=404, data={'error': 'user payment limit not set'})


@api_view(['POST'])
def create_package(request, format=None):
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

        # Create a new Package object
        serializer.save()
        return JsonResponse(serializer.data, status=201)
    return JsonResponse(serializer.errors, status=400)


@api_view(['GET'])
def get_package(request, format=None):
    if request.method == 'GET':
        try:
            packages = Package.objects.all()
            serializer = PackageSerializer(packages, many=True)  # assuming you have a serializer for the Package model
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            print(e)
            return Response(status=status.HTTP_400_BAD_REQUEST)


@api_view(['PUT'])
def edit_package(request, package_id):
    try:
        package = Package.objects.get(pk=package_id)
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
    return JsonResponse(serializer.errors, status=400)



@api_view(['POST'])
def create_default_payment_limit(request, format=None):
    if request.method == 'POST':
        data = json.loads(request.body)
        token = data.get('token')
        try:
            userinfo = keycloak_openid.userinfo(token)
            print(userinfo)
            if userinfo['preferred_username'] != 'inethi':
                return HttpResponse('Unauthorized', status=401)
        except Exception as e:
            print(e)
            return HttpResponse('Unauthorized', status=401)
        dic = json.load(request)
        service_type_id = dic['service_type_id']
        payment_method = dic['payment_method']
        payment_limit = dic['payment_limit']
        payment_limit_period_sec = dic['payment_limit_period_sec']

        # Check if service_type_id is valid
        try:
            service_type = ServiceTypes.objects.get(service_type_id=service_type_id)
        except ServiceTypes.DoesNotExist:
            return JsonResponse(status=400, data={'error': 'Invalid service type id'})

        # Check if default payment limit already exists for given service type and payment method
        if DefaultPaymentLimits.objects.filter(service_type_id=service_type_id, payment_method=payment_method).exists():
            return JsonResponse(status=400, data={
                'error': 'Default payment limit already exists for this service type and payment method'})

        default_payment_limit = DefaultPaymentLimits(service_type_id=service_type_id, payment_method=payment_method,
                                                     payment_limit=payment_limit,
                                                     payment_limit_period_sec=payment_limit_period_sec)
        default_payment_limit.save()

        serializer = DefaultPaymentLimitsSerializer(default_payment_limit)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['PUT'])
def update_default_payment_limit(request, format=None):
    if request.method == 'PUT':
        try:
            data = json.loads(request.body)
            token = data.get('token')
            try:
                userinfo = keycloak_openid.userinfo(token)
                print(userinfo)
                if userinfo['preferred_username'] != 'inethi':
                    return HttpResponse('Unauthorized', status=401)
            except Exception as e:
                print(e)
                return HttpResponse('Unauthorized', status=401)
            service_type_id = request.data['service_type_id']
            payment_method = request.data['payment_method']
            payment_limit = request.data['payment_limit']
            payment_limit_period_sec = request.data['payment_limit_period_sec']

            # Check if service_type_id is valid
            try:
                service_type = ServiceTypes.objects.get(service_type_id=service_type_id)
            except ServiceTypes.DoesNotExist:
                print('error: Invalid service type id')
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

        except Exception as e:
            print(e)
            return JsonResponse(status=400, data={'error': 'Bad Request'})


@api_view(['POST'])
def create_service_type(request):
    data = json.loads(request.body)
    token = data.get('token')
    try:
        userinfo = keycloak_openid.userinfo(token)
        print(userinfo)
        if userinfo['preferred_username'] != 'inethi':
            return HttpResponse('Unauthorized', status=401)
    except Exception as e:
        print(e)
        return HttpResponse('Unauthorized', status=401)
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
