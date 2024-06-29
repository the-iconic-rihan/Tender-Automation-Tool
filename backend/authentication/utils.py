import string
import random
import re
from .models import Division
from datetime import datetime
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.response import Response
from dashboard_backend.logger import audit_logger, exception_logger
from bson import ObjectId
from datetime import datetime
import pymongo
from superuser_dashboard.utils.mongoUtils.mongoConnection import MongoConnection


def validate_password(password):
    # Check length
    if len(password) < 8:
        return False

    # Check for at least one capital letter, one small letter, and one special character
    regex = r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$'
    if not re.match(regex, password):
        return False

    return True


class UserRegistrationFunc():

    def generate_password(self):
        try:
            audit_logger.info("Generating a new password.")
            length = 15
            characters = string.ascii_letters + string.digits + string.punctuation
            password = ''.join(random.choice(characters)
                               for _ in range(length))
            audit_logger.info("Password generated successfully.")
            return password
        except Exception as e:
            exception_logger.error("Error generating password: {}", str(e))
            raise


class LoginFunc():

    def __init__(self, *args, **kwargs) -> None:
        pass

    def authenticate_user(self, division_name, user, session_id=None, reset_message=True):
        try:
            # Verify division
            audit_logger.info("Verifying division for the user.")
            division = Division.objects.filter(name=division_name).first()
            if division in user.divisions.all():
                # Generate JWT tokens
                refresh = RefreshToken.for_user(user)
                access_token = str(refresh.access_token)

                # Update last login
                user.last_login = datetime.now()
                user.last_login_date = datetime.now().date().strftime('%Y-%m-%d')
                user.save()

                # Return response
                audit_logger.info("User authenticated successfully.")
                response_data = {
                    'username': user.username,
                    'access_token': access_token,
                    'refresh_token': str(refresh),
                    'first_time': user.first_time,
                    'super_user': user.super_admin,
                    'division': division_name,
                    'login_date' : user.last_login_date,
                    'session_key': session_id,
                    'success': reset_message
                }
                audit_logger.info("response_data {}".format(response_data))

                # Log user login activity
                login_activity = LoginFunc().log_user_activity(user.username, "login",division_name,user.super_admin)     
                
                return Response(response_data)

                # return Response
            else:
                audit_logger.warning(
                    "User does not have access to this profile.")
                return Response({'error': "You don't have access to this profile."}, status=500)

        except Exception as e:
            exception_logger.error("Error authenticating user: {}", str(e))
            raise e


    def log_user_activity(self, user, activity_type, division_name, super_user):
        try:
            _, _, _, db = MongoConnection().connect_to_mongodb()
            user_activities = db["user_activities_metadata"]
            today_date = datetime.now().date().strftime('%Y-%m-%d')
            now_time = datetime.now().time().strftime('%H:%M:%S')

            role = 'super_user' if super_user else 'normal_user'
                
            # Find or create the user's latest login activity
            latest_login = user_activities.find_one_and_update(
                {'username': user, 'login_date': today_date},
                {
                    '$push': {'login_times': now_time},
                    '$set': {'role': role}
                },
                upsert=True,
                return_document=True
            )

            if not latest_login:
                exception_logger.error(f"No document found or created for user: {user}")
                return

            # Here, ensure the structure of your document matches these queries
            # Update or add new activity type
            activity_updated = user_activities.update_one(
                {'_id': latest_login['_id'], 'activities.type': activity_type},
                {'$inc': {'activities.$.count': 1}}
            )

            if activity_updated.matched_count == 0:
                user_activities.update_one(
                    {'_id': latest_login['_id']},
                    {'$push': {'activities': {'type': activity_type, 'count': 1}}}
                )

            # Update or add new division
            division_updated = user_activities.update_one(
                {'_id': latest_login['_id'], 'divisions.name': division_name},
                {'$inc': {'divisions.$.count': 1}}
            )

            if division_updated.matched_count == 0:
                user_activities.update_one(
                    {'_id': latest_login['_id']},
                    {'$push': {'divisions': {'name': division_name, 'count': 1}}}
                )

        except Exception as e:
            exception_logger.error(f"General error in log_user_activity for user: {user}, Error: {str(e)}")
            raise e

class LogoutFunc():

    def __init__(self, *args, **kwargs)->None:
        pass 
            
    def log_user_activity(self, login_activity_id, action, user_activities):
        
        """
        Log user activity for logout and update the corresponding login activity.
        """
        
        try:
        
            result = user_activities.update_one(
            {'_id': ObjectId(login_activity_id)},
            {'$set': {"activity_type":action, 
                        'logout_date': datetime.now().strftime('%Y-%m-%d'),
                        'logout_time':datetime.now().strftime('%H:%M:%S')}})
                # Check if the update was successful
            if result.matched_count > 0:
                latest_login_activity = user_activities.find_one({'_id': ObjectId(login_activity_id)})
                audit_logger.info(f"{latest_login_activity['username']} logged out.")
                return latest_login_activity
            else:
                audit_logger.info(f"No login activity found with ID: {login_activity_id}")

            return latest_login_activity

        except Exception as e:
            # Handle the exception (log or raise, depending on your needs)
            exception_logger.error(f"Error updating user activity: {str(e)}")
            raise e
