
from .mongoUtils.mongoConnection import MongoConnection 
from dashboard_backend.logger import exception_logger,audit_logger,transaction_logger
from datetime import datetime
class division_switch_activity():   
    
    def __init__(self, *args, **kwargs):
        pass    

    def divsion_switch_user_activity(self, user, division_name, login_date):
        try:
            _, _,_,db = MongoConnection().connect_to_mongodb()
            
            user_activities = db['user_activities_metadata']
            
            # Find or create the user's latest login activity
            latest_login = user_activities.find_one_and_update(
                {'username': user, 'login_date': login_date},
                {'$setOnInsert': {'username': user, 'login_date': login_date}},  # Set fields on insert
                upsert=True,  # Create a new document if none matches
                return_document=True  # Return the new or updated document
            )

            if not latest_login:
                exception_logger.error(f"No document found or created for user: {user}")
                return
            else:
                try:
                    # Update or add new activity type
                    if any(div['name'] == division_name for div in latest_login.get('divisions', [])):
                        # Increment the count for the existing division
                        user_activities.update_one(
                            {'_id': latest_login['_id'], 'divisions.name': division_name},
                            {'$inc': {'divisions.$.count': 1}}
                        )
                    else:
                        # Add the new division with count 1
                        user_activities.update_one(
                            {'_id': latest_login['_id']},
                            {'$push': {'divisions': {'name': division_name, 'count': 1}}}
                        )

                except Exception as e:
                    exception_logger.error(f"Error updating activities for user: {user}, Error: {str(e)}")
                    raise e

            # Fetch the updated document for logging
            updated_doc = user_activities.find_one({'_id': latest_login['_id']})
            audit_logger.info(f"User activity logged/updated successfully for user: {user}, Document: {updated_doc}")

        except Exception as e:
            exception_logger.error(f"General error in log_user_activity for user: {user}, Error: {str(e)}")
            raise e
        
        
