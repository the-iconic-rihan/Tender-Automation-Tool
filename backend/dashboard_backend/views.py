from logging import exception
from .utils.adobeKeyUtils import adobeKeyUtils
from .utils.celeryUtils import celeryUtils
from .utils.gpt_utils import category_add_func
from .utils.utils import deleteFileFunc
from rest_framework.views import APIView
from .category_generator import CategoryGenerator
from rest_framework.response import Response
import json
import os
import csv
import re
from pymongo import MongoClient
import pymongo
from datetime import datetime
# from .utils.utils import *
from rest_framework import status
from pathlib import Path
from docx import Document
from django.http import HttpResponse
from pymongo.errors import ServerSelectionTimeoutError, PyMongoError
from bson import ObjectId
from django.http import FileResponse
from rest_framework.exceptions import NotFound
from pymongo.errors import PyMongoError
from .logger import *
from azure.storage.blob import BlobServiceClient
from dashboard_backend.utils.uploadFileFunc import uploadFileFunc
import time
from .utils.utils import folder_creation, find_application_type
from authentication.email_utils import  TenderEmailSender

MONGODB_URI = os.environ['MONGODB_URI']
AZURE_STORAGE_CONNECTION_STRING = os.environ['AZURE_STORAGE_CONNECTION_STRING']
container_name = os.environ['container_name']


