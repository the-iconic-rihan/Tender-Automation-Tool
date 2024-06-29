import csv
from datetime import datetime
# import json
import os
# import shutil
# import zipfile
# from dashboard_backend.utils.adobeKeyUtils import adobeKeyUtils
from ...logger import *
from django.core.files.storage import FileSystemStorage

def folder_creation(local_file_path):
    if not os.path.exists(local_file_path):
        os.makedirs(local_file_path)

class databasecreator():

    def __init__(self):
        self.current_path = os.getcwd()

    def generate_file_name(self, flag='zip'):
        current_time = datetime.now()
        time_in_format = current_time.strftime("%d-%m-%Y-%H-%M-%S-%f")
        if flag == 'zip':
            file_name = f"{time_in_format}.zip"
        elif flag == 'pdf':
            file_name = f"{time_in_format}.pdf"
        return file_name

    def creating_dictionary(self, structure_data):
        '''
        creating a dictionary with title, page and Text as key to save it in csv.
        '''
        dataset = []
        for i in structure_data:
            df = {}
            for key, values in i.items():
                if key == 'page':
                    df['page'] = values
                    continue
                if type(values) == dict:
                    df['title'] = key
                    for k2, v2 in values.items():
                        df['sub_title'] = k2
                        df['text'] = v2
                else:
                    df['title'] = key
                    df['sub_title'] = key
                    df['text'] = values

            try:
                dataset.append(df)


                
            except Exception as e:
                # Use the exception_logger to log any exceptions during dictionary creation
                exception_logger.error("Error creating dictionary.",extra={"exception_message": str(e)})
                raise ("Unable to create dictionary")
                # return ({"error": f"Unable to create dictionary."})
            
        # Use the transaction_logger to log successful dictionary creation
        transaction_logger.debug("Dictionary created successfully.")
        return dataset

    def split_text_onlimit(self, dataset):
        
        try:
            # Append each chunk as a new object.
            final_merged_data = []

            # Break the text into 'limit' words.
            limit = 1500
            for i in dataset:
                # Split the text into words/tokens.
                # 75 words is approx. 100 tokens.
                words = i['text'].split()
                for chunk_index in range(0, len(words), limit):
                    # Add title and sub_title to content to calculate embeddings.
                    content = i['title'] + ' ' + i['sub_title'] + ' ' + \
                        ' '.join(words[chunk_index: chunk_index + limit])
                    final_merged_data.append(
                        {'title': i['title'], 'sub_title': i['sub_title'], 'text': content, 'page': i['page']})

            # Use the transaction_logger to log successful text splitting
            transaction_logger.debug("Text split successfully.")
            return final_merged_data
        
        except Exception as e:
            # Use the exception_logger to log any exception
            exception_logger.exception("Error splitting text.",
                                extra={"exception_message": str(e)})
            raise e
                        
    def creating_dataset(self, dataset, filename,tender_name,tender_number):
        '''
        Saving the pdf data into csv.
        '''
        try:
            field_name = ['title', 'sub_title', 'text', 'page']
            folder_creation(os.path.join(self.current_path,
                            "/mnt/supporting_folders",f"{tender_name}_{tender_number}", "sample_dataset"))
            csv_path = os.path.join(
                self.current_path, "/mnt/supporting_folders",f"{tender_name}_{tender_number}", "sample_dataset", filename + ".csv")
            with open(csv_path, 'w', encoding='UTF-8') as csvfile:
                writer = csv.DictWriter(csvfile, fieldnames=field_name)
                writer.writeheader()
                writer.writerows(dataset)
                csvfile.close()

            # Use the transaction_logger to log successful dataset creation
            transaction_logger.debug("Dataset created successfully.")
            return csv_path

        except Exception as e:
            # Use the exception_logger to log any exceptions during dataset creation
            exception_logger.error("Unable to create dataset.", extra={"exception_message": str(e)})
            raise e
            return ({"error": "Unable to create dataset"})
           


    def saving_file_to_folder(self, file,tender_name,tender_number):
        try:
            folder_creation(os.path.join(self.current_path,
                            "/mnt/supporting_folders",f"{tender_name}_{tender_number}", "splitted_pdf"))
            folder = os.path.join(
                databasecreator().current_path, "/mnt/supporting_folders",f"{tender_name}_{tender_number}", "splitted_pdf")
            filenametimeframe = self.generate_file_name(flag='pdf')
            fs = FileSystemStorage(location=folder)
            filename = fs.save(filenametimeframe, file)
            file_url = fs.url(filename)
            file_path = folder + "/" + filenametimeframe
            return file_path

        except Exception as e:
            # Handle any exceptions that occur during the database operation
            exception_logger.error(f"Error saving file to folder: {str(e)}")
            return 0


