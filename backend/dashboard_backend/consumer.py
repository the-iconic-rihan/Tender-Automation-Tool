import asyncio
from channels.generic.websocket import AsyncWebsocketConsumer
import json
import os
import re
import datetime
from . import tasks
from datetime import datetime
from .logger import socket_logger

MONGODB_URI = os.environ['MONGODB_URI']

connection_time = datetime.now()


class FileUploadConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer for handling file uploads and communication with clients.
    """

    async def connect(self):
        """
        Establishes a WebSocket connection with the client and adds the consumer to a user group.
        """
        session_id = self.scope['session'].session_key
        new_username = re.sub(
            r"[^\w.-]", "_", self.scope.get("session", {}).get("username", "").split("@")[0])

        try:
            socket_logger.info("Socket connection established for session_id with username {} {} at: {}".format(
                session_id, new_username, connection_time))

            if session_id != None:

                user_group = f"{new_username}_{session_id}"
                await self.channel_layer.group_add(user_group, self.channel_name)
                socket_logger.info(
                    f"Consumer with username {new_username} added to {user_group} at {connection_time}")
                await self.accept()
                await self.send_message()

        except Exception as e:
            socket_logger.error("Error in establishing socket connection: session_id and username {} {} {} {}".format(
                session_id, new_username, str(e), connection_time))
            socket_logger.error(
                f'Session id is none please ask the user to resset the cookies {new_username}')
            await self.send(text_data=json.dumps({"message": f"Hello {new_username}!,Please reset your browser cookies!"}))
            await asyncio.sleep(10)

    async def send_message(self):
        """
        Sends a welcome message to the connected client.
        """
        session_id = self.scope['session'].session_key
        division = self.scope.get("session", {}).get("division")
        new_username = re.sub(
            r"[^\w.-]", "_", self.scope.get("session", {}).get("username", "").split("@")[0])

        try:

            await self.send(text_data=json.dumps({"message": f"Hello {new_username}!, welcome to the server!"}))
            await asyncio.sleep(10)
            # socket_logger.info(f"calling mongodb_change_stream {division}")   
            # await self.mongodb_change_stream(division)
            # await asyncio.sleep(5)

        except Exception as e:

            socket_logger.error("Error sending a message to session_id, username {}, {}: {} {}".format(
                session_id, new_username, str(e), connection_time.strftime("%Y-%m-%d %H:%M:%S")))

            await self.send(text_data=json.dumps("Error sending a message to username {}: {} {}".format(new_username, str(e), connection_time.strftime("%Y-%m-%d %H:%M:%S"))))
            await asyncio.sleep(5)

    async def disconnect(self, code):
        """
        Handles the disconnection of the WebSocket, removes the consumer from the user group, and closes the MongoDB client connection.
        """
        session_id = self.scope['session'].session_key
        new_username = re.sub(
            r"[^\w.-]", "_", self.scope.get("session", {}).get("username", "").split("@")[0])

        # username = self.scope.get("session", {}).get("username")
        # new_username = re.sub(r"[^\w.-]", "_", username.split("@")[0])
        try:
            # connection_time = self.connection_time
            socket_logger.info("Socket disconnected for session_id {} at: {}".format(
                session_id, connection_time))
            user_group = f"{new_username}_{session_id}"

            await self.channel_layer.group_discard(user_group, self.channel_name)
            await self.send(text_data=json.dumps("Consumer removed with session_id {} with username {} from {} at {}".format(session_id, new_username, user_group, connection_time)))
            # self.connected_users.remove(self)
            socket_logger.info("Consumer removed with session_id {} with username {} from {} at {}".format(
                session_id, new_username, user_group, connection_time))

        except Exception as e:

            socket_logger.error("Error in disconnecting the socket: session_id {} and username  {} {} {}".format(
                session_id, new_username, str(e), connection_time))
            await self.send(text_data=json.dumps("Error in disconnecting the socket: session_id {}  and username  {} {} {}".format(session_id, new_username, str(e), connection_time)))
            await asyncio.sleep(5)

        finally:
            # Close the MongoDB client connection
            socket_logger.info("Closed MongoDB client connection at: {}".format(
                connection_time.strftime("%Y-%m-%d %H:%M:%S")))

            await self.send(text_data=json.dumps("Closed MongoDB client connection at: {}".format(connection_time.strftime("%Y-%m-%d %H:%M:%S"))))
            await asyncio.sleep(5)

    async def receive(self, text_data):
        """
        Handles receiving messages from the client, such as uploaded file information, and triggers file processing tasks.
        """
        session_id = self.scope['session'].session_key
        new_username = re.sub(
            r"[^\w.-]", "_", self.scope.get("session", {}).get("username", "").split("@")[0])

        try:
            data = json.loads(text_data)

            await self.send(text_data=json.dumps({
                "message": f"Your files are uploaded {new_username} at {connection_time.strftime('%Y-%m-%d %H:%M:%S')}",
                "category_trigger": "Category and CSV will be triggered automatically once all files are uploaded."
            }))

            await asyncio.sleep(5)

            socket_logger.info("Received data for username {}: {} {}".format(
                new_username, data, connection_time.strftime("%Y-%m-%d %H:%M:%S")))

   



            # Set initial uploaded_file_queue
            uploaded_file_queue = data if isinstance(data, list) else [data]
            socket_logger.info(f"=====>{uploaded_file_queue}")

            # Check if uploaded_file_queue strictly matches the specific file_id format
            if all(isinstance(elem, dict) and len(elem) == 1 and 'file_id' in elem for elem in uploaded_file_queue):
                tasks.generate_csv.delay(uploaded_file_queue, session_id, new_username)
            else:
                # Proceed with other conditions since uploaded_file_queue does not match the specific file_id format
                for item in uploaded_file_queue:
                    if isinstance(item, dict) and "tender_number" in item:
                        if len(item) == 1:  # Only tender_number in the dictionary
                            tasks.generate_category_only.delay(session_id, new_username, item["tender_number"])
                            break  # Exit the loop as the task is already dispatched
                        elif "resume_processing" in item and item.get("resume_processing") is False:  # tender_number and resume_processing is False
                            tasks.fail_tender.delay(item, new_username, session_id)
                            break  # Exit the loop as the task is already dispatched

        except Exception as e:
            socket_logger.error(
                "Files weren't received :{} {}".format(new_username, str(e)))
            await self.send(text_data=json.dumps({
                "message": f"Files weren't received {new_username}. Since server was busy.",
                "Info": "Please re-upload your files."
            }))

    async def file_uploaded(self, event):
        """
        Handles messages sent to the group "user_{session_id}" and forwards them to the connected client.
        """

        message = event['message']
        await self.send(text_data=message)
        await asyncio.sleep(5)
