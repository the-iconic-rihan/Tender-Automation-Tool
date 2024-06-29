"""
Module providing the email connection configuration.
"""

from django.utils.html import strip_tags
import os,re
# from dotenv import load_dotenv
from email.message import EmailMessage
from django.core.mail import EmailMessage
from dashboard_backend.logger import audit_logger,exception_logger
import re


EMAIL = os.environ['EMAIL_HOST_USER']
RESET_URL = os.environ['RESET_URL']
ADOBE_EMAIL = os.environ['ADOBE_EMAIL']
DEVELOPER_EMAIL_ADOBE_KEY_EXPIRES = os.environ['DEVELOPER_EMAIL_ADOBE_KEY_EXPIRES']
CC_EMAIL = os.environ['CC_EMAIL']

def send_email(user_email, subject, email_body, cc=None):
    """
    Send an email with the specified subject, body, recipient email, and optional cc.

    Args:
        user_email (str): The email address of the recipient.
        subject (str): The subject of the email.
        email_body (str): The body content of the email.
        cc (str, optional): The CC email address.

    Returns:
        None
    """
    from_email = EMAIL
    recipient_list = [user_email]
    cc_list = [cc] if cc else None

    # Create an EmailMessage object

    email = EmailMessage(
        subject=subject,
        body=email_body,
        from_email=from_email,
        to=recipient_list,
        cc=cc_list
    )
   
    email.content_subtype = "html"  # Set the main content to be text/html
    email.send()

def send_password_reset_email(user_email, token, uid):
    """
    Send a password reset email to the user.

    Args:
        user_email (EmailStr): The email address of the user.
        token (str): The password reset token.
        background_tasks (BackgroundTasks): The background tasks instance to add the email sending task.

    Returns:
        None
    """
    email_body = f"""
        <html>
            <body>
                <h1>Password Reset Request</h1>
                <p>Hi,</p>
                <p>You recently requested to reset your password. Please click the button below to proceed:</p>
                <a href="{RESET_URL}/password/confirm/{uid}/{token}/" target="_blank" style="padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none;">Reset Password</a>
                <p>If you did not request a password reset, please ignore this email.</p>
            </body>
        </html>

        """
    send_email(
        user_email=user_email,
        subject="Password Reset",
        email_body=email_body,
    )


def send_user_register_email(username, user_email, temporary_password):
    """
    Send a user registration email with the temporary password.

    Args:
        user_email (EmailStr): The email address of the user.
        temporary_password (str): The temporary password generated for the user.
        background_tasks (BackgroundTasks): The background tasks instance to add the email sending task.

    Returns:
        None
    """
    email_body = f"""
                <html>
                <body>
                    <h1>Welcome, {username}!</h1>
                    <p>Your account has been created. Use the temporary password below for your first login:</p>
                    <p><strong>{temporary_password}</strong></p>
                    <p>For security, please reset your password upon login.</p>
                    <a href="{RESET_URL}" target="_blank" style="padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none;">Login Here</a>
                </body>
            </html>

    """
    
    send_email(
        user_email=user_email,
        subject="Set New Password",
        email_body=email_body,
        cc=CC_EMAIL
    )

def send_adobeKey_expiry_email(developer_email, DEVELOPER_EMAIL_ADOBE_KEY_EXPIRES, keys_left_count, total_keys):
    """
    Send a adobe key expire email to the developer.

    Args:
        developer_email (EmailStr): The email address of the developer_email.
        DEVELOPER_EMAIL_ADOBE_KEY_EXPIRES (str): The email address of the DEVELOPER_EMAIL_ADOBE_KEY_EXPIRES.
        keys_left_count (keys_left_count): no of keys lefts.
        total_keys : total keys left

    Returns:
        None
    """
    if keys_left_count <= 2:
        email_body = f"""
            <html>
                <body>
                    <h1>Adobe API Key Expiry Warning</h1>
                    <p>Dear Developer,</p>
                    <p>Attention: Only {keys_left_count} out of {total_keys} Adobe API keys remain. It is crucial to update your keys immediately to avoid service disruption.</p>
                    <p>Please address this matter urgently.</p>
                </body>
            </html>

            """
        send_email(
            user_email=developer_email,
            subject="Adobe Key Epires",
            email_body=email_body,
        )
        send_email(user_email=DEVELOPER_EMAIL_ADOBE_KEY_EXPIRES,
                   subject="Adobe Key Expires", email_body=email_body)
    elif keys_left_count <= 0:
        email_body = f"""
           <html>
                <body>
                    <h1>Adobe API Key Expiry Warning</h1>
                    <p>Dear Developer,</p>
                    <p>Attention: Only {keys_left_count} out of {total_keys} Adobe API keys remain. It is crucial to update your keys immediately to avoid service disruption.</p>
                    <p>Please address this matter urgently.</p>
                </body>
            </html>

            """
        send_email(
            user_email=developer_email,
            subject="Adobe Key Epires",
            email_body=email_body,
        )
        send_email(user_email=DEVELOPER_EMAIL_ADOBE_KEY_EXPIRES,subject="Adobe Key Expires", email_body=email_body)



