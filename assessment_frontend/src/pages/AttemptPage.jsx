import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  fetchAttemptQuestions,
  saveAnswer,
  submitAttempt,
} from "../api/assessment";
import { useNavigate } from "react-router-dom";


export default function AttemptPage() {
  const { attemptId } = useParams();

  const [sections, setSections] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadQuestions();
  }, []);

  async function loadQuestions() {
    const data = await fetchAttemptQuestions(attemptId);
    console.log("API DATA:", data);
    setSections(data.topics);
    setTimeLeft(data.remaining_time);
    setLoading(false);
  }

  // Timer
  useEffect(() => {
    if (!timeLeft) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft]);

  // Auto-submit
  useEffect(() => {
    if (timeLeft === 0 && !loading) {
      handleSubmit();
    }
  }, [timeLeft]);

  async function handleSave(questionId, option) {
    await saveAnswer(attemptId, questionId, option);
  }

  async function handleSubmit() {
    const res=await submitAttempt(attemptId);
    if(res.result_id){
        navigate(`/result/${res.result_id}`);
    }
  }

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-8">

      {/* Timer */}
      <div className="text-right text-red-600 font-bold text-lg mb-6">
        Time Left: {Math.floor(timeLeft / 60)}:
        {Math.floor(timeLeft % 60).toString().padStart(2, "0")}
      </div>

      {/* Section-wise Rendering */}
      {sections.map((section) => (
        <div key={section.id} className="mb-10">

          {/* Topic Title */}
          <h2 className="text-2xl font-bold mb-4 border-b pb-2">
            {section.name}
          </h2>

          {/* Questions under this topic */}
          {section.questions.map((q, index) => (
            <div
              key={q.id}
              className="bg-white p-6 rounded-lg shadow mb-6"
            >
              <h3 className="font-semibold mb-4">
                Q{index + 1}. {q.question_text}
              </h3>

              {["A", "B", "C", "D"].map((opt) => (
                <label key={opt} className="block mb-2 cursor-pointer">
                  <input
                    type="radio"
                    name={`q-${q.id}`}
                    className="mr-2"
                    onChange={() => handleSave(q.id, opt)}
                  />
                  {q[`option_${opt.toLowerCase()}`]}
                </label>
              ))}
            </div>
          ))}
        </div>
      ))}

      {/* Submit Button */}
      <div className="text-center mt-8">
        <button
          onClick={handleSubmit}
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
        >
          Submit Assessment
        </button>
      </div>
    </div>
  );
}