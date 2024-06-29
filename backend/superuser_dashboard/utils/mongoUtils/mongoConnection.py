from dashboard_backend.logger import exception_logger
import os
MONGODB_URI = os.environ['MONGODB_URI']
from pymongo import MongoClient

class MongoConnection():
    def __init__(self) -> None:
        pass

    def connect_to_mongodb(self):
        try:
            # Ensure MONGODB_URI is provided
            if not MONGODB_URI:
                exception_logger.error("MONGODB_URI is not defined in the environment.")
                raise Exception("MONGODB_URI is not defined in the environment.")

            client = MongoClient(MONGODB_URI)
            db = client["Metadata"]

            # Create or get collections
            collection = db.get_collection("tender_metadata")
            page_count = db.get_collection("tender_count_metadata")
            # keys = db.get_collection("keys")
            # The get_collection method will create the collection if it does not exist
            return client, collection, page_count, db

        except Exception as e:
            exception_logger.error(f"Failed to connect to MongoDB: {str(e)}")
            raise e

