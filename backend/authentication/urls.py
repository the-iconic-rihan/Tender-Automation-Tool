from django.contrib import admin
from django.urls import path
from rest_framework_simplejwt import views as jwt_views
from .views import CreateUserView, LoginView, ResetPasswordView, AuthLogoutView, ForgotPasswordView, PasswordResetConfirmView, CustomTokenRefreshView, VerifyDivision

urlpatterns = [
    path('create-user/', CreateUserView.as_view(), name='create_user'),
    path('login/', LoginView.as_view(), name='login'),
    path('reset-password/', ResetPasswordView.as_view(), name='reset_password'),
    path('logout/', AuthLogoutView.as_view(), name='logout'),
    path('forgot-password/', ForgotPasswordView.as_view(), name='forgot_password'),
    path('password/reset/confirm/<str:uidb64>/<str:token>/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    path('token/refresh/', CustomTokenRefreshView.as_view(), name='token_refresh'),
    path('verify-division/', VerifyDivision.as_view(), name='verify_division')

]