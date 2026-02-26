from rest_framework import serializers
from .models import MCQQuestion,Topic, AssessmentAttempt,UserAnswer,Domain

class MCQQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = MCQQuestion
        fields = ['id', 'question_text', 'option_a', 'option_b', 'option_c', 'option_d', 'difficulty']

class DomainSerializer(serializers.ModelSerializer):
    already_attempted = serializers.SerializerMethodField()
    attempt_id = serializers.SerializerMethodField()

    class Meta:
        model = Domain
        fields = ["id", "name", "description", "already_attempted", "attempt_id"]

    def get_already_attempted(self, obj):
        user = self.context["request"].user
        return AssessmentAttempt.objects.filter(
            user=user,
            domain=obj,
            attempt_type="baseline",
            is_submitted=True
        ).exists()

    def get_attempt_id(self, obj):
        user = self.context["request"].user
        attempt = AssessmentAttempt.objects.filter(
            user=user,
            domain=obj,
            attempt_type="baseline",
            is_submitted=True
        ).order_by("-submitted_at").first()

        return attempt.id if attempt else None


class TopicWithQuestionsSerializer(serializers.ModelSerializer):
    questions = MCQQuestionSerializer(many=True)

    class Meta:
        model = Topic
        fields = ['id', 'name', 'questions']
    

class UserAnswerSerializer(serializers.Serializer):
    question_id = serializers.IntegerField()
    selected_option = serializers.CharField(max_length=1)