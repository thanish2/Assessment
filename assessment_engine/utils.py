def analyze_topics(topic_scores, topic_total):
    strengths = []
    weaknesses = []

    for topic, total in topic_total.items():
        score = topic_scores.get(topic, 0)
        percent = (score / total) * 100 if total > 0 else 0

        if percent >= 70:
            strengths.append(topic)
        elif percent < 50:
            weaknesses.append(topic)

    return strengths, weaknesses

from django.contrib.auth import get_user_model

User = get_user_model()

def sync_user_from_token(request):
    user = request.user

    if not user or not user.is_authenticated:
        return None

    return user
