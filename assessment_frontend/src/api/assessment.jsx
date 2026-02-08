const BASE_URL = "http://127.0.0.1:8000/api/assessment";

export async function fetchMCQs() {
  const res = await fetch(`${BASE_URL}/mcqs/`);
  return res.json();
}

export async function submitMCQs(answers) {
  const res = await fetch(`${BASE_URL}/mcqs/submit/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ answers }),
  });

  return res.json();
}

export async function fetchResults() {
  const res = await fetch(`${BASE_URL}/results/`);
  return res.json();
}

import axios from "axios";

export async function fetchRoadmap(resultId) {
  const res = await axios.get(`http://127.0.0.1:8000/api/assessment/results/${resultId}/`);

  return res.data.roadmap; // assuming your backend returns { roadmap: {...} }
}
