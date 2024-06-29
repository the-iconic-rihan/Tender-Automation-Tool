import copy
from datetime import datetime
import time
import numpy as np
from dashboard_backend.utils.adobeKeyUtils import adobeKeyUtils
import openai
import os
import tenacity
import openai.error
from openai.embeddings_utils import cosine_similarity, get_embedding
import tiktoken
from ..logger import *
from pymongo import MongoClient
import os
from docx import Document
MONGODB_URI = os.environ['MONGODB_URI']
openai_key = os.environ['openai_key']
container_name = os.environ['container_name']


class category_add_func():

    def __init__(self):
        openai.api_key = openai_key
        self.current_path = os.getcwd()
        # self.openai_api_call_count = 0  # Initialize the call count to 0

    # def log_openai_api_call_count(self):
    #     audit_logger.info(f"Total OpenAI API calls made: {self.openai_api_call_count}")

    # Modify the function to include exception handling and retries for RateLimitError
    def get_embedding_with_retry(self, text, engine):
        @tenacity.retry(
            retry=tenacity.retry_if_exception_type(
                openai.error.RateLimitError),
            # Adjust the delay as needed (e.g., 2 seconds)
            wait=tenacity.wait_fixed(2),
            # Adjust the number of retries as needed
            stop=tenacity.stop_after_attempt(5),
        )
        def get_embedding(text, engine):
            # self.openai_api_call_count += 1
            return openai.Embedding.create(input=[text], engine=engine)["data"][0]["embedding"]

        try:
            # Get the embedding using the tenacity-retried function
            return get_embedding(text, engine)
        except openai.error.RateLimitError as e:
            # Handle the RateLimitError exception here
            # logger.info("Rate limit exceeded. Waiting before retrying...")
            exception_logger.error(
                "Rate limit exceeded. Waiting before retrying...")
            raise e  # Re-raise the exception to propagate it to the caller

    # similarity_filter performs vector search and returns the ranked order of
    # results.

    def similarity_filter(self, df, question, threshold):
        
        if df.empty or 'embedding' not in df.columns:
            
            return {"error":"Since only bad PDF was uploaded, and therefore no embeddings were generated, you can proceed with category generation. Please contact the technical team for further assistance."}


        # Get the embedding of the question using a specific engine
        try:
            product_embedding = get_embedding(
                question,
                engine="text-embedding-ada-002"
            )
        except openai.error.RateLimitError as e:
            # Handle the RateLimitError exception here if neededsssssss
            exception_logger.error(f"Error in embedding generation {str(e)}")

            raise e  # Re-raise the exception to propagate it to the caller
            return ({"error": f"Error in embedding generation {str(e)}"})

        except Exception as e:
            exception_logger.error(
                f"Error during embedding prompt embedding generation {str(e)}")
            raise e
            # return ({"error":"prompt embedding generation can't be generated"})
        # audit_logger.info("successfully here")
        try:
            # Convert the "embedding" column in the DataFrame to arrays
            df["embedding"] = df.embedding.apply(eval).apply(np.array)
            # audit_logger.info("successfully here 1")

            # Calculate the cosine similarity between each embedding and the product embedding
            df["similarity"] = df.embedding.apply(
                lambda x: cosine_similarity(x, product_embedding))


            # Sort the DataFrame based on the similarity in descending order
            df = df.sort_values("similarity", ascending=False)
            df = df[df['similarity'] > threshold]


            text_list = []
            # Iterate through the top two rows in the sorted DataFrame
            for i in range(len(df)):
                # Get the text from the 'Text' column of the current row try:
                text = str(df.iloc[i, df.columns.get_loc('text')])
                page = str(df.iloc[i, df.columns.get_loc('page')])
                filename = str(df.iloc[i, df.columns.get_loc('filename')])
                tender_file_path = str(
                    df.iloc[i, df.columns.get_loc('tender_file_path')])
                title = str(df.iloc[i, df.columns.get_loc('title')])
                extension = str(df.iloc[i, df.columns.get_loc('extension')])
                sub_title = str(df.iloc[i, df.columns.get_loc('sub_title')])
                embedding = df.iloc[i, df.columns.get_loc('embedding')]
                similarity = str(df.iloc[i, df.columns.get_loc('similarity')])
                # audit_logger.info("successfully here loop")

                text_list.append({
                    'title': title,
                    'embedding': embedding.tolist(),
                    'similarity': similarity,
                    'sub_title': sub_title,
                    'text': text,
                    'extension': extension,
                    'page': page,
                    'tender_file_path': tender_file_path, 'filename': filename
                })

            # audit_logger.info("successfully here 9")
            # audit_logger.info(text_list)

            return text_list
        
        except Exception as e:
            exception_logger.exception(f'error in generating similarity {str(e)}')
            raise e 

    def convert_markdown_gpt(self, text):

        for i in range(5):
            try:
                gpt_output = openai.ChatCompletion.create(
                    model='gpt-3.5-turbo-16k',
                    temperature=0,
                    messages=[
                        {"role": "system", "content": "markdown language code"},
                        {"role": "user", "content": "Convert the output text to markdown language format with each paragraph or point starting on a new line. Identify headings and make them bold, with related text in normal font. Combine and place multiple sources at the end, formatting them as bold and italic."+"\n\n"+text}
                    ],
                )["choices"][0]["message"]["content"]

                return gpt_output

            except Exception as e:
                audit_logger.info(f"error in gpt  {str(e)}")
                time.sleep(60)
                continue
    

    def fix_markdown_table(self,markdown_text):
    # Split the text into lines
        lines = markdown_text.split('\n')

        fixed_lines = []
        in_table = False
        table_lines = []

        def fix_single_table(table_lines):
            # Check if there are at least two lines (header and one data row) in the table part
            if len(table_lines) < 2:
                return table_lines

            # Process each line in the table part to ensure uniform format
            table_lines = ['|' + line.strip() + '|' if not (line.startswith('|') and line.endswith('|')) else line.strip() for line in table_lines]

            # Split the header line into columns to count the number of columns
            columns = table_lines[0].split('|')[1:-1]  # Exclude the first and last empty elements
            num_columns = len(columns)

            # Create the header separator row
            separator = '|'.join(['---'] * num_columns)
            separator = '|' + separator + '|'

            # Insert the separator row after the header in the table part
            table_lines.insert(1, separator)

            return table_lines

        for line in lines:
            if '|' in line:
                in_table = True
                table_lines.append(line)
            else:
                if in_table:
                    fixed_lines.extend(fix_single_table(table_lines))
                    table_lines = []
                    in_table = False
                fixed_lines.append(line)

        # Check if the last part of the text was a table
        if in_table:
            fixed_lines.extend(fix_single_table(table_lines))

        return '\n'.join(fixed_lines)
    # summarized_gpt takes in df, summarization & gpt prompts. it performs local
    # vector search and sends 15k most relevant tokens to GPT along with gpt_prompt
    # and returns the response along with the text that was sent to GPT.

    def summarized_gpt(self, df, summarization_prompt, gpt_prompt):

        meta_prompt = """extract the information with following guidelines:1. Extract specific information related to water treatment plant only.
        2. Provide concise and factual responses only based on the text delimited by triple quotes.
        3. Represent the response in pointwise with numbering. 4. If no relevant information is present, please response with 'NA' only.
        5. Include additional information found in the text as bullet points.
        6. Mention the source section/title along with page number and filename if available and mention at end of the response.
        7. If the response is NA then return source as NA .
        8. Fetch the specifications for an item/equipment if and only if it is included in the bidder's scope of supply."""
        
        try:
            enc = tiktoken.get_encoding("cl100k_base")

            threshold = 0.70
            data = copy.deepcopy(df)

            filtered = self.similarity_filter(
                data, summarization_prompt, threshold)
            # audit_logger/.info(f"Type of flitered ====> {filtered}")
            filtered = [{'title': entry['title'],
                         'sub_title': entry['sub_title'],
                         'text': entry['text'],
                         'page': entry['page'],
                         'filename': entry['filename']}
                        for entry in filtered]

            
            filtered_text = list(map(
                lambda x: (
                    x['text'] + '\nSource: filename ' + x['filename']
                    + ("" if x['title'] ==
                       'title' else ", Title " + x['title'])
                    + ("" if x['sub_title'] ==
                       'subtitle' else ", Sub Title " + x['sub_title'])
                    + ', page no. ' + str(int(x['page']) + 1) if x['page'].isdigit() else x['page']), filtered))
            
            # audit_logger.info(f"Type of flitered ====> {filtered_text}")
            length = 0
            num_tokens = 0
            result_text = ""

            while True:
                # Exit loop if we've checked all items or if the list is empty
                if length == len(filtered_text) or len(filtered_text) == 0:
                    break

                # Calculate the number of tokens if we add the next item
                next_text = filtered_text[length]
                temp_num_tokens = len(enc.encode(result_text + " " + next_text))

                # If adding the next item doesn't exceed the limit, add it
                if temp_num_tokens <= 17000:
                    num_tokens = temp_num_tokens
                    result_text += " " + next_text
                    length += 1
                else:
                    break
            prompt_messages = [
                {"role": "system", "content": meta_prompt},
                {"role": "user", "content":'"""' + result_text + '"""' +
                    " \n\nQuestion:"+gpt_prompt},
            ]
            # audit_logger.info(f"prompt ----====> {prompt_messages}")
            # audit_logger.info(f"gpt ===> {prompt_messages}")
            for i in range(5):
                try:
                    gpt_output = openai.ChatCompletion.create(
                        model='gpt-4-1106-preview',
                        # model='gpt-3.5-turbo-16k',
                        temperature=0,
                        messages=prompt_messages,
                        max_tokens=4000,
                    )["choices"][0]["message"]["content"]
                    gpt_output_converted = gpt_output
                    if gpt_output == "NA":
                        gpt_output_converted = gpt_output
                    elif "|" in gpt_output:
                        gpt_output_converted = gpt_output.replace("*","")
                        gpt_output_converted = gpt_output_converted.replace("`","")
                        gpt_output_converted = self.fix_markdown_table(gpt_output_converted)
                    else:
                        gpt_output_converted = self.convert_markdown_gpt(gpt_output)
                    
                    
                    return {
                        'gpt_output': gpt_output_converted,
                        'gpt_output_gpt4': gpt_output,
                        'filtered': filtered[0:length]
                    }

                except Exception as e:
                    exception_logger.debug(f"error in gpt {str(e)}")
                    time.sleep(180)
                    continue
                    # else:
                    #     raise e
        except Exception as e:
            # Handle any exceptions that occur during the database operation
            exception_logger.error(f"Error No embedding fetched: {str(e)}")
            raise e
            # return ({"error":f"Error No embedding fetched in summarized_gpt: {str(e)}"})
            # return 0

    def saving_docx_to_blob(self, blob_service_client, blob_path, doc_file):
        max_retries = 20
        for attempt in range(max_retries):

            try:
                container_client = blob_service_client.get_container_client(
                    container_name)

                # Upload the file to blob storage
                with open(doc_file, "rb") as file:
                    blob_client = container_client.get_blob_client(
                        blob=blob_path)
                    blob_client.upload_blob(file, overwrite=True)

                # Return the actual blob path
                transaction_logger.info(f"File '{doc_file}' uploaded to Blob storage successfully.")
                return blob_client.url

            except Exception as e:
                exception_logger.error(f"Error saving file to blob storage (Attempt {attempt + 1}/{max_retries}): {str(e)}")
                # Wait for 10 seconds before retrying
                time.sleep(60)
                attempt += 1
                if attempt > 20:
                    raise e

    def update_file_processing_status(self, tender_name, tender_number, uploaded_by, file_processing_status='Succeeded'):
        try:
            # Connect to the MongoDB server
            client = MongoClient(MONGODB_URI)

            # Access a specific database
            db = client["Metadata"]

            # Access a specific collection within
            collection = db["uploaded_tender_metadata"]

            collection.update_many({'tender_name': tender_name, 'tender_number': tender_number}, {"$set": {
                                   'updated_on': datetime.now(), 'updated_by': uploaded_by, 'file_processing_status': file_processing_status}})

        except Exception as e:
            exception_logger.error(
                f"Error creating dictionary ,exception_message: {str(e)}")

    def folder_creation(self, local_file_path):
        if not os.path.exists(local_file_path):
            os.makedirs(local_file_path)

    def merge_documents(self, category_list, tender_name, cur_datetime, tender_number):

        self.folder_creation(os.path.join(os.getcwd(), "/mnt/supporting_folders", f"{tender_name}_{tender_number}", "general_docx"))
        # audit_logger.info(f"====>{merge_docx_file_name} created")
        merge_docx_file_name = (
            "general_docx" + "-" + cur_datetime.isoformat() +
            ".docx"
        )
        search_directory = (os.path.join(os.getcwd(), "/mnt/supporting_folders", f"{tender_name}_{tender_number}", "docx_file"))
        # audit_logger.info(f"====>{merge_docx_file_name} created")

        merged_docx_path = os.path.join(
            self.current_path, "/mnt/supporting_folders", f"{tender_name}_{tender_number}", "general_docx", merge_docx_file_name)
        master_document = Document()
        audit_logger.info("Merging subcategory started")

        for keyword in category_list:
            # audit_logger.info(f"====> {keyword}")
            for filename in os.listdir(search_directory):
                file_path = os.path.join(search_directory, filename)
                if keyword in filename and filename.endswith('.docx') and os.path.exists(file_path):
                    doc = Document(file_path)
                    for element in doc.element.body:
                        master_document.element.body.append(element)
        master_document.save(merged_docx_path)
        return merged_docx_path, merge_docx_file_name
