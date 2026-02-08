import requests
import json
from django.conf import settings
import os
from dotenv import load_dotenv

load_dotenv()
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")


OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"

def generate_roadmap(overall_score, strengths, weaknesses):
    prompt = f"""
You are a senior technical mentor.

Assessment Summary:
Overall Score: {overall_score}%
Strengths: {strengths}
Weaknesses: {weaknesses}

Task:
Generate a 4-week personalized technical learning roadmap.

Rules:
- Focus heavily on weaknesses
- Assume beginner to intermediate level
- Output ONLY valid JSON
- Follow this schema exactly:

{{
  "duration_weeks": 4,
  "roadmap": [
    {{
      "week": 1,
      "focus": "string",
      "tasks": ["string"]
    }}
  ],
  "daily_habits": ["string"]
}}
"""

    payload = {
        "model": "meta-llama/llama-3-8b-instruct",
        "messages": [
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.3
    }

    headers = {
    "Authorization": f"Bearer {OPENROUTER_API_KEY}",
    "Content-Type": "application/json",
    "HTTP-Referer": "http://localhost:8000",
    "X-Title": "Assessment Engine"
}
   


    response = requests.post(
        OPENROUTER_URL,
        headers=headers,
        data=json.dumps(payload),
        timeout=30
    )

    response.raise_for_status()
    raw = response.json()["choices"][0]["message"]["content"]

    start = raw.find("{")
    end = raw.rfind("}") + 1

    return json.loads(raw[start:end])
