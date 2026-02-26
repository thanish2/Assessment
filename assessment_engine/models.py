from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

class Domain(models.Model):
    name= models.CharField(max_length=100,unique=True)
    description=models.TextField(blank=True)

    def __str__(self):
        return self.name

class AssessmentAttempt(models.Model):
    ATTEMPT_TYPES = [
        ("baseline", "Baseline"),
        ("reassessment", "Reassessment"),
        ("practice", "Practice"),
    ]
    attempt_type = models.CharField(
        max_length=20,
        choices=ATTEMPT_TYPES,
        default="baseline"
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    domain = models.ForeignKey(Domain, on_delete=models.CASCADE)
    started_at = models.DateTimeField()
    duration_minutes = models.IntegerField(default=2)
    is_submitted = models.BooleanField(default=False)
    submitted_at = models.DateTimeField(null=True, blank=True)
    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["user", "domain"],
                condition=models.Q(is_submitted=True),
                name="unique_domain_attempt_per_user"
            )
        ]

    def remaining_time(self):
        elapsed = (timezone.now() - self.started_at).total_seconds()
        total = self.duration_minutes * 60
        return max(0, total - elapsed)



class AssessmentResult(models.Model):
    attempt = models.OneToOneField(
        AssessmentAttempt,
        on_delete=models.CASCADE,
        related_name="result"
    )
    total_questions = models.IntegerField()
    correct_answers = models.IntegerField()
    score = models.FloatField()
    submitted_at = models.DateTimeField(auto_now_add=True)
    strengths = models.JSONField(default=list, blank=True)
    weaknesses = models.JSONField(default=list, blank=True)
    roadmap = models.JSONField(null=True, blank=True)

    def __str__(self):
        return f"Score: {self.score}% ({self.correct_answers}/{self.total_questions})"


class UserAnswer(models.Model):
    attempt = models.ForeignKey(AssessmentAttempt, on_delete=models.CASCADE)
    question = models.ForeignKey("MCQQuestion", on_delete=models.CASCADE)
    selected_option = models.CharField(max_length=1)
    class Meta:
        unique_together = ('attempt', 'question')





class TopicScore(models.Model):
    result = models.ForeignKey(
        AssessmentResult,
        on_delete=models.CASCADE,
        related_name="topic_scores"
    )
    topic = models.ForeignKey(
        "Topic",
        on_delete=models.CASCADE
    )
    correct = models.IntegerField()
    total = models.IntegerField()
    percentage = models.FloatField()

    def __str__(self):
        return f"{self.topic.name} - {self.percentage}%"

class Topic(models.Model):
    name = models.CharField(max_length=100)
    domain = models.ForeignKey(Domain, on_delete=models.CASCADE, related_name="topics")
    weight = models.IntegerField(default=1)  # optional future use

    class Meta:
        unique_together = ("name", "domain")

    def __str__(self):
        return f"{self.domain.name} - {self.name}"


class MCQQuestion(models.Model):
    question_text = models.TextField()
    option_a = models.CharField(max_length=255)
    option_b = models.CharField(max_length=255)
    option_c = models.CharField(max_length=255)
    option_d = models.CharField(max_length=255)

    correct_option = models.CharField(max_length=1)

    topic = models.ForeignKey(
        Topic,
        on_delete=models.CASCADE,
        related_name="questions"
    )

    difficulty = models.CharField(max_length=10)

    def __str__(self):
        return self.question_text[:50]




