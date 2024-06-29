# # django_celery/__init__.py
# # from task import *

from .celery import app as celery_app

__all__ = ["celery_app"]