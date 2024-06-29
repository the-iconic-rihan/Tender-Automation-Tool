import os
import time
import json
from datetime import datetime
from bson import ObjectId
from .utils.adobeKeyUtils import adobeKeyUtils
from .utils.utils import category_add_func
from .utils.celeryUtils import celeryUtils
from .utils.uploadFileFunc import uploadFileFunc
from .category_generator import CategoryGenerator
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from .csv_generator import CSVGenerator
from celery import shared_task
from authentication.email_utils import  TenderEmailSender
from .logger import celery_logger,celery_exception

channel_layer = get_channel_layer()

   
@shared_task
def generate_csv(uploaded_queue_files, session_id, new_username):
    
    """
    A Celery shared task for generating CSV files from uploaded tender data.

    Args:
        uploaded_queue_files (list): List of files to be processed.
        session_id (str): Session ID of the user.
        new_username (str): Username of the user initiating the process.
    """
    
    """
    Processes tender data by connecting to MongoDB, retrieving tender metadata, and performing a series of operations
    including CSV generation, email notifications, and error handling.

    """
   
    celery_logger.info("entering in task.....")    
    try:

        # Connect to MongoDB and initialize various parameters
        adobe_key_util = adobeKeyUtils()
        upload_file_func = uploadFileFunc()
        category_add_func_method = category_add_func()
        celery_utils = celeryUtils() 
        client, _, uploaded_tender_metadata, tender_metadata,collection_task_metadata = adobe_key_util.connect_to_mongodb()
        unique_tender_numbers = set()
        task_id = generate_csv.request.id
        processed_files = []
        remaining_files = uploaded_queue_files.copy()
        
        celery_logger.info(f"Connected to MongoDB for session_id and username : {session_id} {new_username} at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

        # Iterating over the uploaded files

        for fileNo in uploaded_queue_files:
            for key, value in fileNo.items():
                celery_logger.info(f"Processing File ID for user with session_id and username: {value} {session_id} {new_username} {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
                
                # Retrieving the document related to the file from MongoDB

                document = uploaded_tender_metadata.find_one({"_id": ObjectId(value)})
                if not document:
                    celery_exception.exception(f"Document not found with the provided file_id for session_id and username: {session_id} {new_username}, file_id: {value}")

                    return f"Document not found with the provided file_id for file_id: {value}"

                csv_data = {
                    "tender_name": document.get("tender_name"),
                    "tender_number": document.get("tender_number"),
                    "division": document.get("division"),
                    "published_date": document.get("published_date"),
                    "file_type": document.get("file_type"),
                    "file_path": document.get("blob_file_path"),
                    "uploaded_by": document.get("uploaded_by"),
                    "task_id": task_id,
                    "folder_name": f"{document.get('tender_name')}_{document.get('tender_number')}_{document.get('published_date')}",
                    "extension": document.get("extension"),
                    "file_name": document.get("tender_file_name"),
                   "tender_status": document.get("tender_status"),
                    "file_upload_status" : document.get("file_upload_status"),
                    "uploaded_date": document.get("uploaded_date"),
                    "extension": document.get("extension")
                }
                
                # Skipping file processing if conditions are not met

                if not csv_data["file_path"] or csv_data["file_upload_status"] != "File Uploaded":
                    remaining_files.remove(fileNo)
                    continue
                
                celery_logger.info(f"csv_data {csv_data}")
                celery_logger.info(f"Fetched documents from MongoDB for session_id and username: {session_id} {new_username} {csv_data} {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
            
                email_sender = TenderEmailSender(csv_data["uploaded_by"], client, tender_metadata, csv_data["tender_name"], csv_data["tender_number"], uploaded_tender_metadata)
                send_email = csv_data["tender_number"] not in unique_tender_numbers


                # Sending processing email if conditions are met

                if send_email:
                    unique_tender_numbers.add(csv_data["tender_number"])
                    email_sender.send_processing_email()

                # Generating CSV using the CSVGenerator class
                
                celery_logger.info(f"CSV generation started... for username {new_username}")

                csv_generator_view = CSVGenerator(csv_data)
                csv_result = csv_generator_view.start_csv()
                
                celery_logger.info(f"csv_response for session_id and : {session_id} {new_username} {csv_result}")


                # Updating the processed files list

                processed_files.append({key: value})
                
                celery_logger.info(f"Processed files for username: {processed_files} {new_username}")

                # Updating the remaining files list

                remaining_files = [file for file in remaining_files if file not in processed_files]
                
                celery_logger.info(f"Processed file ID: {value} for username: {new_username}")

                celery_logger.info(f"Remaining files to convert CSV for session_id and username: {session_id} {new_username} {remaining_files}")
                
                # Handling error data and sending emails in case of errors
                
                error_data = tender_metadata.find_one({"tender_number": csv_data["tender_number"]})
                
                
                if next((value for value in csv_result.values() if "Some technical problem" in str(value)), None):
                    try:
                        error_message = {
                            "message": csv_result["error"],
                            "info": {
                                "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                                "tender_name": csv_data["tender_name"],
                                "tender_number": csv_data["tender_number"],
                            },
                        }
                        changing_different_status_to_failed(csv_data)
                        # upload_file_func.update_tender_metadata(
                        #     csv_data["tender_name"], csv_data["tender_number"], csv_data["division"], csv_data["uploaded_by"],
                        #     tender_status='Failed'
                        # )
                        # category_add_func_method.update_file_processing_status(
                        #     csv_data["tender_name"], csv_data["tender_number"], csv_data["uploaded_by"], file_processing_status='Failed'
                        # )
                        
                        # celery_utils.save_celery_task_metadata(csv_data["tender_name"], csv_data['tender_number'], csv_data['task_id'], task_status="Failed")

                        email_sender.send_failure_email(error_message["message"])

                        async_to_sync(channel_layer.group_send)(
                            f"{new_username}_{session_id}",
                            {"type": "file.uploaded",
                            "message": json.dumps(error_message)}
                        )

                        time.sleep(5)
                        
                    except Exception as e:
                        celery_exception.exception(f"Error occurred while changing the different status {str(e)}")
                        return {"error": f"Error occurred while changing the pending status to failed"}

                     
                elif len(remaining_files) == 0 and ((error_data and "bad_file_list" in error_data) or ("error" in csv_result.keys())):
                    celery_logger.debug(f"===> entering in bad file messeages in task")

                    bad_file_list = error_data["bad_file_list"]

                     
                    if len(bad_file_list) == 1:
                        bad_file = bad_file_list[0]
                        error_message = bad_file["error_message"]
                        file_name = bad_file["file_name"]
                        

                        if "BAD_PDF" in error_message:
                        
                            message = f"Unfortunately, we cannot process the file '{file_name}' that was uploaded for the tender named '{csv_data['tender_name']}'. The application encounters a BAD FILE error for the file and this might be due to Unsupported File Format, Corrupted or Incomplete File, Unknown Content Errors. Please login to the application to continue processing excluding this file, or reach out to our technical support team for further assistance and clarification."
                        
                        message = f"We apologize, but the data in the file '{file_name}' is too complex for our system to process. Please login to the application for continue processing excluding this file, or reach out to our technical support team for further assistance and clarification."
                    else:
                        celery_logger.debug("more then one file in bad file list")
                        
                        file_names = [bad_file["file_name"] for bad_file in bad_file_list]
                        message = f"Unfortunately, we cannot process this files {', '.join(file_names)} that was uploaded for the tender named '{csv_data['tender_name']}'. The application encounters an error while processing the mentioned file/files due to Unsupported File contents/Complex data in file, Corrupted or Incomplete File, Unknown Content Errors. Please login to the application for continue processing excluding this file, or reach out to our technical support team for further assistance and clarification."

                    error_message = {
                        "message": message,
                        "info": {
                            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                            "tender_name": csv_data["tender_name"],
                            "tender_number": csv_data["tender_number"],
                        },
                    }
                    upload_file_func.update_tender_metadata(
                        csv_data["tender_name"], csv_data["tender_number"], csv_data["division"], csv_data["uploaded_by"],
                        tender_status='Pending'
                    )
                    category_add_func_method.update_file_processing_status(
                        csv_data["tender_name"], csv_data["tender_number"], csv_data["uploaded_by"], file_processing_status='Pending'
                    )
                    
                    celery_utils.save_celery_task_metadata(csv_data["tender_name"], csv_data['tender_number'], csv_data['task_id'], task_status="Pending")

                    email_sender.send_pending_email(message)

                    async_to_sync(channel_layer.group_send)(
                        f"{new_username}_{session_id}",
                        {"type": "file.uploaded",
                        "message": json.dumps(error_message)}
                    )

                    time.sleep(5)
                    
                    return {"message": f"tender status change to pending successfull: {message}"}
                
               
                
                
                # Finalizing the CSV generation process

                if len(remaining_files) == 0:
                    csv_completion_message = {
                        "csv_completed": f"CSV generation completed for all files for session_id {session_id} and user {new_username} at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}",
                        "task_info": {
                            "task_id": task_id
                        }
                    }

                    try:
                        async_to_sync(channel_layer.group_send)(
                            f"{new_username}_{session_id}",
                            {"type": "file.uploaded",
                                "message": json.dumps(csv_completion_message)})
                    except Exception as e:
                        celery_exception.exception(f"Error message sending for session_id, username: {session_id}, {new_username}: {str(e)}")

                    try:
                        category_wise_view = CategoryGenerator(csv_result)
                        category_response = category_wise_view.start_category_generator()

                        category_api_completed_message = {
                            "message": f"Category API completed for user {new_username}",
                            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                            "tender_name": csv_data["tender_name"],
                            "tender_number": csv_data["tender_number"],
                            "task_id": task_id
                        }

                        if "error" in category_response.keys():
                            error_message = {
                                "message": category_response["error"],
                                "info": {
                                    "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                                    "tender_name": csv_data["tender_name"],
                                    "tender_number": csv_data["tender_number"],
                                    "username": new_username,
                                    "task_id": task_id
                                }
                                
                            }
                            celery_exception.exception(f"Error generating categories for session_id with username: {session_id} {new_username}: {category_response['error']}")
                            
                            changing_different_status_to_failed(csv_data)

                            #updating the status for files and tender
                            # upload_file_func.update_tender_metadata(
                            #     csv_data["tender_name"], csv_data["tender_number"], csv_data["division"], csv_data["uploaded_by"], tender_status='Failed'
                            # )
                            
                            # category_add_func_method.update_file_processing_status(csv_data["tender_name"], csv_data["tender_number"], csv_data["uploaded_by"], file_processing_status="Failed")
                            
                            # celery_utils.save_celery_task_metadata(csv_data["tender_name"], csv_data['tender_number'], csv_data['task_id'], task_status="Failed")

                            async_to_sync(channel_layer.group_send)(
                                f"{new_username}_{session_id}",
                                {"type": "file.uploaded",
                                    "message": json.dumps(error_message)})
                            time.sleep(5)
                            return f"Error generating categories for session_id: {session_id}: {category_response['error']}"

                        
                        celery_utils.save_celery_task_metadata(csv_data["tender_name"], csv_data["tender_number"], task_id, task_status="succeed")
                        upload_file_func.update_tender_metadata(
                                csv_data["tender_name"], csv_data["tender_number"], csv_data["division"], csv_data["uploaded_by"], tender_status='Succeeded'
                            )
                        category_add_func_method.update_file_processing_status(csv_data["tender_name"], csv_data["tender_number"], csv_data["uploaded_by"], file_processing_status="Succeeded")

                        celery_document = collection_task_metadata.find_one({"task_id": task_id})
                        
                        task_status = celery_document['task_status']

                        if celery_document and task_status == "succeed":
                            async_to_sync(channel_layer.group_send)(
                                f"{new_username}_{session_id}",
                                {"type": "file.uploaded",
                                    "message": json.dumps(category_api_completed_message)})
                            time.sleep(5)
                            celery_logger.info(f"Category completion message sent successfully for tender number {csv_data['tender_number']} for user {new_username}")
                           
                    except Exception as e:
                        error_message = {
                            "message": "category stop due to some reason, please contect to development team.",
                            "info": {
                                "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                                "tender_name": csv_data["tender_name"],
                                "tender_number": csv_data["tender_number"],
                                "username": new_username,
                                "task_id": task_id
                            }
                        }
                        celery_exception.exception(f"Error generating categories for session_id with username: {session_id} {new_username}: {str(e)}")
                        
                        changing_different_status_to_failed(csv_data)
                        # upload_file_func.update_tender_metadata(
                        #     csv_data["tender_name"], csv_data["tender_number"], csv_data["division"], csv_data["uploaded_by"], tender_status='Failed'
                        # )
                        # category_add_func_method.update_file_processing_status(csv_data["tender_name"], csv_data["tender_number"], csv_data["uploaded_by"], file_processing_status="Failed")

                
                        # celery_utils.save_celery_task_metadata(csv_data["tender_name"], csv_data['tender_number'], csv_data['task_id'], task_status="Failed")

                        async_to_sync(channel_layer.group_send)(
                            f"{new_username}_{session_id}",
                            {"type": "file.uploaded",
                                "message": json.dumps(error_message)})
                        time.sleep(5)
                        return f"Error generating categories for session_id: {session_id}: {str(e)}"
        
    except Exception as e:
        #  Handling any exceptions that occur during the process

        celery_exception.exception(f"Error in task scheduling for username, session_id: {new_username} {session_id}  : {str(e)}")
        error_message = {
                    "message": f"Task scheduling for username failed: {new_username} since {str(e)}",
                    "info": {
                        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                        "task_id": task_id
                    }
                }
        changing_different_status_to_failed(csv_data)
        # upload_file_func.update_tender_metadata(
        #                 csv_data["tender_name"], csv_data["tender_number"], csv_data["division"], csv_data["uploaded_by"],
        #                 tender_status='Failed'
        #             )
        # category_add_func_method.update_file_processing_status(
        #                 csv_data["tender_name"], csv_data["tender_number"], csv_data["uploaded_by"], file_processing_status='Failed'
        #             )
        # celery_utils.save_celery_task_metadata(csv_data["tender_name"], csv_data['tender_number'], csv_data['task_id'], task_status="Failed")

        async_to_sync(channel_layer.group_send)(
                f"{new_username}_{session_id}",
                {"type": "file.uploaded",
                    "message": json.dumps(error_message)})
        time.sleep(5)
        return f"Error in task scheduling for session_id with username: {session_id} {new_username}: {str(e)}"




@shared_task
def generate_category_only(session_id, username, tender_number):
    
    
    """
        Generate category data for uploaded files within a tender.

        Args:
            category_files_queue: The queue of files to process.
            session_id: The ID of the user's session.
            username: The username of the user initiating the operation.
            tender_number: The tender number for which categories are being generated.

        Returns:
            A dictionary containing the result of the operation or an error message.
    """
    category_data = None

    try:
        adobe_key_util = adobeKeyUtils()
        upload_file_func = uploadFileFunc()
        category_add_func_method = category_add_func()
        celery_utils = celeryUtils() 
        
        _, _, uploaded_tender_metadata,_ ,collection_task_metadata= adobe_key_util.connect_to_mongodb()
        
        filters = {"tender_number": tender_number}
        document = uploaded_tender_metadata.find_one(filters)
        celery_doc = collection_task_metadata.find_one(filters)

        category_data = {
            "tender_name": document.get("tender_name"),
            "tender_number": document.get("tender_number"),
            "division": document.get("division"),
            "published_date": document.get("published_date"),
            "file_type": document.get("file_type"),
            "uploaded_by": document.get("uploaded_by"),
            "task_id": celery_doc.get("task_id"),
            "folder_name": f"{document.get('tender_name')}_{tender_number}_{document.get('published_date')}"
        }
        celery_logger.info(f"category_data ===> {category_data}")

        try:
            upload_file_func.update_tender_metadata(category_data["tender_name"], category_data["tender_number"], category_data["division"], category_data["uploaded_by"], tender_status='Processing')
                    
            category_add_func_method.update_file_processing_status(category_data["tender_name"], category_data["tender_number"], category_data["uploaded_by"], file_processing_status="Processing")
                
            category_wise_view = CategoryGenerator(category_data)
            category_response = category_wise_view.start_category_generator()

            category_api_completed_message = {
                "message": f"Category API completed for user {username}",
                "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                "tender_name": category_data["tender_name"],
                "tender_number": category_data["tender_number"],
                "task_id": category_data["task_id"],
            }

            if "error" in category_response.keys():
                try:
                    
                    error_message = {
                        "message": category_response["error"],
                        "info": {
                            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                            "tender_name": category_data["tender_name"],
                            "tender_number": category_data["tender_number"],
                            "username": username,
                            "task_id": category_data["task_id"],
                        },
                    }
                    celery_exception.exception(f"Error generating categories for session_id with username: {session_id} {username}: {category_response['error']}")
                    
                    upload_file_func.update_tender_metadata(category_data["tender_name"], category_data["tender_number"], category_data["division"], category_data["uploaded_by"], tender_status='Failed')
                    
                    category_add_func_method.update_file_processing_status(category_data["tender_name"], category_data["tender_number"], category_data["uploaded_by"], file_processing_status="Failed")
                

                    celery_utils.save_celery_task_metadata(category_data["tender_name"], tender_number, category_data['task_id'], task_status="Failed")

                except Exception as e:
                    celery_exception.exception(f"Error in sending the category error message to {username} since {str(e)}" )
                
                return error_message
            
            
            celery_utils.save_celery_task_metadata(category_data["tender_name"], category_data["tender_number"], category_data["task_id"], task_status="succeed")
            upload_file_func.update_tender_metadata(category_data["tender_name"], category_data["tender_number"], category_data["division"], category_data["uploaded_by"], tender_status='Succeeded')
                    
            category_add_func_method.update_file_processing_status(category_data["tender_name"], category_data["tender_number"], category_data["uploaded_by"], file_processing_status="Succeeded")
                

            task_status = celery_doc.get('task_status')

            if task_status and task_status == "succeed":
                
                celery_logger.info(f"Category completion message sent successfully for tender number {category_data['tender_number']} for user {username}")
                try:
                    async_to_sync(channel_layer.group_send)(
                        f"{username}_{session_id}",
                        {"type": "file.uploaded",
                            "message": json.dumps(category_api_completed_message)})
                    
                except Exception as e:
                    
                    celery_exception.exception(f"Error in sending the category completion message to {username} since {str(e)}")
                return "Category generation completed successfully."

        except Exception as e:
            error_message = {
                "message": "Category generation stopped due to some reason, please contact the development team.",
                "info": {
                    "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                    "tender_name": category_data["tender_name"],
                    "tender_number": category_data["tender_number"],
                    "username": username,
                    "task_id": category_data["task_id"],
                },
            }
            celery_exception.exception(f"Error generating categories for session_id with username: {session_id} {username}: {str(e)}")
            
            upload_file_func.update_tender_metadata(category_data["tender_name"], category_data["tender_number"], category_data["division"], category_data["uploaded_by"], tender_status='Failed')
            
            category_add_func_method.update_file_processing_status(category_data["tender_name"], category_data["tender_number"], category_data["uploaded_by"], file_processing_status="Failed")
                
            celery_utils.save_celery_task_metadata(category_data["tender_name"], tender_number, category_data['task_id'], task_status="Failed")

            async_to_sync(channel_layer.group_send)(
                f"{username}_{session_id}",
                {"type": "file.uploaded",
                    "message": json.dumps(error_message)})
            return error_message

    except Exception as e:
        celery_exception.exception(f'Error in task scheduling for username {username}, session_id: {session_id} due to: {str(e)}')
        error_message = {
            "message": f"Task scheduling for username failed: {username} since {str(e)}",
            "info": {
                "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            },
        }
        changing_different_status_to_failed(category_data)
        # upload_file_func.update_tender_metadata(category_data["tender_name"], category_data["tender_number"], category_data["division"], category_data["uploaded_by"], tender_status='Failed')
            
        # category_add_func_method.update_file_processing_status(category_data["tender_name"], category_data["tender_number"], category_data["uploaded_by"], file_processing_status="Failed")

        # celery_utils.save_celery_task_metadata(category_data["tender_name"], tender_number, category_data['task_id'], task_status="Failed")

        async_to_sync(channel_layer.group_send)(
            f"{username}_{session_id}",
            {"type": "file.uploaded",
                "message": json.dumps(error_message)})
        return error_message



@shared_task
def fail_tender(uploaded_files_queue, username, session_id):
    """
    Marks a tender as failed in the system. This function updates the tender status
    in the database, sends a notification to the user, and logs the action.

    Args:
        uploaded_files_queue (dict): Queue containing files uploaded for the tender, including the tender number.
        username (str): The username of the user who is initiating the operation.
        session_id (str): The session ID of the user's session.

    Returns:
        str: A message indicating the completion or failure of the operation.
    """

    try:
        celery_logger.info("Entering failed tender task.")
        # Extract the tender number from the uploaded files queue
        tender_number = uploaded_files_queue["tender_number"]

        # Initialize utility functions for database operations
        upload_file_func = uploadFileFunc()
        category_add_func_method = category_add_func()
        celery_utils = celeryUtils()
        adobe_key_util = adobeKeyUtils()

        # Connect to MongoDB and retrieve tender metadata
        client, _,uploaded_tender_metadata, tender_metadata, collection_task_metadata = adobe_key_util.connect_to_mongodb()
        
        # Find the specific tender and its task metadata in MongoDB
        document = tender_metadata.find_one({"tender_number": tender_number})
        celery_doc = collection_task_metadata.find_one({"tender_number": tender_number})

        # Extract relevant data from the MongoDB document
        tender_data = {
            "tender_name": document.get('tender_name'),
            "division": document.get('division'),
            "tender_number":document.get("tender_number"),
            "uploaded_by": document.get('uploaded_by'),
            "task_id": celery_doc.get("task_id")
        }
        email_sender = TenderEmailSender(tender_data["uploaded_by"], client, tender_metadata, tender_data["tender_name"], tender_number, uploaded_tender_metadata)

        # Log the failure initiation
        celery_logger.info(f"Tender number: {tender_number} for {username} is failing as per user request.")

        changing_different_status_to_failed(tender_data)
        # Update the tender status in the database to 'Failed'
        # upload_file_func.update_tender_metadata(tender_data["tender_name"], tender_number, tender_data["division"], tender_data["uploaded_by"], tender_status='Failed')
        # category_add_func_method.update_file_processing_status(tender_data["tender_name"], tender_number, tender_data["uploaded_by"], file_processing_status="Failed")
        # celery_utils.save_celery_task_metadata(tender_data["tender_name"], tender_number, tender_data['task_id'], task_status="Failed")
        
        email_msg = "Your tender status has been updated to 'Failed' due to the discontinuation of processing for categories containing corrupted files. This action aligns with the chosen operational protocol under such circumstances"
        email_sender.send_user_failure_email(email_msg)

        # Prepare and send a notification message
        try:
            tender_status_failed_completed_message = {
                "message": f"Tender {tender_data['tender_name']} has been marked as failed by {username}.",
                "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            }
            async_to_sync(channel_layer.group_send)(
                f"{username}_{session_id}",
                {"type": "file.uploaded", "message": json.dumps(tender_status_failed_completed_message)})
            celery_logger.info(f"Failure status message sent successfully for tender number {tender_number} to user {username}")

        except Exception as e:
            celery_exception.exception(f"Error in sending the failure status message to {username} due to: {str(e)}")
        return "Tender failure process completed successfully."

    except Exception as e:
        # Handle exceptions and notify the user
        tender_status_failed_completed_message = {
            "message": f"Technical issue encountered while setting tender {tender_number} as failed. Please contact the technical team.",
            "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }
        async_to_sync(channel_layer.group_send)(
            f"{username}_{session_id}",
            {"type": "file.uploaded", "message": json.dumps(tender_status_failed_completed_message)})
        celery_logger.exception(f"Failed to set tender number {tender_number} as failed for user {username}. Error: {str(e)}")
        return "Failed to complete the tender failure process due to a technical issue."



def changing_different_status_to_failed(csv_data):
    try:
        upload_file_func = uploadFileFunc()
        category_add_func_method = category_add_func()
        celery_utils = celeryUtils() 
    
        upload_file_func.update_tender_metadata(
            csv_data["tender_name"], csv_data["tender_number"], csv_data["division"], csv_data["uploaded_by"],
            tender_status='Failed'
        )
        category_add_func_method.update_file_processing_status(
            csv_data["tender_name"], csv_data["tender_number"], csv_data["uploaded_by"], file_processing_status='Failed'
        )
        celery_utils.save_celery_task_metadata(csv_data["tender_name"], csv_data['tender_number'], csv_data['task_id'], task_status="Failed")
        
        return {"message": "different status changed successfully"}
  
    except Exception as e:
        celery_exception.exception({"error":f"Error in updating the different status {str(e)}"})