from django.urls import path
from .views import superuserDashboard,fetchAllDataTillToday,DivisionWiseTenderAndUserData,AverageTimeView
from django.urls import path, include


urlpatterns = [
    path('fetch-dashboard/', superuserDashboard.as_view()),
    path('fetch-todays-data/', fetchAllDataTillToday.as_view()),
    path('division-wise-tender-user-data/', DivisionWiseTenderAndUserData.as_view()),
    path('avg-time/', AverageTimeView.as_view()),
    ]