from authentication.models import Division, User
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .utils.mongoUtils.mongoConnection import MongoConnection 
from dashboard_backend.logger import audit_logger, exception_logger
from datetime import datetime
from bson import ObjectId
from collections import defaultdict
import json
from authentication.serializers import UserSerializer
from datetime import datetime,timedelta
from dateutil import parser

class CustomEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, ObjectId):
            return str(o)
        return super().default(o)



class fetchAllDataTillToday(APIView):
    # ... (other class methods and attributes)

   
    def post(self, request):
        """
        Handle POST request to fetch data.

        Args:
            request: The Django request object containing request data.

        Returns:
            Response: A Django Response object with aggregated data or an error message.
        """
        # Extract 'from' and 'to' dates from request payload or use today's date
        from_date = request.data.get('from', datetime.now().strftime("%Y-%m-%d"))
        to_date = request.data.get('to', datetime.now().strftime("%Y-%m-%d"))

        try:
            # Connect to MongoDB
            _, collection, _, db = MongoConnection().connect_to_mongodb()
            user_activities_db = db['user_activities_metadata']
            filters = {"login_date": {"$gte": from_date, "$lte": to_date}}
            user_activity_data = list(user_activities_db.find(filters))
            # audit_logger.info(f"====> {user_activity_data}")
            users_login_data = {
                "thermax_users_count": 0,
                'logged_in_users': []  # Initialize as a list
            }
            
            # users_login_data['logged_in_users'].append(user_data)

            for user in user_activity_data:
                if "gmail.com" in user["username"]:
                    users_login_data["thermax_users_count"] += 1
                    username = user["username"]
                    divisions_info = user["divisions"]

                    # Check if the user is already present in user_data
                    existing_user = next(
                        (u for u in users_login_data['logged_in_users'] if u['username'] == username), None)

                    if existing_user:
                        # If user is already present, update divisions if not already present
                        existing_user_divisions = existing_user['divisions_and_count']
                        for division_info in divisions_info:
                            division_name = division_info["name"]
                            if division_name not in existing_user_divisions:
                                existing_user_divisions.append(division_name)
                    else:
                        # If user is not present, add a new entry to user_data
                        user_data = {
                            "username": username,
                            "divisions_and_count": [division_info["name"] for division_info in divisions_info]
                        }
                        users_login_data['logged_in_users'].append(user_data)

            transformed_response = {
                "users": users_login_data
            }
            users_data_for_count = list(collection.find({"uploaded_date": {"$gte": from_date, "$lte": to_date}}))
            users_dict = {"user_count": 0, "user_dict": {}}
            counted_users = set()  # Set to keep track of counted users

            for user_data in users_data_for_count:
                username = user_data["uploaded_by"]
                division = user_data["division"]

                # If the username is not in the dictionary, initialize it with an empty list
                if username not in users_dict["user_dict"]:
                    users_dict["user_dict"][username] = {"username": username, "division": []}

                    # If this is a new user, increment the user count and add to counted_users
                    if username not in counted_users:
                        users_dict["user_count"] += 1
                        counted_users.add(username)  # Add the user to the set of counted users

                # Add the division to the list if it's not already present
                if division not in users_dict["user_dict"][username]["division"]:
                    users_dict["user_dict"][username]["division"].append(division)

            # Optionally, sort the users by username (or any other criteria you prefer)
            users_dict["user_dict"] = dict(sorted(users_dict["user_dict"].items()))
            pipeline = [
                {"$match": {"uploaded_date": {"$gte": from_date, "$lte": to_date},
                            "tender_status":"Succeeded"
                            }},
                {"$group": {
                    "_id": "$division",
                    "total_pages_processed_within_range": {"$sum": "$total_count"},
                    "total_tenders_processed_within_range": {"$sum": 1}
                }}
            ]

            result = collection.aggregate(pipeline)
            divisions_result = list(result)

            # Check if data exists for the given date range
            if not divisions_result and not users_login_data:
                message = f"No data between {from_date} and {to_date}."
                audit_logger.info(f"{message}")
                # Return response with message and user data
                return Response({"message": message,
                                    "user_total": users_login_data},
                                status=status.HTTP_404_NOT_FOUND)
            audit_logger.info(f"Data fetched for the date range: {from_date} to {to_date}")

            # Calculate sum of total_pages_processed_within_range and total_tenders_processed_within_range
            total_pages_processed = sum(entry['total_pages_processed_within_range'] for entry in divisions_result)
            total_tenders_processed = sum(entry['total_tenders_processed_within_range'] for entry in divisions_result)

            # Return successful response with aggregated data
            return Response({
                "from_date": from_date,
                "to_date": to_date,
                "total_tenders_and_pages_processed_division_wise": divisions_result,
                # "users": transformed_response["users"],
                "user_data_dict":users_dict,
                # "user_total": users_login_data,
                "total_pages_processed": total_pages_processed,
                "total_tenders_processed": total_tenders_processed,
            }, status=status.HTTP_200_OK)

        except Exception as e:
            # Log and handle exceptions
            exception_logger.error(f"Error processing the request: {str(e)}")
            return Response({"error": f"Error processing the request: {str(e)}"},
                            status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class superuserDashboard(APIView):
        
        """
        API view for providing a dashboard view to superusers. It includes details about user activities, 
        page counts, and tender data based on user-selected date and division. This view handles POST requests.
        """

        def post(self, request):
            """
            Handle POST request to fetch dashboard data for superusers.

            Args:
                request: The Django request object containing request data.

            Returns:
                Response: A Django Response object with dashboard data or an error message.
            """
            
            # Extract optional parameters from the request payload
            division = request.data.get("division", "")
            username = request.data.get("username", "")
            from_date = request.data.get('from_date', datetime.now().strftime("%Y-%m-%d"))
            to_date = request.data.get('to_date', datetime.now().strftime("%Y-%m-%d"))
            
            # Convert "all" to empty string if provided in the payload
            division = "" if division.lower() == "all" else division
            username = "" if username.lower() == "all" else username

            try:
                # Connect to MongoDB and retrieve necessary collections
                client, collection, pages_count, db = MongoConnection().connect_to_mongodb()

            
                filters = {"uploaded_date": {"$gte": from_date, "$lte": to_date}}
                if division:
                    filters.update({"divisions.name": division, "division": division})

                if username:
                    filters["username"] = username
                    filters.update({"uploaded_by": username})

                audit_logger.info(f"division: {division}, username: {username} to_date {to_date} from_date {from_date}")

                user_activities = db["user_activities_metadata"]
                tender_status_count = defaultdict(int)
                user_data = defaultdict(list)
                tender_metadata_filters= {}
                user_activities_filter = {}
                if division:
                    user_activities_filter["divisions.name"] = division
                    tender_metadata_filters['division'] = division

                if username:
                    user_activities_filter["username"] = username
                    tender_metadata_filters['uploaded_by'] = username

                if "uploaded_date" in filters:
                    user_activities_filter["login_date"] = filters["uploaded_date"]
                    tender_metadata_filters["uploaded_date"] = filters["uploaded_date"]

                # audit_logger.info(f"===> user_activities_filter  {user_activities_filter}")
                user_activity_data_db = list(user_activities.find(user_activities_filter))
                

                # audit_logger.info(f"=====> tender_metadata_filters: {tender_metadata_filters}")
                tender_data_db = list(collection.find(tender_metadata_filters))
                # audit_logger.info(f"====> {tender_data_db}")
                uploaded_by_counts = defaultdict(int)

                for tender in tender_data_db:
                    tender["_id"] = str(tender["_id"])
                    uploaded_by = tender.get("uploaded_by")
                    uploaded_by_counts[uploaded_by] += 1

                    info = {
                        "uploaded_by": uploaded_by,
                        "tender_name": tender.get("tender_name"),
                        "tender_number": tender.get("tender_number"),
                        "sr_no": tender.get("sr_no"),
                        "tender_status": tender.get("tender_status"),
                        "division": tender.get("division"),
                        "uploaded_date":tender.get("uploaded_date"),
                        "total_pages_processed": tender.get("total_count", 0),
                    }

                    user_data[tender.get("division")].append(info)
                    tender_status_count[tender.get("tender_status")] += 1

                # tenders_per_users = [{"uploaded_by": key, "total_tender_processed": value} for key, value in uploaded_by_counts.items()]
                # user_data["tenders_per_users"] = tenders_per_users

                result = [{"_id": str(user_activity["_id"]), **user_activity} for user_activity in user_activity_data_db]
                users_activity_data = {"total_documents": len(result)}

                audit_logger.info(f"data retrieved: {users_activity_data['total_documents']} documents")
                
                # if users_data['total_documents'] == 0:
                    # return Response({"error": f"No data found for the given filters."},status=status.HTTP_404_NOT_FOUND)

                return Response({
                    # "user_activity_data_db": json.loads(json.dumps(result, cls=CustomEncoder)),
                    "user_data": dict(user_data),
                    "tender_status_count": dict(tender_status_count)
                }, status=status.HTTP_200_OK)

            except Exception as e:
                exception_logger.error(f"Error processing the request: {str(e)}")
                return Response({"error": f"Error processing the request: {str(e)}"},
                                status=status.HTTP_500_INTERNAL_SERVER_ERROR)



class AverageTimeView(APIView):
    def get(self, request):
        try:
            audit_logger.debug("Starting GET request processing.")
            _, collection, _, db = MongoConnection().connect_to_mongodb()
            uploaded_tender_metadata = db["uploaded_tender_metadata"]

            audit_logger.debug("Fetching data from database.")
            queryset = self.fetch_data(uploaded_tender_metadata)
            audit_logger.debug(f"Fetched {len(queryset)} documents.")

            audit_logger.debug("Processing data.")
            grouped_times = self.process_data(queryset, collection)

            audit_logger.debug("Formatting response.")
            response_data = self.format_response(grouped_times)

            audit_logger.debug("Sending successful response.")
            return Response(response_data, status=status.HTTP_200_OK)

        except Exception as e:
            audit_logger.error(f"Error processing the request: {str(e)}")
            return Response({"error": f"Error processing the request: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def fetch_data(self, uploaded_tender_metadata):
        return list(uploaded_tender_metadata.find({
            "file_upload_status": "File Uploaded",
            "tender_status": "Succeeded"
        }))

    def process_data(self, queryset, collection):
        grouped_times = {
            "0-250": {'total_time': 0, 'document_count': 0},
            "250-500": {'total_time': 0, 'document_count': 0},
            "500-750": {'total_time': 0, 'document_count': 0},
            "750-1000": {'total_time': 0, 'document_count': 0},
            "1000 and above": {'total_time': 0, 'document_count': 0}
        }
        processed_documents = set()

        for document in queryset:
            tender_number = document["tender_number"]
            if tender_number in processed_documents:
                continue

            if not self.is_valid_date(document, 'uploaded_date'):
                continue

            related_documents = collection.find_one({
                "tender_number": tender_number,
                "file_upload_status": "File Uploaded",
                "tender_status": "Succeeded"
            })

            if not related_documents or not self.is_valid_date(related_documents, 'updated_date_and_time'):
                continue

            uploaded_date = document['uploaded_date']
            updated_date_and_time = related_documents['updated_date_and_time']
            
            self.calculate_time_difference(
                uploaded_date, updated_date_and_time, related_documents['num_pages'], grouped_times
            )
            processed_documents.add(tender_number)

        return grouped_times

    def is_valid_date(self, document, key):
        date = document.get(key)
        if not isinstance(date, datetime):
            audit_logger.warning(f"Document skipped due to invalid {key}: {document}")
            return False
        return True

    def calculate_time_difference(self, uploaded_date, updated_date_and_time, num_pages, grouped_times):
        time_difference = updated_date_and_time - uploaded_date
        time_difference_hours = time_difference.total_seconds() / 3600
        self.update_grouped_times(grouped_times, num_pages, time_difference_hours)

    def update_grouped_times(self, grouped_times, num_pages, time_difference_hours):
        group = self.determine_group(num_pages)
        grouped_times[group]['total_time'] += time_difference_hours
        grouped_times[group]['document_count'] += 1

    def determine_group(self, num_pages):
        if num_pages <= 250:
            return "0-250"
        elif num_pages <= 500:
            return "250-500"
        elif num_pages <= 750:
            return "500-750"
        elif num_pages <= 1000:
            return "750-1000"
        else:
            return "1000 and above"

    def format_response(self, grouped_times):
        response_data = []
        for group_name, data in grouped_times.items():
            average_time = (data['total_time'] / data['document_count']) if data['document_count'] > 0 else 0
            response_data.append({
                "group_name": group_name,
                "average_time": average_time,
                "total_tender_per_group": data['document_count']
            })
        return response_data
# irrelevent for now dont use it
# API FOR division wise tenders and pages  dashboard
class DivisionWiseTenderAndUserData(APIView):
    """
    API view to fetch division-wise tender data and user information from MongoDB.
    This view handles POST requests, taking an optional 'division' parameter.
    If 'division' is provided, the data is filtered for that division; otherwise,
    data for all divisions is returned. The response includes page count details,
    total count of tenders, and a sum of a specific field across tenders.
    """

    def __init__(self, *args, **kwargs):
        """ Initialize the APIView instance. """
        super().__init__(*args, **kwargs)
    
    def post(self, request):
        """
        Handle POST request to fetch and return division-wise tender data.

        Args:
            request: The request object containing request data.
                     'division' parameter can be included in the POST data for filtering.

        Returns:
            Response: A Response object containing the requested data or an error message.
        """
        division = request.POST.get("division")
        try:
            # Establish connection to MongoDB and retrieve necessary collections
            client, collection, tender_count, db = MongoConnection().connect_to_mongodb()

            # Filter criteria for MongoDB queries based on provided division
            filter_criteria = {"division": division} if division else {}

            # MongoDB aggregation to sum 'total_count' and count documents
            aggregation_pipeline = [
                {"$match": filter_criteria},
                {"$group": {
                    "_id": None,
                    "total_count_sum": {"$sum": "$total_count"},
                    "total_tender_count": {"$sum": 1}  # Counts the number of tenders/documents
                }}
            ]
            total_count_sum_result = list(tender_count.aggregate(aggregation_pipeline))

            # Extract results from aggregation
            if total_count_sum_result:
                total_count_sum = total_count_sum_result[0]['total_count_sum']
                total_tender_count = total_count_sum_result[0]['total_tender_count']
            else:
                total_count_sum = 0
                total_tender_count = 0

            # Retrieve page count information with the applied filter
            pageCountDivisionWise = list(tender_count.find(filter_criteria))
            # Convert MongoDB ObjectId to string for JSON serialization
            for pages in pageCountDivisionWise:
                pages["_id"] = str(pages["_id"])

            audit_logger.info("Data fetched for division: " + str(division))
            return Response({
                "pageCountDivisionWise": pageCountDivisionWise,
                "total_tender_count": total_tender_count,
                "totalPagesCount": total_count_sum
            }, status=status.HTTP_200_OK)

        except Exception as e:
            # Log and handle exceptions during data fetching
            exception_logger.error(f"Error occurred while fetching data: {str(e)}")
            return Response({"message": "Error fetching data, try again later."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        


