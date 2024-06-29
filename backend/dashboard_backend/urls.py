from django.urls import path
from .views import *
from django.urls import path, include
# import django_eventstream
# from .views import StreamDataView

urlpatterns = [
    path('add-metadata/', AddMetadata.as_view()),
    path('fetch-metadata/', fetch_metadata.as_view()),
    path('save-file/', FileUploadView.as_view()),
    path('list-tender/', ListTender.as_view()),
    path('search-tender/', SearchTender.as_view()),
    path("cummulative-wise-download-view/", CummulativeWiseDownloadView.as_view()),
    path("download-xlsx-parameter/", ParameterWiseXlsxDownloadView.as_view()),
    path("merge-docx-view/", MergeDocxView.as_view()),
    path('category-generator/', categories_api.as_view()),
    path('category-data/', FetchCategoryWiseData.as_view()),
    path('delete-file/', DeleteFileView.as_view()),
    path('download-category/', CategoryWiseDownloadView.as_view()),
    path('download-parameter/', ParameterWiseDownloadView.as_view()),
    path("single-file-upload/", SingleFileUpload.as_view()),
    path("delete_tender/", DeleteTender.as_view()),
    path("page-count/", fetchTotalCount.as_view()),
    path('download-uploaded-files/', UploadedFileDownloadView.as_view()),
    path("tender-fail/", TenderFail.as_view())

    
]
