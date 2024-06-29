import os
from pymongo import MongoClient
from ..logger import *
from azure.storage.blob import BlobServiceClient
import time
from datetime import datetime

MONGODB_URI = os.environ['MONGODB_URI']
AZURE_STORAGE_CONNECTION_STRING = os.environ['AZURE_STORAGE_CONNECTION_STRING']
container_name = os.environ['container_name']

class uploadFileFunc():
    """
    A utility class providing helper methods to facilitate operations with blob storage and MongoDB.
    These operations include checking file upload status, creating folders in blob storage,
    saving files to blob storage, saving CSV data to MongoDB, saving CSV files to blob storage,
    saving metadata for uploaded tenders, sending status updates, and updating file upload status in MongoDB.
    """

    def __init__(self):
        pass

    def create_folder_if_not_exists(self, container_client, folder_name):
        """
        Create a folder in blob storage if it does not already exist.
        """
        blob_client = container_client.get_blob_client(folder_name)
        try:
            blob_client.get_blob_properties()
        except Exception:
            container_client.upload_blob(name=folder_name, data="")

    def save_files_to_blob_storage(self, client, tender_name, tender_number, division, published_date, uploaded_by,
                                   uploaded_date, file, file_type, cleaned_file_name, extension):
        """
        Save the provided files to blob storage and update the tender metadata in MongoDB.
        """
        audit_logger.info("entering in the uploading blob func")
        blob_service_client = BlobServiceClient.from_connection_string(
            AZURE_STORAGE_CONNECTION_STRING)
        container_client = blob_service_client.get_container_client(
            container_name)

        # Create the folder name
        folder_name = f"{tender_name}_{tender_number}_{published_date}"
        file_name = cleaned_file_name + "." + extension
        self.create_folder_if_not_exists(container_client, division)
        self.create_folder_if_not_exists(
            container_client, f"{division}/{folder_name}")
        self.create_folder_if_not_exists(
            container_client, f"{division}/{folder_name}/Raw_Files")
        self.create_folder_if_not_exists(
            container_client, f"{division}/{folder_name}/Raw_Files/{file_type}")

        blob_name = f"{division}/{folder_name}/Raw_Files/{file_type}/{file_name}"
        blob_client = container_client.get_blob_client(blob=blob_name)

        # Seek to the beginning of the file
        file.seek(0)
        # Set the maximum number of retries
        max_retries = 5

        for attempt in range(max_retries):
            try:
                # Upload the file data directly to blob storage
                blob_client.upload_blob(file, overwrite=True)
                # Get the saved path of the file in blob storage
                saved_path = f"https://{blob_service_client.account_name}.blob.core.windows.net/{container_name}/{blob_name}"

                # Use the transaction_logger to log the successful file upload
                transaction_logger.debug(f"File uploaded to Blob storage. Blob Name: {blob_name}, File Name: {file_name}",
                                         blob_name=blob_name, file_name=file_name)

                # Check file upload status and update the file_upload_status field
                self.update_file_upload_status(client, cleaned_file_name, tender_name, tender_number,
                                               blob_path=blob_name, file_upload_status='File Uploaded',
                                               tender_status='No file Processed')

                return blob_name

            except Exception as e:
                # Use the exception_logger to log any exceptions during file upload
                exception_logger.error(
                    f"Error saving file to Blob storage  to {blob_name}, {file_name},exception_message: {str(e)}")

            # Handle the exception when saving file to blob storage fails
            # print(f"Error saving file to Blob storage (Attempt {attempt + 1}/{max_retries}): {str(e)}")

            # Wait for 120 seconds before retrying
            time.sleep(20)
            continue

        return None

    def check_file_upload_status(self, container_client, blob_name, file_name):
        """
        Check the upload status of a file in blob storage and sends a status update.
        """
        blob_client = container_client.get_blob_client(blob=blob_name)

        try:
            blob_properties = blob_client.get_blob_properties()

            if blob_properties['size'] > 0:
                # Use the transaction_logger to log the successful file upload status
                transaction_logger.debug(f"File uploaded. Blob Name: {blob_name}, File Name: {file_name}",
                                         blob_name=blob_name, file_name=file_name)

                return "File Uploaded"
            else:
                # Use the transaction_logger to log the file not uploaded status
                transaction_logger.debug(f"File not uploaded. Blob Name: {blob_name}, File Name: {file_name}",
                                         blob_name=blob_name, file_name=file_name)

                return "File Not Uploaded"

        except Exception as e:
            # Use the exception_logger to log any exceptions during file upload status check
            exception_logger.error("Error checking file upload status",
                                   extra={"blob_name": blob_name, "file_name": file_name,
                                          "exception_message": str(e)})

            return 0

    def save_uploaded_tender_metadata(self, client, tender_name, tender_number, division, published_date, uploaded_by,
                                      uploaded_date, name, file_type, extension, saved_path='', file_upload_status='File Uploading',
                                      tender_status='No file processed'):
        """
        Save metadata for an uploaded tender to MongoDB.
        """

        try:
            # Access a specific database
            db = client["Metadata"]

            # Access a specific collection within the database
            collection = db["uploaded_tender_metadata"]
            collection_metadata = db["tender_metadata"]
            
            collection_metadata_result = collection_metadata.update_one(
                 {'tender_name': tender_name, 'tender_number': tender_number},
                {'$set': {'uploaded_date_time': datetime.now()}}
            )
            
            result = collection.insert_one({
                'division': division,
                'tender_name': tender_name,
                'tender_file_name': name,
                'tender_number': tender_number,
                'published_date': published_date,
                'file_upload_status': file_upload_status,
                'file_processing_status': 'Processing',
                'tender_status': tender_status,
                'blob_file_path': saved_path,
                'file_type': file_type,
                'extension': extension,
                'uploaded_by': uploaded_by,
                'uploaded_date':datetime.now(),
                # 'uploaded_date_time': datetime.now().strftime("%Y-%m-%d,%H:%M:%S"),
                'updated_by': "",
                'updated_date': ""

            })

            # Use the transaction_logger to log the successful metadata save
            transaction_logger.debug(
                f"Metadata saved to MongoDB. Tender Name: {tender_name}, Tender Number: {tender_number}")

            # Return the ID of the created data
            return str(result.inserted_id)

        except Exception as e:
            # Handle any exceptions that occur during the database operation
            exception_logger.error(
                f"Error saving file to uploaded_tender_metadata: {str(e)}")
            return 0

    def change_tender_status_tender_metadata_for_second_user(self, client, tender_name, tender_number, division, file_upload_status="file Uploading",
                                                             tender_status='No file processed'):
        """
        update the 
        """

        audit_logger.info("changing tender status for 2nd user")
        try:
            db = client["Metadata"]
            collection = db["tender_metadata"]

            # Define the filter criteria
            filter_criteria = {
                "tender_number": tender_number,
                "division": division,
                "file_upload_status": file_upload_status
            }

            update_fields = {
                "tender_status": tender_status,

            }

            result = collection.update_many(
                filter_criteria, {"$set": update_fields})

            if result.modified_count > 0:
                transaction_logger.debug(
                    f"Metadata updated in MongoDB. Filter Criteria: {filter_criteria}, File Upload Status: {file_upload_status}")

            return result.modified_count

        except Exception as e:
            exception_logger.error(
                f"Error updating file_upload_status in uploaded_tender_metadata: {str(e)}")
            return 0

    def update_file_upload_status(self, client, tender_file_name, tender_name, tender_number, file_upload_status, tender_status, blob_path):
        """
        Update the file upload status for a given tender in MongoDB.
        """
        try:
            db = client["Metadata"]
            collection = db["uploaded_tender_metadata"]
            collection_tender = db['tender_metadata']

            # Update the file_upload_status field for the given tender_name
            result = collection.update_one(
                {'tender_file_name': tender_file_name,
                    'tender_name': tender_name, 'tender_number': tender_number},
                {'$set': {'file_upload_status': file_upload_status,
                          'tender_status': tender_status, 'blob_file_path': blob_path}}
            )

            # Update the file_upload_status field for the given tender_name
            tenderResult = collection_tender.update_one(
                {'tender_name': tender_name, 'tender_number': tender_number},
                {'$set': {'file_upload_status': file_upload_status,
                          'tender_status': tender_status}}
            )

            client.close()
            return result.modified_count

        except Exception as e:
            # Handle any exceptions that occur during the database operation
            exception_logger.error(
                f"Error updating file upload status: {str(e)}")
            return 0

    def update_tender_metadata(self, tender_name, tender_number, division, uploaded_by, tender_status='Processing'):
        try:
            # Connect to the MongoDB server
            client = MongoClient(MONGODB_URI)

            # Access a specific database
            db = client["Metadata"]

            # Access a specific collection within the database
            collection = db["uploaded_tender_metadata"]
            collection_tender = db['tender_metadata']

            # Update the file_upload_status field for the given tender_name
            tenderResult = collection_tender.update_one(
                {'tender_name': tender_name, 'tender_number': tender_number},
                {'$set': {'tender_status': tender_status,
                          'updated_by': uploaded_by, 'updated_date_and_time': datetime.now()}}
            )

            # Define the filter criteria
            filter_criteria = {
                "tender_name": tender_name,
                "tender_number": tender_number,
                "division": division
            }

            # Define the update operation
            update_operation = {
                "$set": {
                    "tender_status": tender_status,
                }
            }

            # Update the matching documents
            result = collection.update_many(filter_criteria, update_operation)

            # Log the update result
            if result.modified_count > 0:
                transaction_logger.info(
                    "Tender metadata updated successfully.")
            else:
                transaction_logger.warning(
                    "No matching documents found to update tender metadata.")

            return result.modified_count

        except Exception as e:
            # Handle any exceptions that occur during the database operation
            exception_logger.error(f"Error updating tender metadata: {str(e)}")
            return 0

   
   
    def get_next_sequence(self, division):
        try:
            # Connect to the MongoDB server
            client = MongoClient(MONGODB_URI)

            # Access a specific database
            db = client["Metadata"]
            tender_metadata = db["tender_metadata"]

            # Find the document with the highest "sr_no" for the given "division" (if it exists)
            max_sr_no_document = tender_metadata.find_one(
                {"division": division},
                sort=[("sr_no", -1)]
            )
            audit_logger.info(f"----> {max_sr_no_document}")
            if max_sr_no_document:
                # Get the new sr_no value from the updated document
                new_sr_no = max_sr_no_document.get("sr_no")
                transaction_logger.info(
                    f"Document for division '{division}' updated in tender_metadata. New sr_no: {new_sr_no}")
            else:
                new_sr_no = 0  # Provide a default value

            # Insert the new document with the obtained "sr_no"
            return int(new_sr_no) + 1

        except Exception as e:
            # Handle any exceptions that occur during the database operation
            exception_logger.error(
                f"Error updating/creating sequence document for division '{division}': {str(e)}")
            return False
        
    
    
    
    # def update_uploaded_time_date_in_tender_metadata(self, tender_name, tender_number, uploaded_by, tender_status='Processing'):
    #     try:
    #         # Connect to the MongoDB server
    #         client = MongoClient(MONGODB_URI)

    #         # Access a specific database
    #         db = client["Metadata"]

    #         # Access a specific collection within the database
    #         collection_tender = db['tender_metadata']

    #         # Update the file_upload_status field for the given tender_name
    #         tenderResult = collection_tender.update_one(
    #             {'tender_name': tender_name, 'tender_number': tender_number},
    #             {'$set': {'tender_status': tender_status,
    #                       'updated_by': uploaded_by, 'uploaded_date_and_time': datetime.now()}}
    #         )

           

    #         # Log the update result
    #         if tenderResult.modified_count > 0:
    #             transaction_logger.info(
    #                 "Tender metadata uploaded_time_date updated successfully.")
    #         else:
    #             transaction_logger.warning(
    #                 "No matching documents found for  uploaded_time_date to update tender metadata.")

    #         return tenderResult.modified_count

    #     except Exception as e:
    #         # Handle any exceptions that occur during the database operation
    #         exception_logger.error(f"Error updating tender metadata: {str(e)}")
    #         return 0


