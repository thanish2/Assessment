from django.shortcuts import render
from django.utils import timezone
from django.shortcuts import get_object_or_404

# Create your views here.
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from .models import MCQQuestion, AssessmentResult
from .models import AssessmentAttempt, UserAnswer,Topic,Domain,TopicScore
from .serializers import MCQQuestionSerializer,DomainSerializer,TopicWithQuestionsSerializer
from .utils import analyze_topics
from .llm import generate_roadmap



class MCQListView(APIView):
    permission_classes=[IsAuthenticated]
    def get(self, request):
        attempt = AssessmentAttempt.objects.filter(user=request.user).first()

        if not attempt:
            return Response({"error": "Start assessment first"}, status=403)

        if attempt.remaining_time() <= 0:
            return Response({"error": "Time expired"}, status=403)

        questions = MCQQuestion.objects.all()
        serializer = MCQQuestionSerializer(questions, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

from django.db import transaction

class SubmitAttemptView(APIView):
    permission_classes = [IsAuthenticated]

    @transaction.atomic
    def post(self, request, attempt_id):
        user = request.user

        attempt = get_object_or_404(
            AssessmentAttempt,
            id=attempt_id,
            user=user
        )

        # 1️⃣ Already submitted check
        if attempt.is_submitted:
            return Response(
                {"error": "Attempt already submitted."},
                status=400
            )

        # 2️⃣ Timer check
        if attempt.remaining_time() <= 0:
            attempt.is_submitted = True
            attempt.submitted_at = timezone.now()
            attempt.save()
            return Response(
                {"error": "Time is over. Attempt auto-submitted."},
                status=400
            )

        # 3️⃣ Fetch saved answers
        user_answers = UserAnswer.objects.select_related(
            "question__topic"
        ).filter(attempt=attempt)

        total_questions = MCQQuestion.objects.filter(
            topic__domain=attempt.domain
        ).count()

        if total_questions == 0:
            return Response(
                {"error": "No questions found for this domain."},
                status=400
            )

        correct_answers = 0
        topic_stats = {}

        # 4️⃣ Calculate topic stats
        for ua in user_answers:
            question = ua.question
            topic = question.topic

            if topic.id not in topic_stats:
                topic_stats[topic.id] = {
                    "topic_obj": topic,
                    "correct": 0,
                    "total": 0
                }

            topic_stats[topic.id]["total"] += 1

            if ua.selected_option.upper() == question.correct_option.upper():
                topic_stats[topic.id]["correct"] += 1
                correct_answers += 1

        # 5️⃣ Overall score
        overall_score = round(
            (correct_answers / total_questions) * 100,
            2
        )

        # 6️⃣ Mark attempt submitted
        attempt.is_submitted = True
        attempt.submitted_at = timezone.now()
        attempt.save()

        # 7️⃣ Create AssessmentResult
        result = AssessmentResult.objects.create(
            attempt=attempt,
            total_questions=total_questions,
            correct_answers=correct_answers,
            score=overall_score,
            strengths=[],   # fill later
            weaknesses=[],  # fill later
            roadmap={}
        )

        strengths = []
        weaknesses = []
        topic_scores_response = []

        # 8️⃣ Create TopicScore records
        for data in topic_stats.values():
            topic_obj = data["topic_obj"]
            correct = data["correct"]
            total = data["total"]

            percentage = round((correct / total) * 100, 2)

            # Save to DB
            TopicScore.objects.create(
                result=result,
                topic=topic_obj,
                correct=correct,
                total=total,
                percentage=percentage
            )

            topic_scores_response.append({
                "topic": topic_obj.name,
                "correct": correct,
                "total": total,
                "percentage": percentage
            })

            # Determine strengths/weaknesses
            if percentage >= 75:
                strengths.append(topic_obj.name)
            elif percentage <= 40:
                weaknesses.append(topic_obj.name)

        # 9️⃣ Update result with strengths/weaknesses/roadmap
        result.strengths = strengths
        result.weaknesses = weaknesses
        result.roadmap = generate_roadmap(
            topic_scores_response,
            strengths=strengths,
            weaknesses=weaknesses,
            topic_scores=topic_scores_response,
        )
        result.save()

        return Response({
            "result_id":result.id,
            "message": "Assessment submitted successfully.",
            "score": overall_score,
            "total_questions": total_questions,
            "correct_answers": correct_answers,
            "strengths": strengths,
            "weaknesses": weaknesses,
            "topic_scores": topic_scores_response,
            "roadmap": result.roadmap
        })



class AssessmentResultView(APIView):
    permission_classes=[IsAuthenticated]
    def get(self, request, result_id):
        try:
            result = AssessmentResult.objects.get(id=result_id,attempt__user=request.user)
            topic_scores=TopicScore.objects.filter(result=result)

            
        except AssessmentResult.DoesNotExist:
            return Response(
                {"error": "Result not found"},
                status=404
            )
        
        section_scores = [
            {
                "topic_name": ts.topic.name,
                "correct": ts.correct,
                "total": ts.total,
                "percentage": round((ts.correct / ts.total) * 100, 2)
            }
            for ts in topic_scores
            ]
        return Response({
            "total_questions": result.total_questions,
            "correct_answers": result.correct_answers,
            "section_scores":section_scores,
            "score": result.score,
            "strengths": result.strengths,
            "weaknesses": result.weaknesses,
            "roadmap": result.roadmap,
            "submitted_at": result.submitted_at
        }, status=200)

class StartAssessmentView(APIView):
    permission_classes=[IsAuthenticated]
    

    def post(self, request):
        domain_id= request.data.get("domain_id")
        user = request.user
        
        if AssessmentAttempt.objects.filter(
            user=user,
            domain_id=domain_id,
            attempt_type="baseline",
            is_submitted=True
        ).exists():
            return Response(
                {"error": "Baseline already attempted for this domain."},
                status=400
            )

        attempt = AssessmentAttempt.objects.filter(
            user=user,
            domain_id=domain_id,
            attempt_type="baseline",
            is_submitted=False
        ).first()

        if attempt:
            elapsed = (timezone.now() - attempt.started_at).total_seconds()
            remaining = max(0, attempt.duration_minutes * 60 - int(elapsed))

            return Response({
                "attempt_id": attempt.id,
                "remaining_time": remaining,
                "resumed": True
            })


        attempt = AssessmentAttempt.objects.create(
            user=user,
            domain_id=domain_id,
            attempt_type="baseline",
            started_at=timezone.now(),
            duration_minutes=45
        )

        return Response({
            "remaining_time": 45 * 60,
            "attempt_id":attempt.id
            })


class SaveAnswerView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, attempt_id):
        user = request.user
        attempt = get_object_or_404(
            AssessmentAttempt,
            id=attempt_id,
            user=user,
            is_submitted=False
        )

        # Timer check
        if attempt.remaining_time() <= 0:
            attempt.is_submitted = True
            attempt.submitted_at = timezone.now()
            attempt.save()
            return Response(
                {"error": "Time is over. Attempt auto-submitted."},
                status=400
            )

        question_id = request.data.get("question_id")
        selected_option = request.data.get("selected_option")

        if not question_id or not selected_option:
            return Response(
                {"error": "question_id and selected_option required."},
                status=400
            )

        question = get_object_or_404(MCQQuestion, id=question_id)

        # Ensure question belongs to this attempt's domain
        if question.topic.domain != attempt.domain:
            return Response(
                {"error": "Invalid question for this attempt."},
                status=400
            )

        # Save or update immediately
        UserAnswer.objects.update_or_create(
            attempt=attempt,
            question=question,
            defaults={
                "selected_option": selected_option.upper()
            }
        )

        return Response({"message": "Answer saved successfully."})


