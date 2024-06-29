import json
import os
import shutil
import zipfile
import fitz
from ...logger import *
from dashboard_backend.utils.adobeKeyUtils import adobeKeyUtils
from dashboard_backend.utils.csv_utils.databasecreator import databasecreator
from dashboard_backend.utils.utils import folder_creation,csvGeneratorFunc
from authentication.email_utils import  TenderEmailSender

# ADOBE CREDENTIALS
from adobe.pdfservices.operation.auth.credentials import Credentials
from adobe.pdfservices.operation.pdfops.options.extractpdf.extract_renditions_element_type import \
    ExtractRenditionsElementType
from adobe.pdfservices.operation.pdfops.options.extractpdf.extract_pdf_options import ExtractPDFOptions
from adobe.pdfservices.operation.pdfops.options.extractpdf.extract_element_type import ExtractElementType
from adobe.pdfservices.operation.pdfops.options.extractpdf.table_structure_type import TableStructureType
from adobe.pdfservices.operation.execution_context import ExecutionContext, ClientConfig
from adobe.pdfservices.operation.io.file_ref import FileRef
from adobe.pdfservices.operation.pdfops.extract_pdf_operation import ExtractPDFOperation
from pymongo import MongoClient
import time
MONGODB_URI = os.environ['MONGODB_URI']
client = MongoClient(MONGODB_URI)
db = client["Metadata"]
collection = db["keys"]

first_key = collection.find_one()
logger.info(f"====> {first_key}")
adobe_cred = {
 "ADOBE_CLIENT_ID": first_key["ADOBE_CLIENT_ID"],
"ADOBE_CLIENT_SECRET":first_key["ADOBE_CLIENT_SECRET"]
}


# adobe = { "ADOBE_CLIENT_ID": os.environ['ADOBE_CLIENT_ID'],
#             "ADOBE_CLIENT_SECRET": os.environ['ADOBE_CLIENT_SECRET']
#             }


