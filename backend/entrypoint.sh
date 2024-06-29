#!/bin/bash

# Collect static files
echo "Collect static files"
python3 manage.py collectstatic --no-input

# Start server
echo "Starting server"
# python3 manage.py runserver 0.0.0.0:8000
# gunicorn backend.wsgi:application --preload --workers=4 --timeout=1200 --graceful-timeout=10 --bind 0.0.0.0:8000
daphne backend.asgi:application --bind 0.0.0.0 --port 8000

exec "$@"