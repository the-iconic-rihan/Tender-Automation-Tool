import os
from pymongo import MongoClient
from ..logger import *
from authentication import email_utils
from dashboard_backend.utils.uploadFileFunc import uploadFileFunc

MONGODB_URI = os.environ['MONGODB_URI']
client = MongoClient(MONGODB_URI)
db = client["Metadata"]
collection = db["keys"]

first_key = collection.find_one()
# logger.info(f"==/==> {first_key}")
adobe_cred = {
 "ADOBE_CLIENT_ID": first_key["ADOBE_CLIENT_ID"],
"ADOBE_CLIENT_SECRET":first_key["ADOBE_CLIENT_SECRET"]
}

ADOBE_EMAIL = os.environ['ADOBE_EMAIL']
DEVELOPER_EMAIL_ADOBE_KEY_EXPIRES = os.environ['DEVELOPER_EMAIL_ADOBE_KEY_EXPIRES']


class OldKeyDeletedException(Exception):
    pass
class adobeKeyUtils():
    def __init__(self) -> None:
        pass

    def connect_to_mongodb(self):
        try:

            MONGODB_URI = os.environ.get('MONGODB_URI')
            if not MONGODB_URI:
                raise Exception(
                    "MONGODB_URI is not defined in the environment.")
            client = MongoClient(MONGODB_URI)
            db = client["Metadata"]
            collection = db["keys"]
            # bad_files_collection = db["bad_files_metadata"]
            uploaded_tender_metadata = db["uploaded_tender_metadata"]
            tender_metadata = db['tender_metadata']
            collection_task_metadata = db["celery_tasks_metadata"]
          
            return client, collection, uploaded_tender_metadata,tender_metadata,collection_task_metadata

        except Exception as e:
            exception_logger.error(f"Failed to connect to MongoDB: {str(e)}")
            raise e

    def find_next_document(self, collection, current_document, tender_number, uploaded_tender_metadata):
        try:
            
            next_document = collection.find_one(
                {"_id": {"$gt": current_document["_id"]}})
            total_keys = collection.count_documents({})
            keys_left_count = total_keys - 1  # Assuming the current key is being deleted
            audit_logger.info(f"=====> keys_left {keys_left_count}")
            
            
            if not next_document:
                audit_logger.warning("No more keys left")


                email_utils.send_adobeKey_expiry_email(
                    ADOBE_EMAIL, DEVELOPER_EMAIL_ADOBE_KEY_EXPIRES, keys_left_count, int(
                        total_keys)
                )
                collection.delete_one({"_id": current_document["_id"]})
                document = uploaded_tender_metadata.find_one(
                    {"tender_number": tender_number})
                tender_data = {
                    "tender_name": document.get("tender_name"),
                    "division": document.get("division"),
                    "uploaded_by": document.get("uploaded_by")
                }
                uploadFileFunc().update_tender_metadata(
                    tender_data['tender_name'], tender_number, tender_data['division'], tender_data['uploaded_by'], tender_status='Failed'
                )
                audit_logger.warning("Old key deleted")
                raise OldKeyDeletedException("Some technical problem, please contact support team")
            else:
                # Uncomment this section if you want to send an email
                email_utils.send_adobeKey_expiry_email(
                    ADOBE_EMAIL, DEVELOPER_EMAIL_ADOBE_KEY_EXPIRES, keys_left_count, int(
                        total_keys)
                )

            return next_document

        except Exception as e:
            exception_logger.error(f"Failed to find the next document: {str(e)}")
            raise e

    def update_document(self, collection, current_document, new_document):
        try:
            collection.update_one(
                {"_id": current_document["_id"]},
                {
                    "$set": {
                        "ADOBE_CLIENT_ID": new_document["ADOBE_CLIENT_ID"],
                        "ADOBE_CLIENT_SECRET": new_document["ADOBE_CLIENT_SECRET"],
                    }
                },
            )

            collection.delete_one({"_id": current_document["_id"]})
            return new_document

        except Exception as e:
            exception_logger.error(f"Failed to update the document: {str(e)}")
            raise e


   
    def main(self, tender_number):
        
        
        try:
            client, collection, uploaded_tender_metadata,_,_ = self.connect_to_mongodb()
            current_document = collection.find_one(adobe_cred)

            if current_document:
                # If the current document exists, update adobe_cred with the values from the next document
                next_document = self.find_next_document(
                    collection, current_document, tender_number, uploaded_tender_metadata)

                if next_document:
                    adobe_cred["ADOBE_CLIENT_ID"] = next_document["ADOBE_CLIENT_ID"]
                    adobe_cred["ADOBE_CLIENT_SECRET"] = next_document["ADOBE_CLIENT_SECRET"]

                    audit_logger.debug(f"Updated adobe_cred with values from the next document: {next_document}")

                    # Delete the current document
                    collection.delete_one({"_id": current_document["_id"]})
            else:
                # If the current document doesn't exist, update adobe_cred with the values from the first document
                first_document = collection.find_one()

                if first_document:
                    adobe_cred["ADOBE_CLIENT_ID"] = first_document["ADOBE_CLIENT_ID"]
                    adobe_cred["ADOBE_CLIENT_SECRET"] = first_document["ADOBE_CLIENT_SECRET"]

                    audit_logger.debug(f"Updated adobe_cred with values from the first document: {first_document}")
        
            return adobe_cred
        

        except Exception as e:
            exception_logger.error(f"Error: {str(e)}")
            raise e
        finally:
            if "client" in locals():
                client.close()

