import { useEffect, useState } from "react";
import { fetchMCQs, submitMCQs } from "../api/assessment";
import { useNavigate } from "react-router-dom"

export default function MCQTest() {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const navigate=useNavigate();


  useEffect(() => {
    fetchMCQs().then(setQuestions);
  }, []);

  function handleSelect(qid, option) {
    setAnswers((prev) => ({
      ...prev,
      [qid]: option,
    }));
  }

  async function handleSubmit() {
    const res = await submitMCQs(answers);
    setResult(res);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div>
        <h2>Result</h2>
        <p>Score: {result?.correct_answers}</p>
        <p>Total: {result?.total_questions}</p>
        <p>Percentage: {result?.score_percent}</p>

        <button onClick={() => navigate(`/roadmap/${result.result_id}`)}>View Analysis</button>
      </div>
    );
  }

  return (
    <div>
      <h2>MCQ Assessment</h2>

      {questions.map((q, index) => (
        <div key={q.id} style={{ marginBottom: "20px" }}>
          <p>
            {index + 1}. {q.question_text}
          </p>

          {["A", "B", "C", "D"].map((opt) => (
            <label key={opt} style={{ display: "block" }}>
              <input
                type="radio"
                name={`q-${q.id}`}
                value={opt}
                checked={answers[q.id] === opt}
                onChange={() => handleSelect(q.id, opt)}
              />
              {q[`option_${opt.toLowerCase()}`]}
            </label>
          ))}
        </div>
      ))}

      <button onClick={handleSubmit}>Submit</button>
    </div>
  );
}
