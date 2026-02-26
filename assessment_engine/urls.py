from django.urls import path
from .views import (
    MCQListView,
    SubmitAttemptView,
    AssessmentResultView,
    StartAssessmentView,
    SaveAnswerView,
    AssessmentStatusView,
    DomainListView,
    AttemptQuestionsView
)

urlpatterns = [
    # Domains
    path("domains/", DomainListView.as_view(), name="domain-list"),

    # Start or resume an attempt
    path("assessment/start/", StartAssessmentView.as_view(), name="start-assessment"),

    # Fetch all questions for an attempt, grouped by topic (section-wise)
    path("assessment/<int:attempt_id>/questions/", AttemptQuestionsView.as_view(), name="attempt-questions"),

    # Save individual answer immediately
    path("assessment/<int:attempt_id>/save-answer/", SaveAnswerView.as_view(), name="save-answer"),

    # Submit attempt and get results (topic-wise + roadmap)
    path("assessment/<int:attempt_id>/submit/", SubmitAttemptView.as_view(), name="submit-attempt"),

    # Get overall assessment result by result ID
    path("assessment/result/<int:result_id>/", AssessmentResultView.as_view(), name="assessment-result"),

    # Check if user has any active attempt
    path("assessment/status/", AssessmentStatusView.as_view(), name="assessment-status"),

    # Legacy/all MCQs (optional)
    path("mcqs/", MCQListView.as_view(), name="mcq-list"),
]