class ListTender(APIView):
    """
    ListTender API Endpoint

    This endpoint allows a POST request for searching and retrieving tenders
    stored in a MongoDB database.

    Parameters:
            - 'division'
            - 'username'
            - 'tender_name'
            - 'tender_number'

    Returns:
        Response: A Response object containing a list of tenders, with each
            tender represented as a dictionary of its metadata.
    """

    def post(self, request):
        try:
            # Extracting the required data from the request
            division = request.POST["division"]
            username = request.POST["username"]
            tender_name = request.POST["tender_name"]
            tender_number = request.POST["tender_number"]

            # Logging the received request
            audit_logger.info(
                "Received request with parameters: division = {}, username = {}, tender_name = {}, tender_number = {}",
                division,
                username,
                tender_name,
                tender_number,
            )

            # Connecting to MongoDB and accessing the collection
            client = MongoClient(MONGODB_URI)
            db = client["Metadata"]
            collection = db["uploaded_tender_metadata"]

            # Creating the filters based on the provided data
            filters = {
                "division": division,
                "uploaded_by": username,
                "tender_name": tender_name,
                "tender_number": tender_number,
            }

            # Querying the collection with the filters
            tenders = collection.find(filters)

            result = []
            for tender in tenders:
                # Appending the desired fields to the result list
                tender["_id"] = str(tender["_id"])
                result.append(tender)

                # Logging retrieved tender
                transaction_logger.info(f"Tender retrieved: {tender}")

            # Closing the MongoDB connection
            client.close()

            # Logging the result
            audit_logger.info(f"Response generated: {result}")

            # Returning the result as a response
            return Response(result)

        except Exception as e:
            # Handle the exception and return an error response
            exception_logger.error(f"Exception occurred: {str(e)}")
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class SearchTender(APIView):
    """
    SearchTender API Endpoint

    This endpoint allows a POST request for searching and retrieving tenders
    from a MongoDB database based on date range.The 'from_date' and 'to_date' are
    used to search tenders published within the given date range.

    Parameters:
        request (HttpRequest): The request object. The following parameters
            are extracted from the POST body of the request:
            - 'username'
            - 'division'
            - 'tender_number'
            - 'tender_name'
            - 'from' (date string in 'YYYY-MM-DD' format)
            - 'to' (date string in 'YYYY-MM-DD' format)

    Returns:
        Response: A Response object containing a list of tenders, with each
            tender represented as a dictionary of its metadata.
    """

    def post(self, request):
        try:
            # Extracting the required data from the request
            division = request.data.get("division")
            from_date = datetime.strptime(request.data.get("from"), "%Y-%m-%d")
            to_date = datetime.strptime(request.data.get("to"), "%Y-%m-%d")
            date_type = request.data.get("date_type")

            # Logging the received request
            audit_logger.info(
                "Received request with parameters: division = {}, from_date = {}, to_date = {}",
                division,
                from_date,
                to_date,
            )

            # Connecting to MongoDB and accessing the collection
            client = MongoClient(MONGODB_URI)
            db = client["Metadata"]
            collection = db["tender_metadata"]

            date_field = "published_date" if date_type == "published_date" else "uploaded_date"
            date_filter = {
                date_field: {
                    "$gte": from_date.strftime("%Y-%m-%d"),
                    "$lte": to_date.strftime("%Y-%m-%d")
                }
            }

            # Creating the filters based on the provided data
            filters = {
                "$and": [
                    {"division": division},
                    date_filter
                ]
            }

            # Querying the collection with the filters
            tenders = collection.find(filters)

            result = []
            for tender in tenders:
                # Convert the ObjectId to a string representation
                tender["_id"] = str(tender["_id"])

                # Appending the tender to the result list
                result.append(tender)

                # Logging retrieved tender
                transaction_logger.info(f"Tender retrieved: {tender}")

            # Closing the MongoDB connection
            client.close()

            # Logging the result
            audit_logger.info(f"Response generated: {result}")

            # Returning the result as a response
            return Response(result)

        except Exception as e:
            # Handle the exception and return an error response
            exception_logger.error(f"Exception occurred: {str(e)}")
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class AddMetadata(APIView):
    """
    AddMetadata API Endpoint
    This endpoint enables a POST request to insert tender metadata into a MongoDB database.
    It accepts a JSON object in the request body containing the metadata to be inserted.
    Parameters:
        request (HttpRequest): The request object. The JSON data to be inserted into the
            database is extracted from the body of the request.
    Returns:
        Response: A Response object containing a success message and the ID of the inserted
            document if the operation is successful.
    """

    def post(self, request):
        try:
            json_data = json.loads(request.body)
            # Ensure tender_number is always received as a string
            tender_number = str(json_data.get("tender_number", ""))
            tender_name = str(json_data.get("tender_name", ""))
            published_date = str(json_data.get("published_date", ""))
            division = json_data.get("division", "")

            # Logging the received data
            audit_logger.info(f"Received data to be inserted: {json_data}")

            # Connect to the MongoDB server
            client = MongoClient(MONGODB_URI)
            # Access a specific database
            db = client["Metadata"]
            # Access a specific collection within the database
            collection = db["tender_metadata"]

            
            # total_count = collection.count_documents({"division": division})

            # Check if the tender_number already exists in the collection
            existing_data = collection.find_one(
                {"tender_number": tender_number})
            audit_logger.info(f"existing_data {tender_number}")
                
            if existing_data:
                exception_logger.error(
                    "Data with the same tender_number already exists"
                )
                # If the tender_number already exists, you can either update the existing data or raise an error
                return Response(
                    {
                        "error": "Data with the same opportunity number already exists",
                    }, status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )

            # Get the next value for the "sr_no" key
            next_sr_no = uploadFileFunc().get_next_sequence(division)
            # audit_logger.info(f"=====> {next_sr_no}")
            json_data.update(
                {
                    "sr_no": next_sr_no,
                    "file_upload_status": "No file Uploaded",
                    "tender_status": "No file processed",
                    "tender_number": tender_number,
                    "updated_date": "",
                    "updated_by": "",
                }
            )
            
            result = collection.insert_one(json_data)

            json_data.pop("_id")
            # Logging the successful insertion
            transaction_logger.info(f"Data inserted successfully with ID: {str(result.inserted_id)}")
            # audit_logger.info("======>".format(json_data))
            return Response(
                {
                    "success": "Data inserted successfully",
                    "inserted_id": str(result.inserted_id),
                    "status": 200,
                    **json_data,
                }, status=status.HTTP_200_OK
            )

        except Exception as e:
            # Handle any exceptions that occur during the database operation
            exception_logger.error(f"Exception occurred: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class fetch_metadata(APIView):

    """
    FetchMetadata API Endpoint

    This endpoint enables a POST request to retrieve tender metadata from a MongoDB database.
    It accepts a 'division' parameter in the POST body, which is used as a filter in querying the database.

    Parameters:
        request (HttpRequest): The request object. The 'division' parameter is extracted from
            the POST body of the request.

    Returns:
        Response: A Response object containing a list of tenders, with each tender represented as
            a dictionary of its metadata.
    """

    def post(self, request):
        division = request.POST.get("division")
        try:
            # Logging the received division
            audit_logger.info(f"Received division to be queried: {division}")

            # Connect to the MongoDB server
            client = MongoClient(MONGODB_URI)

            # Access a specific database
            db = client["Metadata"]

            # Access a specific collection within the database
            collection = db["tender_metadata"]

            # Retrieve the data based on the provided division
            query = {"division": division}
            results = list(collection.find(query))

            # Convert ObjectId to string representation
            for result in results:
                result["_id"] = str(result["_id"])

            results.reverse()

            # Logging the retrieved data
            # transaction_logger.info("Retrieved data: {}", results)

            # Return the retrieved data as JSON response
            return Response(results)

        except Exception as e:
            # Handle any exceptions that occur during the database operation
            exception_logger.error(f"Exception occurred: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class fetchTotalCount(APIView):

    def post(self, request):
        division = request.POST.get("division")
        try:

            # Logging the received division
            audit_logger.info(f"Received division to be queried: {division}")

            # Connect to the MongoDB server
            client = MongoClient(MONGODB_URI)
            db = client["Metadata"]
            # Access a specific collection within the database
            collection = db["tender_count_metadata"]
            # Retrieve the data based on the provided division
            query = {"division": division}
            results = list(collection.find(query))

            # Convert ObjectId to string representation
            for result in results:
                result["_id"] = str(result["_id"])


            # Return the retrieved data as JSON response
            return Response({"message": results}, status=status.HTTP_200_OK)

        except Exception as e:
            # Handle any exceptions that occur during the database operation
            exception_logger.error(f"Exception occurred: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class FileUploadView(APIView):
    """
    API endpoint for uploading files and saving them to blob storage.

    Parameters:
        - division (str): The division of the files.
        - tender_name (str): The name of the tender.
        - tender_number (int): The number of the tender.
        - published_date (str): The published date of the tender in the format "YYYY-MM-DD".
        - uploaded_by (str): The name of the user who uploaded the files.
        - uploaded_date (str): The date when the files were uploaded in the format "YYYY-MM-DD".
        - files (list): List of files to be uploaded.

    Description:
        This API endpoint allows users to upload files and saves them to blob storage.
        The uploaded files are associated with a specific tender and division.
        The file path in the blob storage is returned as a response.
    """

    def post(self, request):

        try:
            # Get the input data from the request body
            division = request.POST.get("division")
            tender_name = request.POST.get("tender_name")
            tender_number = request.POST.get("tender_number")
            published_date = request.POST.get("published_date")
            uploaded_by = request.POST.get("uploaded_by")
            uploaded_date = request.POST.get("uploaded_date")
            file_type = request.POST.get("file_type")
            file = request.FILES.get("files")
            uploaded_file = request.FILES.get("files")
            total_no_files = request.POST.get("total_no_files")

            # Initialize the MongoDB client
            client = MongoClient(MONGODB_URI)
            uploadFileFunc().change_tender_status_tender_metadata_for_second_user(client, tender_name, tender_number,
                                                                                  division, file_upload_status="file uploading", tender_status="File upload in progress")

            audit_logger.info(
                f"{division},{tender_name},{tender_number},{published_date},{uploaded_by},{uploaded_date},{file_type},{file},{uploaded_file},{total_no_files}")

            if not uploaded_file:
                return Response({"error": "No file uploaded"}, status=status.HTTP_400_BAD_REQUEST)
            # Logging the received file details
            audit_logger.info(
                "Received file details: Division: {}, Tender Name: {}, Tender Number: {}, Uploaded By: {}, Uploaded Date: {}, File Type: {}, file: {}",
                division,
                tender_name,
                tender_number,
                uploaded_by,
                uploaded_date,
                file_type,
                file.name
            )

            # Remove unwanted special characters and spaces from the name
            cleaned_file_name = "".join(
                re.sub(r'[^\w.-]', '_', file.name).split(".")[:-1])

            file_id = uploadFileFunc().save_uploaded_tender_metadata(
                client,
                tender_name,
                tender_number,
                division,
                published_date,
                uploaded_by,
                uploaded_date,
                cleaned_file_name,
                file_type,
                extension=file.name.split(".")[-1]

            )

            path = uploadFileFunc().save_files_to_blob_storage(
                client,
                tender_name,
                tender_number,
                division,
                published_date,
                uploaded_by,
                uploaded_date,
                file,
                file_type,
                cleaned_file_name,
                extension=file.name.split(".")[-1]
            )

            # Close the MongoDB client connection
            client.close()

            # Logging the completion of file upload
            transaction_logger.info(
                "Completed file upload: File path: {}", path)

            # Rihan's code
            file_data = []
            # Add extracted data to the file_data list
            file_data.append({
                "tender_name": tender_name,
                "tender_number": tender_number,
                "published_date": published_date,
                "uploaded_by": uploaded_by,
                "uploaded_date": uploaded_date,
                "file_path": path,
                "file_type": file_type,
                "file_name": cleaned_file_name + "." + file.name.split(".")[-1],
                "extension": file.name.split(".")[-1],
                "_id": file_id,
                "original_file_name": file.name,
                "file_upload_status": "File Uploaded",
                "file_processing_status": "Processing",
                "tender_status": "Uploading",
                "total_no_files": total_no_files,
                "division": division,
                "operation_type": "file_upload_success"

            })

            audit_logger.info(f"the data of file_data appended {file_data}")

            return Response(
                {
                    "tender_name": tender_name,
                    "tender_number": tender_number,
                    "published_date": published_date,
                    "uploaded_by": uploaded_by,
                    "uploaded_date": uploaded_date,
                    "blob_file_path": path,
                    "file_name": cleaned_file_name + "." + file.name.split(".")[-1],
                    "_id": file_id,
                    "original_file_name": file.name,
                    "file_type": file_type,
                    "file_upload_status": "File Uploaded",
                    "file_processing_status": "Processing",
                    "tender_status": "Uploading",
                },
                status=status.HTTP_200_OK,
            )

        except Exception as e:
            # Handle any exceptions that occur during the file upload
            exception_logger.error(
                f"Exception occurred during file upload: {str(e)}")
            return Response(
                {
                    "message": "File upload failed!",
                    "error": str(e),
                    # "status": "No File Uploaded",
                },
            )


class DeleteFileView(APIView):
    """
    API endpoint for deleting a file and related data from MongoDB.
    Parameters :
        - file_id
    Output :
        A new category output generated with remaining files
    """

    def post(self, request):

        try:
            # Get the file_id from the request
            file_id = request.POST.get("file_id", "")

            # Use the audit_logger to log the received file_id
            audit_logger.info(
                f"Received request to delete file with file_id: {file_id}")

            # Connect to the MongoDB server
            client = MongoClient(MONGODB_URI)

            # Access a specific database
            db = client["Metadata"]

            # Access specific collections within the database
            collection_tender = db['tender_metadata']
            collection = db["uploaded_tender_metadata"]
            collection_csv = db["csv_metadata"]
            collection_output = db["output_metadata"]
            versioning_collection_output = db["versioning_category_metadata"]
            category_output_metadata_collection = db['category_output_metadata']
            celery_collection = db['celery_tasks_metadata']

            # Find the document in the 'uploaded_tender_metadata' collection based on the provided file_id
            document = collection.find_one({"_id": ObjectId(file_id)})
            if not document:
                raise NotFound("Document not found with the provided file_id")

            division = document['division']
            tender_name = document["tender_name"]
            tender_number = document["tender_number"]
            published_date = document['published_date']
            uploaded_by = document['uploaded_by']

            collection_tender.update_one(
                {'tender_name': document['tender_name'],
                    'tender_number': document['tender_number']},
                {'$set': {'tender_status': 'processing',
                          'updated_by': document['uploaded_by'], 'updated_date': datetime.now()}}
            )

            # Convert the ObjectId to a string for serialization
            document["_id"] = str(document["_id"])

            # Use the transaction_logger to log the filename of the document to be deleted
            transaction_logger.debug(
                f"Deleting document with filename: {document['tender_file_name']}")

            # Delete the corresponding blob files using a custom function delete_blob()
            deleteFileFunc().delete_blob(document.get("blob_file_path"))
            deleteFileFunc().delete_blob(document.get("blob_csv_path"))

            # Extract the 'tender_file_name' from the 'document'
            filename = document["tender_file_name"]

            # Delete all documents in the 'csv_metadata' collection that have the same 'filename' as the 'document'
            collection_csv.delete_many({"file_name": filename})

            # delete the tender page count for particular tender
            # collection_tender_count.delete_many({"tender_number":tender_number})
            # Get the old category data from the 'output_metadata' collection
            old_category_data = collection_output.find(
                {"tender_number": document["tender_number"],
                    "tender_name": document["tender_name"]}
            )

            # Convert the cursor to a list
            old_category_data_list = list(old_category_data)

            if not old_category_data:
                raise NotFound(
                    "Category data not found with the provided file_id")

            if len(old_category_data_list) > 0:
                version = old_category_data_list[0]["version"]
            else:
                version = 1
            # Loop through all the documents with the same tender_number
            for document in old_category_data:
                # Create a new versioned document with an additional field "version"
                document["version"] = version
                versioning_collection_output.insert_one(document)

            # Delete all documents in the 'output_metadata' collection that have the same 'tender_number' as the 'document'
            collection_output.delete_many(
                {"tender_number": document["tender_number"], "tender_name": document["tender_name"]})
            category_output_metadata_collection.delete_many({"tender_number": str(
                document["tender_number"]), "tender_name": document["tender_name"]})

            # Use the transaction_logger to log the deletion of 'csv_metadata'
            transaction_logger.debug("csv metadata deleted")

            # Delete the 'document' itself from the 'uploaded_tender_metadata' collection
            collection.delete_one({"_id": ObjectId(file_id)})

            query = {
                'tender_name': tender_name,
                'tender_number': tender_number,
                'published_date': published_date
            }

            count = collection.count_documents(query)
            if count == 0:
                # Return the response with success status and relevant data
                return Response(
                    {
                        "status": "success",
                        "data": "deleted successfully. No file left to show collection",
                    }, status=status.http_200_OK
                )

            else:
                # Call a custom function add_category_after_deleting() to add new category data after deletion
                deleteFileFunc().add_category_after_deleting(
                    division,
                    tender_name,
                    tender_number,
                    published_date,
                    uploaded_by,
                    version + 1
                )

            # Use the transaction_logger to log successful file deletion
            transaction_logger.debug(
                f"File with file_id {file_id} deleted successfully")

            # Return the response with success status and relevant data
            return Response(
                {
                    "status": "success",
                    "data": "deleted successfully",
                }, status=status.http_200_OK
            )

        except NotFound as e:
            # Handle the case when the document with the provided file_id is not found
            return Response({"status": "error", "message": "Document not found with the provided file_id"}, status=404)

        except Exception as e:
            # Use the exception_logger to log any other exceptions
            exception_logger.exception("An error occurred during file deletion",
                                       extra={"file_id": file_id, "exception_message": str(e)})
            # Handle any other exceptions that occur during the process and return an error response with status 500
            return Response({"status": "error", "message": "An error occurred during file deletion"}, status=500)


class CategoryWiseDownloadView(APIView):
    """
    API endpoint for downloading category-wise documents.
    Parameters:
            - 'file_id'

    Returns:
        Response: A category file downloaded to the frontend
    """

    def post(self, request):
        try:
            # Get the file_id from the request
            file_id = request.POST.get("file_id", "")

            # Use the audit_logger to log the received file_id
            audit_logger.info(f"Received request for file_id: {file_id}")

            # Connect to the MongoDB server
            client = MongoClient(MONGODB_URI)

            # Access a specific database
            db = client["Metadata"]
            collection = db["category_output_metadata"]

            # Find the document in the collection based on the provided file_id
            document = collection.find_one({"_id": ObjectId(file_id)})
            cur_datetime = datetime.now().astimezone()
            # If no document is found with the given file_id, raise a NotFound exception
            if not document:
                # Use the exception_logger to log the error
                exception_logger.error("Document not found with the provided file_id",
                                       extra={"file_id": file_id})
                raise NotFound("Document not found with the provided file_id")

            # Convert the ObjectId to a string for serialization
            document["_id"] = str(document["_id"])

            # Get the file name based on the 'category_name' field in the document
            file_name = document["category_name"] + ".pdf"

            # Set the local file path to save the downloaded file
            folder_creation(os.path.join(
                os.getcwd(), "/mnt/supporting_folders", "category_wise_doc", cur_datetime.strftime('%Y-%m-%dT%H:%M:%S%z')
            ))

            local_file_path = os.path.join(
                os.getcwd(), "/mnt/supporting_folders", "category_wise_doc", cur_datetime.strftime('%Y-%m-%dT%H:%M:%S%z'), file_name
            )

            # Connect to the Azure Blob storage
            blob_service_client = BlobServiceClient.from_connection_string(
                AZURE_STORAGE_CONNECTION_STRING
            )
            container_client = blob_service_client.get_container_client(
                container_name)
            blob_client = container_client.get_blob_client(
                document["pdf_file_path"])

            # Download the blob and save it to the local file path
            with open(local_file_path, mode="wb") as sample_blob:
                download_stream = blob_client.download_blob()
                sample_blob.write(download_stream.readall())

            # Use the transaction_logger to log successful file download
            transaction_logger.debug(
                f"File downloaded successfully for file_id: {file_id}")

            # Open and return the downloaded file as a response to the frontend
            pdf_file = open(local_file_path, "rb")
            response = HttpResponse(pdf_file, content_type='application/pdf')
            response['Content-Disposition'] = 'attachment; filename="{}"'.format(
                file_name)
            return response

        except NotFound as e:
            # Handle the case when the document with the provided file_id is not found
            return Response({"message": "Document not found with the provided file_id"}, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            # Use the exception_logger to log any other exceptions
            exception_logger.exception(
                f"An error occurred during file download in file_id, exception_message : {file_id} {str(e)}")
            return Response({"error": "An error occurred during file download"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ParameterWiseDownloadView(APIView):
    """
    API endpoint for downloading parameter-wise documents.
    Parameters:
            - 'file_id'

    Returns:
        Response: A parameter file downloaded to the frontend
    """

    def post(self, request):
        try:
            # Get the file_id from the request
            file_id = request.POST.get("file_id", "")

            # Use the audit_logger to log the received file_id
            audit_logger.info(f"Received request for file_id: {file_id}")

            # Connect to the MongoDB server
            client = MongoClient(MONGODB_URI)

            # Access a specific database
            db = client["Metadata"]
            collection = db["output_metadata"]

            # Find the document in the collection based on the provided file_id
            document = collection.find_one({"_id": ObjectId(file_id)})
            cur_datetime = datetime.now().astimezone()
            # If no document is found with the given file_id, raise a NotFound exception
            if not document:
                # Use the exception_logger to log the error
                exception_logger.error(
                    f"Document not found with the provided file_id {file_id}")
                raise NotFound("Document not found with the provided file_id")

            # Convert the ObjectId to a string for serialization
            document["_id"] = str(document["_id"])
            # Get the file name based on the 'parameter' field in the document
            file_name = document["parameter"] + ".docx"

            # Set the local file path to save the downloaded file
            folder_creation(os.path.join(
                os.getcwd(), "/mnt/supporting_folders", "parameter_wise_doc", cur_datetime.strftime('%Y-%m-%dT%H:%M:%S%z')
            ))

            local_file_path = os.path.join(
                os.getcwd(), "/mnt/supporting_folders", "parameter_wise_doc", cur_datetime.strftime('%Y-%m-%dT%H:%M:%S%z'), file_name
            )

            # Connect to the Azure Blob storage
            blob_service_client = BlobServiceClient.from_connection_string(
                AZURE_STORAGE_CONNECTION_STRING
            )
            container_client = blob_service_client.get_container_client(
                container_name)
            blob_client = container_client.get_blob_client(
                document["parameter_doc_blob_path"]
            )

            # Download the blob and save it to the local file path
            with open(local_file_path, mode="wb") as sample_blob:
                download_stream = blob_client.download_blob()
                sample_blob.write(download_stream.readall())

            # Use the transaction_logger to log successful file download
            transaction_logger.debug(
                f"File downloaded successfully for file_id: {file_id}")

            # Open and return the downloaded file as a response to the frontend
            pdf_file = open(local_file_path, "rb")
            response = HttpResponse(pdf_file, content_type='application/docx')
            response['Content-Disposition'] = 'attachment; filename="{}"'.format(
                file_name)
            return response

        except NotFound as e:
            # Handle the case when the document with the provided file_id is not found
            return Response({"error": "Document not found with the provided file_id"}, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            # Use the exception_logger to log any other exceptions
            exception_logger.exception(
                f"An error occurred during file download in file_id,exception_message: {file_id} {str(e)}")
            return Response({"error": "An error occurred during file download"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class FetchCategoryWiseData(APIView):
    def post(self, request):
        try:
            # Get tender_number and category_name from the request POST data
            tender_name = request.POST["tender_name"]
            tender_number = request.POST["tender_number"]
            category_name = request.POST["category_name"]

            # Create a dictionary to hold the category-wise data
            file_document_detail_obj = {}
            file_document_detail_obj[category_name] = {}

            # Use the audit_logger to log the tender_number and category_name
            audit_logger.info(
                f"Fetching category-wise data for tender_number: {tender_number}, category_name: {category_name}")

            # Connect to the MongoDB server
            client = MongoClient(MONGODB_URI)

            # Access a specific database
            db = client["Metadata"]

            # Access a specific collection within the database
            collection = db["output_metadata"]
            category_collection = db["category_output_metadata"]
            # merge_docx_collection = db["merge_docx_metadata"]

            # Retrieve the data based on the provided division
            query = {"tender_number": str(
                tender_number), "tender_name": tender_name, "category": category_name}

            # Use the transaction_logger to log the query being executed
            transaction_logger.debug(f"Executing query: {query}")

            # Retrieve the results from the 'output_metadata' collection
            results = list(collection.find(query))

           

            # Retrieve the category data from the 'category_output_metadata' collection
            category_query = {"tender_number": str(
                tender_number), "tender_name": tender_name, "category_name": category_name}
            category_result = category_collection.find_one(category_query)

            # If category_result is None, handle the situation accordingly
            if not category_result:
                # Use the exception_logger to log the error
                exception_logger.error(
                    f"No category data found for the provided tender_number and category_name{tender_number} {category_name}")

                return Response(
                    {
                        "error": f"No category data found for the provided {tender_number} and {category_name}"
                    }, status=status.HTTP_404_NOT_FOUND
                )

            # Convert ObjectId to string representation in the results
            for result in results:
                # audit_logger.info(f"===> {result}")
                result["_id"] = str(result["_id"])
                file_document_detail_obj[category_name][result["parameter"]] = result

            # # Add merge_docx _id to the response
            # if "merge_docx_id" in file_document_detail_obj[category_name]:
            #     file_document_detail_obj[category_name]["merge_docx_id"] = str(
            #         merge_doc_result["_id"])
            # else:
            #     file_document_detail_obj[category_name]["merge_docx_id"] = ""

            # If the category_result is not None, add the 'category_output_id' to the response
            file_document_detail_obj[category_name]["category_output_id"] = str(
                category_result["_id"])

            # Return the category-wise data in the response
            return Response({"category_output": file_document_detail_obj})

        except KeyError as e:
            # Handle the case when 'tender_number' or 'category_name' is missing in the request POST data
            exception_logger.exception(
                {"error in fetcg Category wise api": str(e)})
            return Response({"error": f"Invalid request. {tender_number} or {category_name} is missing."}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            # Handle any other unexpected errors
            exception_logger.exception(
                {"error in fetcg Category wise api": str(e)})
            return Response({"error": "An unexpected error occurred."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class CummulativeWiseDownloadView(APIView):
    """
    API endpoint for downloading parameter-wise documents.
    Parameters:
            - 'file_id'

    Returns:
        Response: A parameter file downloaded to the frontend
    """

    def post(self, request):
        file_id = request.POST.get("file_id", "")

        try:
            # Get the file_id from the request

            # Use the audit_logger to log the received file_id
            audit_logger.info(f"Received request for file_id: {file_id}")

            # Connect to the MongoDB server
            client = MongoClient(MONGODB_URI)

            # Access a specific database
            db = client["Metadata"]
            collection = db["merge_docx_metadata"]
            # audit_logger.info(f"===> {collection}")
            # Find the document in the collection based on the provided file_id
            # audit_logger.info(f"====> line 955{collection}")
            document = collection.find_one({"_id": ObjectId(file_id)})
            # audit_logger.info(f"===> {document}")
            cur_datetime = datetime.now().astimezone()
            # If no document is found with the given file_id, raise a NotFound exception
            if not document:
                # audit_logger.info(f"==={'hiii'}")
                # Use the exception_logger to log the error
                exception_logger.error(
                    f"Document not found with the provided file_id {file_id}")
                raise NotFound("Document not found with the provided file_id")

            # Convert the ObjectId to a string for serialization
            document["_id"] = str(document["_id"])

            # Get the file name based on the 'parameter' field in the document
            file_name = "general_docx.docx"

            # Set the local file path to save the downloaded file
            folder_creation(os.path.join(
                os.getcwd(), "/mnt/supporting_folders",f"{document['tender_name']}_{document['tender_number']}","general_docx", cur_datetime.strftime('%Y-%m-%dT%H:%M:%S%z')
            ))

            local_file_path = os.path.join(
                os.getcwd(), "/mnt/supporting_folders",f"{document['tender_name']}_{document['tender_number']}","general_docx", cur_datetime.strftime('%Y-%m-%dT%H:%M:%S%z'), file_name
            )

            # audit_logger.info(f"===> {983}")
            # Connect to the Azure Blob storage
            blob_service_client = BlobServiceClient.from_connection_string(
                AZURE_STORAGE_CONNECTION_STRING
            )
            audit_logger.info(f"===> {blob_service_client}")

            container_client = blob_service_client.get_container_client(
                container_name)
            blob_client = container_client.get_blob_client(
                document["parameter_doc_blob_path"]
            )


            # Download the blob and save it to the local file path
            with open(local_file_path, mode="wb") as sample_blob:
                download_stream = blob_client.download_blob()
                sample_blob.write(download_stream.readall())

            # Use the transaction_logger to log successful file download
            transaction_logger.debug(
                f"File downloaded successfully for file_id: {file_id}")

            # Open and return the downloaded file as a response to the frontend
            pdf_file = open(local_file_path, "rb")
            response = HttpResponse(pdf_file, content_type='application/docx')
            response['Content-Disposition'] = 'attachment; filename="{}"'.format(
                file_name)
            return response

        except NotFound as e:
            # Handle the case when the document with the provided file_id is not found
            return Response({"error": "Document not found with the provided file_id"}, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            # Use the exception_logger to log any other exceptions
            exception_logger.exception(
                f"An error occurred during file download in file_id,exception_message: {file_id} {str(e)}")
            return Response({"error": "An error occurred during file download"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)



class ParameterWiseXlsxDownloadView(APIView):
    """
    API endpoint for downloading parameter-wise documents.
    Parameters:
            - 'file_id'

    Returns:
        Response: A parameter file downloaded to the frontend
    """

    def post(self, request):
        try:
            # Get the file_id from the request
            file_id = request.POST.get("file_id", "")

            # Use the audit_logger to log the received file_id
            audit_logger.info(f"Received request for file_id: {file_id}")

            # Connect to the MongoDB server
            client = MongoClient(MONGODB_URI)

            # Access a specific database
            db = client["Metadata"]
            collection = db["output_metadata"]

            # Find the document in the collection based on the provided file_id
            document = collection.find_one({"_id": ObjectId(file_id)})
            cur_datetime = datetime.now().astimezone()
            # If no document is found with the given file_id, raise a NotFound exception
            if not document:
                # Use the exception_logger to log the error
                exception_logger.error(
                    f"Document not found with the provided file_id {file_id}")
                raise NotFound("Document not found with the provided file_id")

            # Convert the ObjectId to a string for serialization
            document["_id"] = str(document["_id"])

            # Get the file name based on the 'parameter' field in the document
            file_name = document["parameter"] + ".xlsx"

            # Set the local file path to save the downloaded file
            folder_creation(os.path.join(
                os.getcwd(), "/mnt/supporting_folders", "parameter_wise_doc","xlsx_doc", cur_datetime.strftime('%Y-%m-%dT%H:%M:%S%z')
            ))

            local_file_path = os.path.join(
                os.getcwd(), "/mnt/supporting_folders", "parameter_wise_doc","xlsx_doc", cur_datetime.strftime('%Y-%m-%dT%H:%M:%S%z'), file_name
            )

            # Connect to the Azure Blob storage
            blob_service_client = BlobServiceClient.from_connection_string(
                AZURE_STORAGE_CONNECTION_STRING
            )
            container_client = blob_service_client.get_container_client(
                container_name)
            blob_client = container_client.get_blob_client(
                document["parameter_xlsx_blob_path"]
            )

            # Download the blob and save it to the local file path
            with open(local_file_path, mode="wb") as sample_blob:
                download_stream = blob_client.download_blob()
                sample_blob.write(download_stream.readall())

            # Use the transaction_logger to log successful file download
            transaction_logger.debug(
                f"File downloaded successfully for file_id: {file_id}")

            # Open and return the downloaded file as a response to the frontend
            pdf_file = open(local_file_path, "rb")
            response = HttpResponse(pdf_file, content_type='application/xslx')
            response['Content-Disposition'] = 'attachment; filename="{}"'.format(
                file_name)
            return response

        except NotFound as e:
            # Handle the case when the document with the provided file_id is not found
            return Response({"mesage": "Xlsx file is not generated for the selected sub-category"}, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            # Use the exception_logger to log any other exceptions
            exception_logger.exception(
                f"An error occurred during file download in file_id,exception_message: {file_id} {str(e)}")
            return Response({"mesage": "Xlsx file is not generated for the selected sub-category"}, status=status.HTTP_404_NOT_FOUND)


class MergeDocxView(APIView):
    def post(self, request):
        try:
            # Get tender_number from the request POST data
            tender_name = request.POST["tender_name"]
            tender_number = request.POST["tender_number"]

            # Create a dictionary to hold the merge_docx data
            merge_dict = {}

            # Use the audit_logger to log the tender_number
            audit_logger.info(
                f"Fetching merge_docx data for tender_number: {tender_number}")

            # Connect to the MongoDB server
            client = MongoClient(MONGODB_URI)

            # Access a specific database
            db = client["Metadata"]

            # Access the merge_docx collection within the database
            merge_docx_collection = db["merge_docx_metadata"]

            # Retrieve the merge_docx data
            merge_doc_query = {"tender_number": tender_number, "tender_name": tender_name}
            merge_doc_result = merge_docx_collection.find_one(merge_doc_query)

            # If merge_doc_result is not None, add the 'merge_docx_id' to the response
            if merge_doc_result:
                merge_dict["merge_docx_id"] = str(merge_doc_result["_id"])
            else:
                merge_dict["merge_docx_id"] = ""

            # Return the merge_docx data in the response
            return Response({"Merge_docx": merge_dict})

        except KeyError as e:
            # Handle the case when 'tender_number' is missing in the request POST data
            exception_logger.exception(
                {"error in fetching merge_docx data": str(e)})
            return Response({"error": f"Invalid request. {tender_number}"}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            # Handle any other unexpected errors
            exception_logger.exception(
                {"error in fetching merge_docx data": str(e)})
            return Response({"error": "An unexpected error occurred."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class SingleFileUpload(APIView):
    def post(self, request):
        try:
            tender_number = request.POST['tender_number']
            tender_name = request.POST['tender_name']

            # Connect to the MongoDB server
            client = MongoClient(MONGODB_URI)

            # Access a specific database
            db = client["Metadata"]

            collection = db['tender_metadata']
            version_collection = db['versioning_category_metadata']
            collection_output = db['output_metadata']

            # Get the main tender data from the 'tender_metadata' collection
            data = collection.find_one(
                {"tender_number": tender_number, "tender_name": tender_name})

            # Update the file_upload_status field for the given tender_name
            collection.update_one(
                {'tender_name': tender_name, 'tender_number': tender_number},
                {'$set': {'tender_status': 'processing',
                          'updated_by': data['uploaded_by'], 'updated_date': datetime.now()}}
            )

            # Get the old category data from the 'output_metadata' collection
            old_category_data = collection_output.find(
                {"tender_number": tender_number, "tender_name": tender_name})

            # Insert the old category data into the 'versioning_category_metadata' collection
            version_collection.insert_many(
                [{**document} for document in old_category_data])

            # Delete all documents in the 'output_metadata' collection that have the same 'tender_number' as the 'document'
            collection_output.delete_many(
                {"tender_number": tender_number,  "tender_name": tender_name})

            # Call a custom function add_category_after_deleting() to add new category data after deletion
            new_category_data = deleteFileFunc().add_category_after_deleting(
                data["division"],
                data["tender_name"],
                data["tender_number"],
                data["published_date"],
                data["uploaded_by"],
                old_category_data[0]["version"] + 1
            )

            # Return success response with the new category data
            return Response({"success": "success", "new_category_data": new_category_data})
        except KeyError as e:
            # Handle the case when 'tender_number' is not present in the request POST data
            return Response({"error": "Invalid request. 'tender_number' is missing."}, status=400)
        except PyMongoError as e:
            # Handle MongoDB-related errors
            return Response({"error": "A database error occurred."}, status=500)
        except Exception as e:
            # Handle any other unexpected errors
            return Response({"error": "An unexpected error occurred."}, status=500)


class categories_api(APIView):

    def post(self, request):
        audit_logger.info("request===> {}".format(request.POST))
        csv_data = {
            "tender_name": request.POST["tender_name"],
            "tender_number": request.POST["tender_number"],
            "division": request.POST["division"],
            "published_date": request.POST["published_date"],
            "file_type": request.POST["file_type"],
            "file_path": request.POST["file_path"],
            "uploaded_by": request.POST["uploaded_by"],
            "folder_name": request.POST["folder_name"]

        }

        # task_id = data.get("task_id")
        audit_logger.info("category api testing")
        category_wise_view = CategoryGenerator(csv_data)
        category_wise_view.start_category_generator()
        audit_logger.info("category api testing done")

        return Response({"hello": "world"})


class DeleteTender(APIView):
    def post(self, request):
        # try:
        tender_name = request.POST['tender_name']
        tender_number = str(request.POST['tender_number'])

        # Connect to the MongoDB server
        client = MongoClient(MONGODB_URI)

        # Access a specific database
        db = client["Metadata"]

        collection = db['tender_metadata']
        version_collection = db['versioning_category_metadata']
        collection_output = db['output_metadata']
        csv_collection = db['csv_metadata']
        uploaded_tender_metadata = db['uploaded_tender_metadata']
        category_output_metadata_collection = db['category_output_metadata']

        # Delete documents from various collections
        collection.delete_one(
            {"tender_number": tender_number, "tender_name": tender_name})
        csv_collection.delete_many(
            {"tender_number": tender_number, "tender_name": tender_name})
        collection_output.delete_many(
            {"tender_number": tender_number, "tender_name": tender_name})
        category_output_metadata_collection.delete_many(
            {"tender_number": tender_number, "tender_name": tender_name})
        version_collection.delete_many(
            {"tender_number": tender_number, "tender_name": tender_name})
        uploaded_tender_metadata.delete_many(
            {"tender_number": tender_number, "tender_name": tender_name})
        client.close()  # Close the MongoDB client when done

        return Response({"message": "Tender deleted successfully"})

        # except KeyError as e:
        #     return Response({"error": f"Missing key in request: {str(e)}"}, status=400)
        # except ConnectionError:
        #     return Response({"error": "Unable to connect to the MongoDB server"}, status=500)
        # except ServerSelectionTimeoutError:
        #     return Response({"error": "MongoDB server selection timed out"}, status=500)
        # except PyMongoError as e:
        #     return Response({"error": f"MongoDB error: {str(e)}"}, status=500)
        # except Exception as e:
        #     return Response({"error": f"An unexpected error occurred: {str(e)}"}, status=500)

class UploadedFileDownloadView(APIView):
    """
    API endpoint for downloading uploaded documents.
    Parameters:
            - 'file_id'

    Returns:
        Response: A binary file 
    """

    def post(self, request):
        try:
            file_id = request.POST.get("file_id", "")

            audit_logger.info(f"Received request to download *** uploaded file with file_id: {file_id}")

            client = MongoClient(MONGODB_URI)

            db = client['Metadata']
            collection = db['uploaded_tender_metadata']

            document = collection.find_one({ '_id': ObjectId(file_id) })
            cur_datetime = datetime.now().astimezone()

            if not document:
                # Use the exception_logger to log the error
                exception_logger.error("Document not found with the provided file_id",
                                       extra={"file_id": file_id})
                raise NotFound("Document not found with the provided file_id")
            
            document["_id"] = str(document["_id"])
            file_type = document["blob_file_path"].split('.')[-1]
            file_name = document["tender_file_name"] + '.' + file_type
            content_type = find_application_type(file_type)
            
            folder_creation(os.path.join(
                os.getcwd(), "/mnt/supporting_folders", "uploaded_files", cur_datetime.strftime('%Y-%m-%dT%H:%M:%S%z')
            ))

            local_file_path = os.path.join(
                os.getcwd(), "/mnt/supporting_folders", "uploaded_files", cur_datetime.strftime('%Y-%m-%dT%H:%M:%S%z'), file_name
            )

            # Connect to the Azure Blob storage
            blob_service_client = BlobServiceClient.from_connection_string(
                AZURE_STORAGE_CONNECTION_STRING
            )
            container_client = blob_service_client.get_container_client(
                container_name)
            blob_client = container_client.get_blob_client(
                document["blob_file_path"])

            # Download the blob and save it to the local file path
            with open(local_file_path, mode="wb") as sample_blob:
                download_stream = blob_client.download_blob()
                sample_blob.write(download_stream.readall())

            transaction_logger.debug(
                f"File downloaded successfully for file_id: {file_id}")

            # Open and return the downloaded file as a response to the frontend
            file = open(local_file_path, "rb")
            response = HttpResponse(file, content_type=content_type)
            response['Content-Disposition'] = 'attachment; filename="{}"'.format(
                file_name)
            response['Etag'] = '"{}"'.format(file_name)
            return response
            

        except NotFound as e:
            # Handle the case when the document with the provided file_id is not found
            return Response({"message": "Document not found with the provided file_id"}, status=status.HTTP_404_NOT_FOUND)

        except Exception as e:
            # Use the exception_logger to log any other exceptions
            exception_logger.exception(
                f"An error occurred during file download in file_id, exception_message : {file_id} {str(e)}")
            return Response({"error": "An error occurred during file download"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class TenderFail(APIView):
    """
    APIView to handle failing a tender operation.

    This view handles POST requests to mark a specific tender as failed
    based on the tender number provided in the request. It involves updating
    the tender status in the database and logging the operation.
    """

    def post(self, request):
        """
        Handle POST request to fail a tender.

        Args:
            request: The HTTP request object containing the tender_number.

        Returns:
            A Response object with a success message or error message.
        """
        
        try:
            # Extract tender_number and user_response from the request data
            tender_number = request.data.get("tender_number")
            user_response = request.data.get('resume_processing')

            # Validate tender_number
            if not tender_number:
                raise ValueError("Tender number is missing.")

            # Log the start of the process
            audit_logger.info(f"Starting tender failure process for tender_number: {tender_number}")

            # Initialize utility functions for database operations
            upload_file_func = uploadFileFunc()
            category_add_func_method = category_add_func()
            celery_utils = celeryUtils()
            adobe_key_util = adobeKeyUtils()
            
            
            # Connect to MongoDB and retrieve tender metadata
            client, _, uploaded_tender_metadata, tender_metadata, collection_task_metadata = adobe_key_util.connect_to_mongodb()

            # Query MongoDB for the tender data
            user_response_doc_query = {"tender_number": tender_number}
            user_response_result = tender_metadata.find_one(user_response_doc_query)
            celery_doc = collection_task_metadata.find_one(user_response_doc_query)
            
            # Validate the existence of the tender in the database
            if not user_response_result or not celery_doc:
                audit_logger.warning(f"Tender with number {tender_number} not found.")
                return Response({"error": "Tender not found."}, status=status.HTTP_404_NOT_FOUND)

            # Extract relevant data from the MongoDB document
            tender_data = {
                "tender_name": user_response_result.get('tender_name'),
                "division": user_response_result.get('division'),
                "uploaded_by": user_response_result.get('uploaded_by'),
                "task_id": celery_doc.get("task_id")
            }

            # Perform database updates for tender status
            upload_file_func.update_tender_metadata(
                tender_data["tender_name"], tender_number, tender_data["division"], 
                tender_data["uploaded_by"], tender_status='Failed'
            )
            category_add_func_method.update_file_processing_status(
                tender_data["tender_name"], tender_number, 
                tender_data["uploaded_by"], file_processing_status="Failed"
            )
            celery_utils.save_celery_task_metadata(
                tender_data["tender_name"], tender_number, 
                tender_data['task_id'], task_status="Failed"
            )

            email_sender = TenderEmailSender(tender_data["uploaded_by"], client, tender_metadata, tender_data["tender_name"], tender_number, uploaded_tender_metadata)

            # Log successful update
            transaction_logger.success(f"Tender {tender_number} successfully marked as failed.")
            email_msg = "Your tender status has been updated to 'Failed' due to the discontinuation of processing for categories containing corrupted files. This action aligns with the chosen operational protocol under such circumstances"
            email_sender.send_user_failure_email(email_msg)

            # Return a success message
            return Response({"message": "Tender failure process completed successfully."},status=status.HTTP_200_OK)

        except ValueError as e:
            # Log and handle missing tender_number in the request 
            exception_logger.error(f"Value error: {str(e)}")
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            # Log and handle any other unexpected errors
            exception_logger.error(f"Unexpected error in failing tender: {str(e)}")
            return Response({"error": "An unexpected error occurred."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
