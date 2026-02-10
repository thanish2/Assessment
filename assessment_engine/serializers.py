from rest_framework import serializers
from .models import MCQQuestion

class MCQQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = MCQQuestion
        exclude = ['correct_option']