class AssessmentStatusView(APIView):
    permission_classes=[IsAuthenticated]
    def get(self, request, attempt_id):
        attempt = get_object_or_404(AssessmentAttempt, id=attempt_id, user=request.user)

        if not attempt:
            return Response({"started": False})

        return Response({
            "started": True,
            "is_submitted": attempt.is_submitted,
            "remaining_time": attempt.remaining_time()
        })

class DomainListView(APIView):
    permission_classes=[IsAuthenticated]

    def get(self,request):
        domains=Domain.objects.all()
        serializer=DomainSerializer(
            domains,
            many=True,
            context={"request":request}
        )
        return Response(serializer.data)


class AttemptQuestionsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, attempt_id):
        # Fetch attempt and validate ownership
        attempt = get_object_or_404(AssessmentAttempt, id=attempt_id, user=request.user)

        # If already submitted, optionally block fetching
        if attempt.is_submitted:
            return Response({"error": "This attempt has already been submitted."}, status=400)

        # Timer logic
        remaining_seconds = attempt.remaining_time()
        if remaining_seconds <= 0:
            return Response({"error": "Time is over for this attempt."}, status=400)

        # Fetch all topics for the domain
        topics = Topic.objects.filter(domain=attempt.domain)

        # Prefetch questions to reduce DB hits
        topics = topics.prefetch_related('questions')

        # Serialize
        serializer = TopicWithQuestionsSerializer(topics, many=True)
        return Response({
            "attempt_id": attempt.id,
            "domain": attempt.domain.name,
            "duration_minutes": attempt.duration_minutes,
            "remaining_time": remaining_seconds,
            "topics": serializer.data
        })
