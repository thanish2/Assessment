from django.shortcuts import render

# Create your views here.
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .models import MCQQuestion, AssessmentResult
from .serializers import MCQQuestionSerializer
from .utils import analyze_topics
from .llm import generate_roadmap

class MCQListView(APIView):
    def get(self, request):
        questions = MCQQuestion.objects.all()
        serializer = MCQQuestionSerializer(questions, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class MCQSubmitView(APIView):
    def post(self, request):
        user_answers = request.data.get("answers", {})

        if not user_answers:
            return Response(
                {"error": "No answers submitted"},
                status=status.HTTP_400_BAD_REQUEST
            )
       

        questions = MCQQuestion.objects.filter(id__in=user_answers.keys())

        topic_scores = {}
        topic_total = {}

        correct = 0
        total = questions.count()

        for q in questions:
            topic_total[q.topic] = topic_total.get(q.topic, 0) + 1

            user_answer=user_answers.get(str(q.id),"").strip().lower()

            correct_answer=q.correct_option.strip().lower()

            if user_answer == correct_answer:
                correct += 1
                topic_scores[q.topic] = topic_scores.get(q.topic, 0) + 1
            else:
                topic_scores.setdefault(q.topic, 0)

        score_percent = (correct / total) * 100 if total > 0 else 0
        strengths, weaknesses = analyze_topics(topic_scores, topic_total)

        # 🔥 LLM ROADMAP
        roadmap = generate_roadmap(
            overall_score=score_percent,
            strengths=strengths,
            weaknesses=weaknesses
        )

        # 🔥 SAVE SINGLE RESULT
        result = AssessmentResult.objects.create(
            total_questions=total,
            correct_answers=correct,
            score=score_percent,
            strengths=strengths,
            weaknesses=weaknesses,
            roadmap=roadmap
        )

        return Response({
            "result_id": result.id,
            "total_questions":total,
            "correct_answers":correct,
            "score_percent": score_percent,
            "strengths": strengths,
            "weaknesses": weaknesses,
            "roadmap": roadmap,
        }, status=status.HTTP_200_OK)
       




class AssessmentResultView(APIView):
    def get(self, request, result_id):
        try:
            result = AssessmentResult.objects.get(id=result_id)
        except AssessmentResult.DoesNotExist:
            return Response(
                {"error": "Result not found"},
                status=404
            )

        return Response({
            "total_questions": result.total_questions,
            "correct_answers": result.correct_answers,
            "score": result.score,
            "strengths": result.strengths,
            "weaknesses": result.weaknesses,
            "roadmap": result.roadmap,
            "submitted_at": result.submitted_at
        }, status=200)
