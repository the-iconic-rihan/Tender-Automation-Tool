import os
from pymongo import MongoClient
from ..logger import *
       
       
        
class celeryUtils():
    """
    save the meta data of celery tasks which runs in background
    """

    def save_celery_task_metadata(self, tender_name, tender_number, task_id, task_status="Not started"):
        try:
            MONGODB_URI = os.environ['MONGODB_URI']
            # Connect to the MongoDB server
            client = MongoClient(MONGODB_URI)
            # Access a specific database
            db = client["Metadata"]
            # Access specific collections within the database
            collection = db["celery_tasks_metadata"]

            # Define the filter to find the document
            filter = {'tender_name': tender_name,
                      'tender_number': tender_number}

            # Define the update data
            update_data = {
                '$set': {'task_id': task_id, 'task_status': task_status}}

            # Use update_one with upsert=True to either update the existing document or insert a new one
            result = collection.update_one(filter, update_data, upsert=True)

            if result.modified_count > 0:
                # Document was updated
                audit_logger.info("Updated celery task metadata in MongoDB")
            elif result.upserted_id:
                # New document was inserted
                audit_logger.info("Inserted new celery task metadata in MongoDB")
            else:
                # No changes were made
                audit_logger.info("No changes made to celery task metadata in MongoDB")

        except Exception as e:
            exception_logger.error("Error saving celery task metadata to MongoDB: {}".format(str(e)))


    """
    save the meta data of celery tasks which runs in background
    """

    def save_celery_task_metadata(self, tender_name, tender_number, task_id, task_status="Not started"):
        try:
            MONGODB_URI = os.environ['MONGODB_URI']
            # Connect to the MongoDB server
            client = MongoClient(MONGODB_URI)
            # Access a specific database
            db = client["Metadata"]
            # Access specific collections within the database
            collection = db["celery_tasks_metadata"]

            # Define the filter to find the document
            filter = {'tender_name': tender_name,
                      'tender_number': tender_number}

            # Define the update data
            update_data = {
                '$set': {'task_id': task_id, 'task_status': task_status}}

            # Use update_one with upsert=True to either update the existing document or insert a new one
            result = collection.update_one(filter, update_data, upsert=True)

            if result.modified_count > 0:
                # Document was updated
                audit_logger.info("Updated celery task metadata in MongoDB")
            elif result.upserted_id:
                # New document was inserted
                audit_logger.info(
                    "Inserted new celery task metadata in MongoDB")
            else:
                # No changes were made
                audit_logger.info(
                    "No changes made to celery task metadata in MongoDB")

        except Exception as e:
            logger.error(
                "Error saving celery task metadata to MongoDB: {}".format(str(e)))