class mainFunc():

    def __init__(self):
        self.current_path = os.getcwd()
        self.csv_generator = csvGeneratorFunc()  # Create an instance of csvGeneratorFunc
        self.adobeKeyUtils =  adobeKeyUtils()
        
     
        
    def extract_text_from_pdf_adobe(self, file_path, start_page, tender_number,tender_name):
        """
        Extracts text from a PDF file using Adobe Pdf Services.
        Args:
            file_path (str): The path of the file to be extracted.
        Returns:
            A list of extracted data in a structured format.
        """

        while True:
            try:
                audit_logger.info(f"===> {file_path}")
                credentials = Credentials.service_principal_credentials_builder(). \
                    with_client_id(adobe_cred['ADOBE_CLIENT_ID']). \
                    with_client_secret(adobe_cred['ADOBE_CLIENT_SECRET']). \
                    build()

                # Create client config instance with custom time-outs.
                client_config = ClientConfig.builder().with_connect_timeout(10000).with_read_timeout(40000).build()

                # Create an ExecutionContext using credentials and create a new operation instance.
                execution_context = ExecutionContext.create(credentials, client_config)
                extract_pdf_operation = ExtractPDFOperation.create_new()

                # Set operation input from a source file.
                source = FileRef.create_from_local_file(file_path)
                extract_pdf_operation.set_input(source)

                extract_pdf_options: ExtractPDFOptions = ExtractPDFOptions.builder() \
                    .with_elements_to_extract([ExtractElementType.TEXT, ExtractElementType.TABLES]) \
                    .with_element_to_extract_renditions(ExtractRenditionsElementType.TABLES) \
                    .with_table_structure_format(TableStructureType.CSV) \
                    .build()

                extract_pdf_operation.set_options(extract_pdf_options)
                # Execute the operation.
                result = extract_pdf_operation.execute(execution_context)
                file_name = databasecreator().generate_file_name()
                # Temporarily save in /tmp
                tmp_filepath = os.path.join("/tmp", file_name)
                result.save_as(tmp_filepath)
                folder_creation(os.path.join(self.current_path,
                                "/mnt/supporting_folders",f"{tender_name}_{tender_number}", "sample_doc"))
                final_filepath = os.path.join(
                    self.current_path, "/mnt/supporting_folders",f"{tender_name}_{tender_number}", "sample_doc", file_name)
                # Move the file to the desired location
                shutil.move(tmp_filepath, final_filepath)
                

                handle = zipfile.ZipFile(final_filepath)
                target = os.path.join(
                    self.current_path, "/mnt/supporting_folders",f"{tender_name}_{tender_number}", "sample_doc", file_name.split(".")[0])
                handle.extractall(target)
                filtered_data = self.unstructure_to_structure(
                    target, start_page)
                audit_logger.info(f"file name {file_path} for tender_number {tender_number} processed in adobe. moving to next")
                return filtered_data

            except Exception as e:
                exception_logger.exception(f'Error occurred while processing PDF file: {str(e)}')
                file_name = file_path.split("/")[-1]

                # Check for specific conditions
                if "Either quota for this operation is not available or Free Tier quota is exhausted" in str(e) or "statusCode=429" in str(e)  or "Exception in fetching access token" in str(e):
                    for i in range(3):
                        if i < 2:  # Check if the maximum number of retries (1) is reached
                            self.adobeKeyUtils.main(tender_number)  # Fetch next and try 2 keys and raise the exception
                        else:
                            raise

                            # audit_logger.info("2 Retries completed. Trying with a new key from the database.")
                            # self.adobeKeyUtils.main(tender_number)  # Stop the loop and re-raise the exception

                elif ("File not suitable for content extraction: File contents are too complex for content extraction" in str(e) or "BAD_PDF - Unable to extract content." in str(e)) and "statusCode=400" in str(e):
                    # Raise the custom exception when the condition is met
                    self.csv_generator.update_or_create_bad_files_dict(tender_number,file_name,str(e))
                    audit_logger.info(f"====> done with add bad file")

                    raise 

                    
                
                elif "statusCode=500" in str(e) or "errorCode=TIMEOUT" in str(e) or "Internal error: Processing timeout" in str(e):
                    
                    for i in range(5):
                        if i == 5:  # Check if the maximum number of retries (5) is reached
                            audit_logger.info("5 Retries completed. Trying with a new key from the database.")
                            self.adobeKeyUtils.main(tender_number)

                        else:
                            # Retry the operation (you can add some delay or sleep here if needed)
                            audit_logger.info(f"Retry {i+1} for the next key")
                            time.sleep(120)  # Sleep for 120 seconds between retries            
                        
                            
                else:
                    audit_logger.debug("Retrying for the next key")
                    # This block executes when the if and elif conditions are not met
                    self.adobeKeyUtils.main(tender_number)

    
   
     
    def split_pdf(self, file_path, file_name,tender_name,tender_number):
        """
        Split a PDF file into smaller files with a maximum number of pages.
        Args:
            file_path (str): Path of the PDF file to be split.
        Returns:
            A list of temporary PDF file names containing the split pages.
        """
    
        def __init__(self, *args, **kwargs):
           pass
        
        try:
            doc = fitz.open(file_path)

            # Get the total number of pages in the PDF file
            page_count = doc.page_count
            audit_logger.debug(f"Total number of pages in {file_name}: {page_count}")

            if page_count > 25:
                # Calculate the number of chunks required
                num_chunks = (page_count + 24) // 25
                audit_logger.info(f"Splitting into {num_chunks} chunks.")

                # Create a directory to store the split PDF files
                folder_creation(os.path.join(
                    self.current_path, "/mnt/supporting_folders",f"{tender_name}_{tender_number}", "splitted_pdf"))
                output_dir = os.path.join(
                    databasecreator().current_path, "/mnt/supporting_folders",f"{tender_name}_{tender_number}", "splitted_pdf")
                os.makedirs(output_dir, exist_ok=True)

                # Split the PDF into chunks
                split_files = []
                for i in range(num_chunks):
                    # Determine the page range for the current chunk
                    start_page = i * 25
                    end_page = min(start_page + 25, page_count)

                    # Create a new PDF document for the current chunk
                    chunk_doc = fitz.open()

                    # Copy pages from the original PDF document to the chunk document
                    chunk_doc.insert_pdf(
                        doc, from_page=start_page, to_page=end_page - 1)

                    # Generate a unique filename based on start and end page numbers
                    filename = f"chunk_{start_page + 1}_{end_page}.pdf"
                    folder_creation(os.path.join(output_dir, filename))
                    final_doc_name = os.path.join(output_dir, filename)

                    # Save the chunk document to a file
                    chunk_doc.save(final_doc_name)

                    # Close the chunk document
                    chunk_doc.close()

                    # Append the filename to the list of split files, along with page number.
                    # The tuple can be extracted for path and page number.
                    split_files.append((final_doc_name, start_page))

                audit_logger.debug("PDF splitting completed.")
                return split_files
            else:
                folder_creation(os.path.join(self.current_path, "/mnt/supporting_folders",f"{tender_name}_{tender_number}", "splitted_pdf"))
                final_doc_name = os.path.join(databasecreator().current_path, "/mnt/supporting_folders",f"{tender_name}_{tender_number}", "splitted_pdf", file_name + ".pdf")

                # Create a new PDF document using fitz library
                doc2 = fitz.open()

                # Copy pages from the original PDF document to the new PDF document
                doc2.insert_pdf(doc, from_page=0, to_page=page_count)

                # Save the new PDF document to a file
                doc2.save(final_doc_name)

                # Return both the path and initial page number i.e. 0.
                audit_logger.info(f"{file_name} has {page_count} pages. No need to split.")
                return [(final_doc_name, 0)]
            
        except Exception as e:
            exception_logger.error(f"Error splitting PDF file: {str(e)}")
            raise 

    
    def main(self, file_path, file_name, tender_number,tender_name):
        """
        Split a PDF file into smaller files, extract structured text from each file, and get the creation date.
        Args:
            file_path (str): Path of the PDF file to be processed.
        Returns:
            A dictionary containing the merged list of structured text, the creation date, and a flag indicating whether the
            date was found or not.
        """
        split_files = self.split_pdf(file_path, file_name,tender_name,tender_number)
        section_list = []

        try:
            for i, (file_path, start_page) in enumerate(split_files):
                audit_logger.debug(f"Processing split file: {file_path}, Start Page: {start_page}")
                sections = self.extract_text_from_pdf_adobe(file_path, start_page, tender_number,tender_name)
                section_list += sections

                # Log the processed split file and remove it from the list
                audit_logger.debug(f"Processed split file {i + 1}/{len(split_files)}: {file_path}, Start Page: {start_page}")

                # audit_logger.info(f"Remaining split files: {split_files}")

            # section_list += self.unstructure_to_structure('C:/dimensionless/TendorAutomationTool/thermaxExtraction/Dimensionless/sample_doc')
            return section_list

        except Exception as e:
            exception_logger.exception(f"Error processing PDF files: {str(e)}")
            raise e

    def unstructure_to_structure(self, file_path, start_page):
        f = open(file_path + '/structuredData.json', encoding='UTF8')
        data = json.load(f)
        datas = data["elements"]
        header = "start_para"
        sub_header = "subheader"
        # Add start_page to page of the header returned by adobe.
        page = start_page
        value = []
        paragraph = []
        for element in datas:
            # if '/Reference' in element["Path"] or '/Footnote' in element['Path']:
            if '/Footnote' in element['Path']:
                pass

            elif '/Title' in element['Path']:
                header = element['Text']
                # paragraph['Title'] = element['Text']
                page = int(start_page) + int(element['Page'])

            elif "/H1" in (element["Path"]) or "/H2" in (element["Path"]) and "/Figure" not in (element["Path"]) and '/Sub' not in (element["Path"]):
                if len(value) > 0:
                    # print(header + "_" + sub_header)
                    if sub_header == "subheader":
                        paragraph.append(
                            {header: "".join(value), 'page': page})
                    else:
                        temp = {
                            sub_header: "".join(value)
                        }
                        paragraph.append({header: temp, 'page': page})
                        # print(paragraph)
                    # paragraph[header + "_" + sub_header] = "".join(value)
                    value = []
                if "/H1" in (element["Path"]):
                    if "Text" in element:
                        header = str(element["Text"])
                        page = int(start_page) + int(element['Page'])

                    else:
                        header = "header"
                    sub_header = "subheader"
                if "/H2" in (element["Path"]):
                    if "Text" in element:
                        sub_header = str(element["Text"])
                        page = int(start_page) + int(element['Page'])
                    else:
                        sub_header = "subheader"

            elif "/Table" in (element["Path"]):
                # try:
                #     value.append(element['Text'])
                # except:
                #     pass
                try:
                    value.append(element['Text'])
                except:
                    pass
                # try:
                #     # Empty current value contents and append it to paragraph.
                #     if len(value) > 0:
                #         if sub_header == "subheader":
                #             paragraph.append({header : "".join(value), 'page': page})
                #         else:
                #             temp = { sub_header : "".join(value) }
                #             paragraph.append({header : temp, 'page': page })
                #         value=[]

                #     # Update page number of the table. Header and Subheader remains the same for table.
                #     page = int(start_page) + int(element['Page'])

                #     if 'filePaths' in element:
                #         for filePath in element['filePaths']:
                #             if '.csv' in filePath:
                #                 # Append each table's csv content as a new paragraph.
                #                 with open(file_path + "/" + filePath, 'rt', encoding='utf-8') as csvf:
                #                     csvReader = csv.reader(csvf, delimiter=',')
                #                     for rows in csvReader:
                #                         value.append(" ".join(rows))

                #                 # Append table data to paragraph.
                #                 if sub_header == "subheader":
                #                     paragraph.append({header : "".join(value), 'page': page})
                #                 else:
                #                     temp = { sub_header : "".join(value) }
                #                     paragraph.append({header : temp, 'page': page })
                #                 value=[]
                # except:
                #     pass

            elif "Text" in element or ("H" in (element["Path"]) and "Sub" in (element["Path"])):
                text_list = element["Text"].rstrip().split(" ")
                # print(element["Path"], element["Text"])
                # if "//Document/Table" not in (element["Path"]):
                if "/H" in (element["Path"]):
                    page = int(start_page) + int(element['Page'])
                    value.append(element['Text'])
                elif "/L" in (element["Path"]):
                    page = int(start_page) + int(element['Page'])
                    value.append(element["Text"])
                    # print(element["Path"], element["Text"])
                elif "/P" in element["Path"]:
                    page = int(start_page) + int(element['Page'])
                    value.append(element["Text"])

        if len(value) > 0:
            if sub_header == "subheader":
                paragraph.append({header: "".join(value), 'page': page})
            else:
                temp = {sub_header: "".join(value)}
                paragraph.append({header: temp, 'page': page})

            value = []

        return paragraph
