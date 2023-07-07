from django.contrib import admin
from django.urls import path
from inethi_management_app import views
from rest_framework.urlpatterns import format_suffix_patterns

urlpatterns = [
    path('admin/', admin.site.urls),
    path('userlimits/', views.check_payment_user_limit),
    path('defaultlimits/', views.check_payment_default_limit),
    path('getdefaultlimits/', views.get_default_limits),
    path('getuserlimits/', views.check_payment_user_limit),
    path('create-package/', views.create_package),
    path('edit-package/<str:package_name>/', views.edit_package),
    path('create_default_payment_limit/', views.create_default_payment_limit),
    path('payment-methods/', views.get_payment_methods),
    path('update-default-payment-limit/', views.update_default_payment_limit),
    path('create-service-type/', views.create_service_type),
    path('get-packages/', views.get_package),
    path('get_user_payments/', views.get_user_payments),
    path('get-services/', views.request_services),
]

urlpatterns = format_suffix_patterns(urlpatterns)
