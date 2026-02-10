from django.urls import path
from .views import MCQListView, MCQSubmitView, AssessmentResultView

urlpatterns = [
    path('mcqs/', MCQListView.as_view(), name="mcq-list"),
    path('mcqs/submit/', MCQSubmitView.as_view(), name="mcq-submit"),
    path('results/', AssessmentResultView.as_view(), name="assessment-results"),
    path('results/<int:result_id>/', AssessmentResultView.as_view())

]
