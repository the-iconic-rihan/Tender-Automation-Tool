import time
from .utils.adobe_utils.core import mainFunc
from .utils.csv_utils.databasecreator import databasecreator
from pymongo import MongoClient
from azure.storage.blob import BlobServiceClient
import os
import subprocess
import pandas as pd
import re
from authentication.email_utils import  TenderEmailSender
from .logger import exception_logger, transaction_logger
from .utils.PagesCount import PagesCount
from .utils.celeryUtils import celeryUtils
from .utils.uploadFileFunc import uploadFileFunc
from .utils.utils import Ingest, folder_creation,category_add_func,csvGeneratorFunc
MONGODB_URI = os.environ['MONGODB_URI']
AZURE_STORAGE_CONNECTION_STRING = os.environ['AZURE_STORAGE_CONNECTION_STRING']
container_name = os.environ['container_name']


class CSVGenerator:
    
    def __init__(self, data) -> None:
        """
        Initialize the CSVGenerator with tender data.
        """
        self.tender_name = data.get("tender_name")
        self.tender_number = data.get("tender_number")
        self.division = data.get("division")
        self.published_date = data.get("published_date")
        self.file_type = data.get("file_type")
        self.file_path = data.get("file_path")
        self.uploaded_by = data.get("uploaded_by")
        self.folder_name = f"{self.tender_name}_{self.tender_number}_{self.published_date}"
        self.uploaded_date = data.get("uploaded_date")
        self.extension = data.get("extension")
        self.file_name = data.get("file_name")
        self.tender_status = "Processing"
        self.task_id = data.get("task_id")
        self.current_path = os.getcwd()

    def start_csv(self):
        
        """
        Main method to start the CSV generation process.
        """
        try:
            # Initialize MongoDB client
            client = MongoClient(MONGODB_URI)
            db = client["Metadata"]
            tender_metadata = db["tender_metadata"]
            uploaded_tender_metadata = db["uploaded_tender_metadata"]
            
            # Update tender metadata in the database
            uploadFileFunc().update_tender_metadata(self.tender_name, self.tender_number,
                                                    self.division, self.uploaded_by, tender_status="Processing")
            celeryUtils().save_celery_task_metadata(self.tender_name,
                                                    self.tender_number, self.task_id, task_status="csv-processing")
            
            # Create an instance of the TenderEmailSender class
            email_sender = TenderEmailSender(self.uploaded_by, client, tender_metadata, self.tender_name, self.tender_number, uploaded_tender_metadata)
              
                
            
                        
            # Initialize Azure Blob Storage client
            blob_service_client = BlobServiceClient.from_connection_string(
                AZURE_STORAGE_CONNECTION_STRING)
            self._create_folders_in_blob_storage(blob_service_client)

            # Download file from blob storage
            local_file_path = self._download_blob_file(blob_service_client)
            if local_file_path is None:
                return {"error": "Cloud server down, please try later or Contact support team"}
            


            local_csv_path = self._convert_to_csv(local_file_path,email_sender)

            if local_csv_path is None :
                
                return {"error": "Some technical problem, please contact support team"}
            
            elif "File contents are too complex for content extraction" in local_csv_path:
                    return {"error":f"File name : {self.file_name} data too complex to read, please upload a better version of the file."}
                    
            
            elif "BAD_PDF - Unable to extract content." in local_csv_path:
                
                    return {"error":f"file name :  {self.file_name} uploaded with tender name : {self.tender_name} is incompactible to our system. Please re-upload the tender excluding this file(s) or contact technical support for more clearity."}
            
            # Save the CSV to blob storage and update metadata
            csv_path = self._save_csv_to_blob(blob_service_client, local_csv_path)
            if csv_path is None:
                return {"error": "Cloud server down, please try later or. Contact support team"}

            self._save_metadata_to_mongodb(client, local_csv_path, csv_path)
            client.close()
            transaction_logger.debug("Processing completed successfully for tender_name: {}, tender_number: {}, file_type: {}".format(self.tender_name, self.tender_number, self.file_type))
            
           # Query the MongoDB collection for a specific tender
            tender_status_doc = tender_metadata.find_one({"tender_number": self.tender_number, "tender_name": self.tender_name})

            # Check if a document was found and then check the tender status
            if tender_status_doc and tender_status_doc.get("status") == "Succeeded":
                # Call the cleanup method if the tender status is 'Succeeded'
                self._cleanup_files(local_file_path, local_csv_path)

            
        

            return self._create_response()

               
            
        except Exception as e:
            self._handle_exception(e,email_sender)
            raise e
            return {"error": "An error occurred during file processing.", "tender_status": "Failed"}
        
        
    
    def _create_folders_in_blob_storage(self, blob_service_client):
        """
        Create necessary folders in Azure Blob Storage.
        """
        folders = [
            self.division,
            f"{self.division}/{self.folder_name}",
            f"{self.division}/{self.folder_name}/csv_data",
            f"{self.division}/{self.folder_name}/csv_data/{self.file_type}"
        ]

        for folder in folders:
            csvGeneratorFunc().create_folder_if_not_exists(blob_service_client, folder)
    
    
    def _download_blob_file(self, blob_service_client):
        """
        Download the file from Azure Blob Storage with up to 5 retry attempts.
        """
        max_retries = 5
        attempts = 0

        while attempts < max_retries:
            try:
                file_name = re.sub(
                    r"[^\w.-]", "_", os.path.basename(self.file_path))
                local_file_path = csvGeneratorFunc().download_file(
                    self.file_path, file_name, self.tender_name, self.tender_number)
                transaction_logger.debug(
                    "File downloaded successfully from blob storage")
                return local_file_path
            except Exception as e:
                attempts += 1
                exception_logger.exception("Attempt {} - Error downloading file from blob storage tender_name {}, tender_number {}, file_name {}, exception_message {}".format( attempts, self.tender_name, self.tender_number, os.path.basename(self.file_path), str(e)))
                time.sleep(30)  # Wait for 30 second before retrying (optional)

        return None
        
    def _convert_to_csv(self, local_file_path,email_sender):
        """
        Convert the downloaded file to a CSV format.
        """
    # try:
        folder_creation(os.path.join(
            "/mnt/supporting_folders", f"{self.tender_name}_{self.tender_number}", "local_csv_path"))
        local_csv_path = os.path.join(
            "/mnt/supporting_folders", f"{self.tender_name}_{self.tender_number}", "local_csv_path", self.file_name + ".csv")

        if self.extension.lower() in ["docx", "xlsx", "xls", "doc"]:
            try:
                local_doc2pdf_path, local_doc2pdf_file = self._convert_docx_doc_or_xls_xlsx_to_pdf(
                    local_file_path)
                
                PagesCount().extract_number_of_pages( local_doc2pdf_file, self.division, self.tender_number)
                
                PagesCount().extract_number_of_pages_per_tender(self.tender_number, local_doc2pdf_file)
                
                if "Failed to convert document to PDF" in [local_doc2pdf_path,local_doc2pdf_file]:
                    # e = "Failed to convert document to PDF. PLease uploaded the pdf verison of document or uploaded format not supported."
                    # # raise e
                    return  {"error":"Failed to convert document to PDF. PLease uploaded the pdf verison of document or uploaded format not supported."}
            
            except Exception as e:
                exception_logger.error("Error in converting to CSV: {}".format(str(e)))
                return None
                
        else:
            local_doc2pdf_file = local_file_path  # For PDF files, no conversion needed
            
            # if not csvGeneratorFunc().is_pdf_scannned(local_doc2pdf_file,self.tender_name):

            #     csvGeneratorFunc().searchable_pdf_via_pytesseract(local_doc2pdf_file,local_doc2pdf_file,self.tender_name)

            csvGeneratorFunc().pre_process_pdfs(local_doc2pdf_file,local_doc2pdf_file,self.tender_name,self.tender_number,self.division)
            
                
            # local_doc2pdf_file = document_func().remove_a3_5_from_pdf(local_doc2pdf_file,self.tender_name,self.file_name,self.tender_number)
            # audit_logger.info(f"===> {local_doc2pdf_file}")
            
        try:
            output = mainFunc().main(local_doc2pdf_file, self.file_name,
                                    self.tender_number, self.tender_name)
            create_dict = databasecreator().creating_dictionary(output)
            create_dict = databasecreator().split_text_onlimit(create_dict)
            creating_dataset = databasecreator().creating_dataset(create_dict, self.file_name, self.tender_name,self.tender_number)
            create_dataset = pd.read_csv(creating_dataset, header=0)
            Ingest().process(create_dataset, local_csv_path)
            return local_csv_path
        
        except Exception as e:
            if "File not suitable for content extraction: File contents are too complex for content extraction" in str(e) or "BAD_PDF - Unable to extract content." in f"{str(e)}":
                exception_logger.error(f"Adobe error except key expiration : {str(e)}")
                # save_error_to_mongodb(tender_number, tender_name, str(e))
                return str(e)
            else:
                
                exception_logger.error("Error in converting to CSV: {}".format(str(e)))
                return None
            
    # except Exception as e:
    #     exception_logger.error("Error in converting to CSV: {}".format(str(e)))
    #     return None

    def _convert_docx_doc_or_xls_xlsx_to_pdf(self, local_file_path):
        """
        Convert office files (.docx, .doc, .xlsx, .xls) to PDF format.
        """
        try:
            local_pdf_path = os.path.join(
                self.current_path, f"/mnt/supporting_folders/{self.tender_name}_{self.tender_number}/{self.extension}_to_pdf")
            local_pdf_file = os.path.join(
                local_pdf_path, self.file_name + '.pdf')
            subprocess.call(['soffice', '--convert-to', 'pdf',
                            f'--outdir', local_pdf_path, local_file_path])
            return local_pdf_path, local_pdf_file
        except Exception as e:
            exception_logger.exception("Conversion to PDF failed: {}".format(str(e)))
            return  {"error":"Failed to convert document to PDF. PLease uploaded the pdf verison of document or uploaded format not supported."}

            # return None, None

    def _save_csv_to_blob(self, blob_service_client, local_csv_path):
        """
        Save the generated CSV file to Azure Blob Storage.
        """
        try:
            csv_path = f"{self.division}/{self.folder_name}/csv_data/{self.file_type}/{self.file_name}.csv"
            blob_path = csvGeneratorFunc().save_file_to_blob_storage(
                blob_service_client, csv_path, local_csv_path)
            transaction_logger.debug(
                "CSV file saved to blob storage. Blob path: {}".format(blob_path))
            return csv_path
        except Exception as e:
            exception_logger.exception("Error saving CSV to blob storage: {}".format(str(e)))
            return None

    def _save_metadata_to_mongodb(self, client, local_csv_path, csv_path):
        """
        Save metadata related to the CSV file to MongoDB.
        """
        try:
        
        
            csvGeneratorFunc().save_csv_data_to_mongodb(client, local_csv_path, self.tender_name, self.tender_number, self.published_date, self.file_name, self.file_path, self.file_type, self.uploaded_by, self.extension)
            csvGeneratorFunc().update_blob_path_to_mongodb(client, self.tender_name, self.tender_number, self.file_name, csv_path, self.uploaded_by)
            transaction_logger.debug("CSV metadata updated in MongoDB")
        
        
        except Exception as e:
            exception_logger.exception("Error saving CSV metadata to MongoDB: {}".format(str(e)))
            return None


    def _cleanup_files(self, local_file_path, local_csv_path):
        """
        Clean up temporary files created during the process.
        """
        try:
            os.remove(local_file_path)
            os.remove(local_csv_path)
            additional_folders = [f"/mnt/supporting_folders/{self.tender_name}_{self.tender_number}/{self.extension}_to_pdf"]
            
            for folder in additional_folders:
                if os.path.exists(folder):
                    for filename in os.listdir(folder):
                        file_path = os.path.join(folder, filename)
                        if os.path.isfile(file_path):
                            os.remove(file_path)
            transaction_logger.debug("Cleaned up temporary files")
        except Exception as e:
            exception_logger.exception("Error during file cleanup: {}".format(str(e)))

    def _create_response(self):
        """
        Create a response dictionary with the tender's details.
        """
        return {
            "tender_name": self.tender_name,
            "tender_number": self.tender_number,
            "published_date": self.published_date,
            "tender_status": self.tender_status,
            "division": self.division,
            "file_type": self.file_type,
            "folder_name": self.folder_name,
            "file_path": self.file_path,
            "uploaded_by": self.uploaded_by,
            "task_id": self.task_id
        }

    def _handle_exception(self, exception,email_sender):
        """
        Handle exceptions that occur during the CSV generation process.
        """
        exception_logger.exception("An error occurred during file processing tender_name {}, tender_number {}, file_type {}, exception_message {}".format(
            self.tender_name, self.tender_number, self.file_type, str(exception)))
        uploadFileFunc().update_tender_metadata(self.tender_name, self.tender_number, self.division, self.uploaded_by, tender_status='Failed')
        
        category_add_func().update_file_processing_status(self.tender_name, self.tender_number, self.uploaded_by, file_processing_status="Failed")
        email_sender.send_failure_email(self.file_name,str(exception))
        
        
        
