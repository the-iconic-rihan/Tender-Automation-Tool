from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate, logout
from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Division, User
from .utils import *
from django.urls import reverse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .email_utils import *
from dashboard_backend.logger import audit_logger,exception_logger,transaction_logger 
from rest_framework.exceptions import NotFound, ValidationError
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.exceptions import NotFound
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_text
from django.contrib.sites.shortcuts import get_current_site
from django.urls import reverse
from rest_framework_simplejwt.views import TokenRefreshView
import pymongo
from django.contrib.sessions.models import Session
from superuser_dashboard.utils.utils import division_switch_activity
from datetime import datetime

class CreateUserView(APIView):
    """
    API view for creating a new user.
    """
    def post(self, request):
        try:
            username = request.data.get('username')
            division_ids_string = request.data.get('division[]')

            # Strip any potential whitespaces from division_ids
            division_ids = [division_id.strip() for division_id in division_ids_string.split(',')] if division_ids_string else []
                        
            # Check if username already exists
            if User.objects.filter(username=username).exists():
                audit_logger.info(f"Attempt to create user '{username}' failed. User already exists.")
                return Response({'message': 'User already exists'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Autogenerate password
            password = User.objects.make_random_password(length=15)
            audit_logger.info(f"Password auto-generated for user '{username}'.")
            # Create user
            
            user = User.objects.create(username=username, password=password)
            transaction_logger.info(f"User '{username}' created successfully.")
            # Retrieve division instances based on division_ids (case-insensitive)
            
            divisions = Division.objects.filter(name__in=[division.name for division in Division.objects.all() if division.name.lower() in [d.lower() for d in division_ids]])
            user.divisions.set(divisions)
            transaction_logger.info(f"Divisions set for user '{username}'.")
            send_user_register_email(
                username, username, password
            )
            audit_logger.info(f"Registration email sent to user '{username}'.")
            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)
            # Return response
            return Response({
                'username': username,
                'password': password,
                'division': [division.name for division in divisions],
                'first_time': True,
                'access_token': access_token
            })
        except Exception as e:
            # Properly handle exceptions and return appropriate error response
            error_message = str(e)
            exception_logger.exception(f"An error occurred while creating user '{username}': {error_message}")
            return Response({'message': error_message}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        

class LoginView(APIView):
    """
    API view for user login and generating JWT tokens.
    """

    def __init__(self, *args, **kwargs)-> None:
      pass
  
    def post(self, request):
        try:
            username = request.data.get('username')
            password = request.data.get('password').strip()
            division_name = request.data.get('division')

            # Check if username, password, and division_name are provided
            if not username or not password or not division_name:
                audit_logger.info("Failed login attempt. Username, password, or division_name not provided.")
                return Response({'error': 'Please provide username, password, and division.'}, status=status.HTTP_400_BAD_REQUEST)

            # Find the user by username
            user = get_object_or_404(User, username=username)

            # If it's the user's first login, no need to check password again
            if user.first_time:
                audit_logger.info(f"User '{username}' is logging in for the first time.")
                request.session['division'] = division_name
                request.session['username'] = username
                request.session.save()
                
                return LoginFunc().authenticate_user(division_name, user,request.session.session_key)

            # Authenticate user with provided credentials
            authenticated_user = authenticate(request, username=username, password=password)
            if authenticated_user is not None:
                transaction_logger.info(f"User '{username}' authenticated successfully.")
                # Create a new session for the user
                
                request.session['user_id'] = authenticated_user.id
                request.session['division'] = division_name
                request.session['username'] = username

                request.session.save()
                
                
               
                return LoginFunc().authenticate_user(division_name, authenticated_user,request.session.session_key)

            else:
                exception_logger.error(f"Failed login attempt for user '{username}'. Invalid credentials.")
                return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

        except User.DoesNotExist:
            exception_logger.error(f"Failed login attempt. User '{username}' does not exist.")
            return Response({'error': 'User with the provided username does not exist'}, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            exception_logger.error(f"An error occurred during login for user '{username}': {str(e)}")
            return Response({'error': 'An error occurred: {}'.format(str(e))}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ResetPasswordView(APIView):
    """
    API view for resetting user password.
    """
    def post(self, request):
        
        try:
            username = request.data.get('username')
            old_password = request.data.get('old_password')
            new_password = request.data.get('new_password')

            if validate_password(new_password) == False:
                audit_logger.info(f"Failed password reset attempt for user '{username}'. Insecure password.")
                return JsonResponse({'error': 'Your password must exceed 8 characters and include at least one uppercase letter, one lowercase letter, a number and one special character for optimal security.'}, status=status.HTTP_400_BAD_REQUEST)

            # Retrieve user
            user = get_object_or_404(User, username=username)
            print(old_password, user.password)
            
            # Authenticate user
            if user is None or old_password != user.password:
                audit_logger.info(f"Failed password reset attempt for user '{username}'. Invalid old password.")
                return JsonResponse({'error': 'Invalid old password'}, status=status.HTTP_400_BAD_REQUEST)
            
            # Set and save new password
            user.set_password(new_password)
            user.first_time = False
            user.save()

            transaction_logger.info(f"User '{username}' successfully reset password.")
            
            return Response({'success': 'Password reset successfully', 'first_time' : user.first_time})
        
        except NotFound:
            audit_logger.info(f"Failed password reset attempt. User '{username}' not found.")
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        except ValidationError as ve:
            exception_logger.exception(f"Validation error during password reset for user '{username}': {ve.detail}")
            return Response({'error': ve.detail}, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            exception_logger.exception(f"An error occurred during password reset for user '{username}': {str(e)}")
            return Response({"error": "Internal server error"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ForgotPasswordView(APIView):
    def post(self, request):
        try:
            email = request.data.get('email')
            user = User.objects.get(username=email)
            
            # Generate reset token
            reset_token = default_token_generator.make_token(user)
            audit_logger.info(f"Password reset token generated for user '{email}'.")

            # Build reset password link
            current_site = get_current_site(request)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            reset_link = reverse('password_reset_confirm', args=[uid, reset_token])
            reset_url = f"http://{current_site.domain}{reset_link}"

            send_password_reset_email(email, reset_token, uid)
            audit_logger.info(f"Password reset email sent to user '{email}'.")

            return Response({'success': 'Password reset link has been sent to your email.', 'reset_url': reset_url})

        except User.DoesNotExist:
            audit_logger.info(f"Password reset attempt failed. User '{email}' does not exist.")
            return Response({'error': 'User with the provided email does not exist'}, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            exception_logger.exception(f"An error occurred during password reset for user '{email}': {str(e)}")
            return Response({'error': 'An error occurred: {}'.format(str(e))}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        
class PasswordResetConfirmView(APIView):
    def post(self, request, uidb64, token):
        try:
            uid = force_text(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
            
            if default_token_generator.check_token(user, token):
                new_password = request.data.get('new_password')
                confirm_password = request.data.get('confirm_password')

                if new_password != confirm_password:
                    audit_logger.info(f"Password reset failed for user '{uid}': passwords do not match.")
                    return Response({'error': 'Passwords do not match'}, status=status.HTTP_400_BAD_REQUEST)

                user.set_password(new_password)
                user.save()
                audit_logger.info(f"{user.get_username()}'s password was changed successfully.")

                username = user.get_username()
                division = user.divisions.first()
                password = new_password
                

                # audit_logger.info(f"Password reset successfully for user, now signing the user in'{uid}'.")

                user = get_object_or_404(User, username=username)
                authenticated_user = authenticate(request, username=username, password=password)

                if authenticated_user is not None:
                    transaction_logger.info(f"User '{username}' authenticated successfully.")
                    # Create a new session for the user
                    
                    request.session['user_id'] = authenticated_user.id
                    request.session['division'] = division.name
                    request.session['username'] = username

                    # request.session.set_expiry(86400)  # Set the session expiry time (in seconds)
                    audit_logger.info("Session ID before saving: {}".format(request.session.session_key))
                    request.session.save()
                    audit_logger.info("Session ID after saving: {}".format(request.session.session_key))
                    audit_logger.info(f"{username} logged in after saving the new password.")
                    
                    return LoginFunc().authenticate_user(division.name, authenticated_user,request.session.session_key, True)

                else:
                    audit_logger.info(f"The login operation for {username} is unsuccessful after saving the new password.")
                    return Response({'success': False})

            else:
                audit_logger.info(f"Invalid reset token for user '{uid}'.")
                return Response({'error': 'Invalid reset token'}, status=status.HTTP_400_BAD_REQUEST)

        except User.DoesNotExist:
            return Response({'error': 'User with the provided ID does not exist'}, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            return Response({'error': 'An error occurred: {}'.format(str(e))}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class AuthLogoutView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            # Call Django's logout method to log out the user
            username = request.data.get('username')   
            _,_, user_activities,_ = MongoConnection().connect_to_mongodb()

            # Find the latest login activity for the user
            latest_login_activity = user_activities.find_one({
                'username': "John",
                'login_date': datetime.now().date().strftime('%Y-%m-%d'),
            })
            if latest_login_activity:
                # Update the latest login activity with the logout time
                LogoutFunc().log_user_activity(
                    latest_login_activity['_id'], "logout", user_activities
                )

            logout(request)
            # Clear the session
            session_key = request.session.session_key
            Session.objects.filter(session_key=session_key).delete()
            transaction_logger.info(f"User '{request.user}' logged out successfully.")


            return Response({'success': 'Logout successful'}, status=status.HTTP_200_OK)            # Return a success response
            # return Response({'message': 'User logged out successfully'})
        
        except Exception as e:
            exception_logger.exception(f"An error occurred during logout for user '{username}': {str(e)}")
            return Response({'error': 'An error occurred during logout.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class CustomTokenRefreshView(TokenRefreshView):
    pass



class VerifyDivision(APIView):
    def post(self, request):
        try:
            username = request.data.get("username")
            division = request.data.get("division")
            login_date  = request.data.get("loginDate")
            user = User.objects.get(username=username)
            # Check if the division exists for the user
            
            if user.divisions.filter(name__iexact=division).exists():
                audit_logger.info(f"{username} switched to {division} profile.")
                
                division_switch_activity().divsion_switch_user_activity(username,division,"2023-11-24")
                
                return Response({
                    'user': username,
                    'succeeded': True,
                    'division': division
                })
            else:
                return Response({
                    'user': username,
                    'succeeded': False,
                    'error': 'You donot have access to this profile.'
                }, status=status.HTTP_400_BAD_REQUEST)
            

        except User.DoesNotExist:
            exception_logger.exception(f"User not found during profile change operation.")
            return Response({'error': 'User not found'}, status=status.HTTP_400_BAD_REQUEST)

        except Exception as e:
            exception_logger.exception(f"An exception occured during profile change operation {format(e)}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
