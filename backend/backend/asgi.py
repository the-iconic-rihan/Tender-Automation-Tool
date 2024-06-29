# """
# ASGI config for backend project.

# It exposes the ASGI callable as a module-level variable named ``application``.

# For more information on this file, see
# https://docs.djangoproject.com/en/3.2/howto/deployment/asgi/
# """

# import os

# # from django.core.asgi import get_asgi_application

# # os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

# # application = get_asgi_application()

# # import os
# # import django
# # from django.core.asgi import get_asgi_application
# # from django.urls import path, re_path
# # from channels.routing import ProtocolTypeRouter, URLRouter
# # import django_eventstream

# # os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

# # application = ProtocolTypeRouter({
# #     'http': URLRouter([
# #         path('events/', AuthMiddlewareStack(
# #             URLRouter(django_eventstream.routing.urlpatterns)
# #         ), { 'channels': ['test'] }),
# #         re_path(r'', get_asgi_application()),
# #     ]),
# # })
# import django
# from django.core.asgi import get_asgi_application
# from django.urls import path, re_path
# from channels.routing import ProtocolTypeRouter, URLRouter
# from channels.auth import AuthMiddlewareStack
# from django.core.asgi import get_asgi_application
# import django_eventstream

# os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

# application = ProtocolTypeRouter({
#     'http': URLRouter([
#         path('dashboard/poll/', URLRouter(django_eventstream.routing.urlpatterns)
#         , { 'channels': ['data'] }),
#         re_path(r'', get_asgi_application()),
#     ]),
# })

import os
from channels.auth import AuthMiddlewareStack
from django.core.asgi import get_asgi_application 
from channels.routing import ProtocolTypeRouter, URLRouter
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')

# from dashboard_backend.routing import websocket_urlpatterns
from dashboard_backend.routing import websocket_urlpatterns
from channels.security.websocket import AllowedHostsOriginValidator
application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": AllowedHostsOriginValidator(
        AuthMiddlewareStack(
            URLRouter(websocket_urlpatterns)
        )
    ),
})