class TenderEmailSender:
    def __init__(self, user_email, client, tender_metadata, tender_name, tender_number, uploaded_tender_metadata):
        self.user_email = user_email
        self.client = client
        self.tender_metadata = tender_metadata
        self.tender_name = tender_name
        self.tender_number = tender_number
        self.uploaded_tender_metadata = uploaded_tender_metadata
        # self.username = re.sub(r"[^\w.-]", "_", user_email.split("@")[0])
        self.username = user_email
        self.document = self.tender_metadata.find_one({"tender_number": self.tender_number, "tender_name":self.tender_name})
        self.uploaded_data = uploaded_tender_metadata.find_one({"tender_number": self.tender_number, "tender_name": self.tender_name})
        self.uploaded_time_and_date = self.uploaded_data.get("uploaded_date")

    def send_completion_email(self):
        
        
        try:
            
            completion_time_date = self.document.get("updated_date_and_time")
            email_subject = "Tender processing completed successfully"
            email_body = f"""
                <html>
                    <body>
                        <h1>Hello {self.username}!</h1>
                        <p>Your Tender {self.tender_name}, number {self.tender_number} has successfully completed category generation on: <strong>{completion_time_date}</strong> which was uploaded on <strong>{self.uploaded_time_and_date}</strong></p>
                    </body>
                </html>
            """
            self._send_email(email_subject, email_body)
        
        except Exception as e:
            exception_logger.error(f"Error sending completion email: {str(e)}")
            
            

    def send_failure_email(self,error_message):
        try:
            audit_logger.debug(f"=====> {error_message}")
            tender_status = self.document.get("tender_status")
            email_subject = "Tender processing has failed"
            email_body = f"""
                <!DOCTYPE html>
                <html>
                    <body style="font-family: Arial, sans-serif;">
                        <p>Dear {self.username},</p>
                        <p>We regret to inform you that your Tender '{self.tender_name}' (Tender Number: {self.tender_number}) has encountered an issue. Its status has been changed to <strong>"Failed"</strong>. The failure occurred due to: <strong>{error_message}</strong>. This tender was initially uploaded on {self.uploaded_time_and_date}.</p>
                        <p>We apologize for any inconvenience this may cause and are committed to resolving this matter promptly.</p>
                        <p>Regards,</p>
                        <p>Dimensionless Technical Team</p>
                    </body>
                </html>
            """

            self._send_email(email_subject, email_body)
        except Exception as e:
            exception_logger.error(f"Error sending failure email: {str(e)}")


    def send_pending_email(self,pending_message):
        try:
            email_subject = "Tender processing has changed to Pending"
            email_body = f"""
                <!DOCTYPE html>
                <html>
                    <body style="font-family: Arial, sans-serif;">
                        <p>Dear {self.username},</p>
                        <p>We regret to inform you that your Tender name '{self.tender_name}' and Tender Number: {self.tender_number} has encountered an issue. Its status has been changed to <strong>"Pending"</strong>. This occurred due to: <strong>{pending_message}</strong>. This tender was initially uploaded on {self.uploaded_time_and_date}.</p>
                        <p>We apologize for any inconvenience this may cause and are committed to resolving this matter promptly.</p>
                        <p>Regards,</p>
                        <p>Dimensionless Technical Team</p>
                    </body>
                </html>
            """

            self._send_email(email_subject, email_body)
        except Exception as e:
            exception_logger.error(f"Error sending failure email: {str(e)}")
            
            
    def send_processing_email(self):
        try:
            
            # failed_time_date = self.document.get("updated_date_and_time")
            email_subject = "Tender processing has started"
            email_body = f"""
                <html>
                    <body>
                        <h1>Hello {self.username}!</h1>
                        <p>Your Tender with tender name : {self.tender_name}, tender number :  {self.tender_number} has started  for <strong>"Processing"</strong>  which was uploaded on <strong>{self.uploaded_time_and_date}</strong></p>
                    </body>
                </html>
            """
            self._send_email(email_subject, email_body)
        except Exception as e:
            exception_logger.error(f"Error sending processing email: {str(e)}")

   
    def send_user_failure_email(self,error_message):
        try:
            audit_logger.debug(f"=====> {error_message}")
            tender_status = self.document.get("tender_status")
            email_subject = "Tender processing has failed"
            email_body = f"""
                <!DOCTYPE html>
                <html>
                    <body style="font-family: Arial, sans-serif;">
                        <p>Dear {self.username},</p>
                        <p>This is to inform you that your Tender name '{self.tender_name}' Tender Number: {self.tender_number} status has been changed to <strong>"Failed"</strong>. This is done by {self.username} : <strong>{error_message}</strong>. This tender was initially uploaded on {self.uploaded_time_and_date}.</p>
                        <p>We apologize for any inconvenience this may cause and we are committed to make you tenders more optimize.</p>
                        <p>Regards,</p>
                        <p>Dimensionless Technical Team</p>
                    </body>
                </html>
            """

            self._send_email(email_subject, email_body)
        except Exception as e:
            exception_logger.error(f"Error sending failure email: {str(e)}")
    

    def _send_email(self, subject, body):
        send_email(
            user_email=self.user_email,
            subject=subject,
            email_body=body,
        )
        audit_logger.success(f"Email sent to {self.user_email} for tender name : {self.tender_name} and tender number: {self.tender_number}")


    
