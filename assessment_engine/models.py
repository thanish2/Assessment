from django.db import models

# Create your models here.
class MCQQuestion(models.Model):
    question_text = models.TextField()
    option_a = models.CharField(max_length=255)
    option_b = models.CharField(max_length=255)
    option_c = models.CharField(max_length=255)
    option_d = models.CharField(max_length=255)

    correct_option = models.CharField(max_length=1)

    topic = models.CharField(max_length=20)
    difficulty = models.CharField(max_length=10)


class AssessmentResult(models.Model):
    total_questions = models.IntegerField()
    correct_answers = models.IntegerField()
    score = models.FloatField()
    submitted_at = models.DateTimeField(auto_now_add=True)
    strengths = models.JSONField(default=list, blank=True)
    weaknesses = models.JSONField(default=list, blank=True)
    roadmap = models.JSONField(null=True, blank=True)

    def __str__(self):
        return f"Score: {self.score}% ({self.correct_answers}/{self.total_questions})"
