import os
from celery import Celery
from celery.signals import setup_logging  # noqa
# Set the default Django settings module for the 'celery' program.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

app = Celery('backend')

app.config_from_object('django.conf:settings', namespace='CELERY')
app.conf.broker_connection_retry_on_startup = True
# Load task modules from all registered Django apps.
app.autodiscover_tasks()
CELERY_EVENT_SERIALIZER = 'json'

# Enable task events permanently
CELERY_SEND_EVENTS = True
@setup_logging.connect
def config_loggers(*args, **kwargs):
    from logging.config import dictConfig  # noqa
    from django.conf import settings  # noqa

    dictConfig(settings.LOGGING)

@app.task(bind=True)
def debug_task(self):
    print(f'Request: {self.request!r}')