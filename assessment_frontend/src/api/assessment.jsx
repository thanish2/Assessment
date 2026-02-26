const BASE_URL = "http://127.0.0.1:8000/api/";

function getAuthHeaders(){
  const token=localStorage.getItem("access");
  return {
    "Content-Type":"application/json",
    Authorization:`Bearer ${token}`,
  };
}

export const fetchDomains = async () => {
  const res = await fetch(BASE_URL + "domains/", { 
    headers:getAuthHeaders() 
  });
  return res.json();
};

export const startAssessment = async (domainId) => {
  const res = await fetch(BASE_URL + "assessment/start/", {
    method: "POST",
    headers:getAuthHeaders() ,
    body: JSON.stringify({ domain_id: domainId }),
  });
  return res.json();
};

export const fetchAttemptQuestions = async (attemptId) => {
  const res = await fetch(BASE_URL + `assessment/${attemptId}/questions/`, { credentials: "include" ,headers:getAuthHeaders() });
  return res.json();
};

export const saveAnswer = async (attemptId, questionId, selectedOption) => {
  const res = await fetch(BASE_URL + `assessment/${attemptId}/save-answer/`, {
    method: "POST",
    credentials: "include",
    headers:getAuthHeaders() ,
    body: JSON.stringify({ question_id: questionId, selected_option: selectedOption }),
  });
  return res.json();
};

export const submitAttempt = async (attemptId) => {
  const res = await fetch(BASE_URL + `assessment/${attemptId}/submit/`, {
    method: "POST",
    credentials: "include",
    headers:getAuthHeaders() 
  });
  return res.json();
};

export const getResult = async (resultId) => {
  const res = await fetch(BASE_URL + `assessment/result/${resultId}/`, { credentials: "include",headers:getAuthHeaders()  });
  return res.json();
};


import axios from "axios";

export async function fetchRoadmap(resultId) {
  const token = localStorage.getItem("access");

  const res = await axios.get(
    `http://127.0.0.1:8000/api/assessment/results/${resultId}/`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return res.data.roadmap;
}

