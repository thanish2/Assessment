import requests
import json
import os
from dotenv import load_dotenv

load_dotenv()
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")

OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"


def generate_roadmap(overall_score, strengths, weaknesses, topic_scores):

    prompt = f"""
You are a senior technical mentor.

Assessment Summary:
Overall Score: {overall_score}%

Topic-wise Performance:
{topic_scores}

Strengths: {strengths}
Weaknesses: {weaknesses}

Task:
Generate a clear, practical 4-week personalized technical learning roadmap.

Rules:
- Prioritize weakest topics first.
- If multiple topics have similar scores, prioritize in this order:
  Core CS fundamentals → Data Structures and Algorithms → System Design.
- Build foundations before advanced concepts.
- Keep tasks practical and actionable.
- Avoid generic advice.

Output ONLY valid JSON.
Follow this schema exactly:

{{
  "duration_weeks": 4,
  "roadmap": [
    {{
      "week": 1,
      "focus": "string",
      "tasks": ["string", "string"]
    }}
  ],
  "daily_habits": ["string", "string"]
}}
"""

    payload = {
        "model": "meta-llama/llama-3-8b-instruct",
        "messages": [{"role": "user", "content": prompt}],
        "temperature": 0.2
    }

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:8000",
        "X-Title": "Assessment Engine"
    }

    for attempt in range(3):
        try:
            response = requests.post(
                OPENROUTER_URL,
                headers=headers,
                data=json.dumps(payload),
                timeout=40
            )

            response.raise_for_status()
            raw = response.json()["choices"][0]["message"]["content"]

            start = raw.index("{")
            end = raw.rindex("}") + 1
            json_text = raw[start:end]

            return json.loads(json_text)

        except Exception as e:
            print(f"\n⚠️ LLM JSON parse failed (attempt {attempt+1})")
            print("Error:", e)

    # Fallback (safe)
    return {
        "duration_weeks": 4,
        "roadmap": [
            {
                "week": 1,
                "focus": "Strengthen Fundamentals",
                "tasks": ["Revise weak topics", "Solve 10 practice problems daily"]
            },
            {
                "week": 2,
                "focus": "Core Practice",
                "tasks": ["Medium difficulty problems", "Concept reinforcement"]
            },
            {
                "week": 3,
                "focus": "Advanced Application",
                "tasks": ["Apply concepts to real scenarios", "Timed practice"]
            },
            {
                "week": 4,
                "focus": "Revision & Mock Tests",
                "tasks": ["Full-length mock tests", "Error analysis and revision"]
            }
        ],
        "daily_habits": [
            "1 hour focused practice",
            "30 minutes revision",
            "Maintain mistake log"
        ]
    }