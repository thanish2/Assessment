import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  fetchAttemptQuestions,
  saveAnswer,
  submitAttempt,
} from "../api/assessment";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";

export default function AttemptPage() {
  const { attemptId } = useParams();
  const navigate = useNavigate();

  const [sections, setSections] = useState([]);
  const [timeLeft, setTimeLeft] = useState(null);
  const [loading, setLoading] = useState(true);

  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [sectionQuestionMap, setSectionQuestionMap] = useState({});
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    async function load() {
      const data = await fetchAttemptQuestions(attemptId);
      setSections(data.topics);
      setTimeLeft(Math.floor(data.remaining_time));
      setLoading(false);

      const initialMap = {};
      data.topics.forEach((_, index) => {
        initialMap[index] = 0;
      });
      setSectionQuestionMap(initialMap);
    }
    load();
  }, []);

  useEffect(() => {
    if (timeLeft == null) return;
    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  async function handleSelect(qid, option) {
    setAnswers((prev) => ({
      ...prev,
      [qid]: option,
    }));
    await saveAnswer(attemptId, qid, option);
  }

  async function handleSubmit() {
    const res = await submitAttempt(attemptId);
    if (res.result_id) navigate(`/result/${res.result_id}`);
  }

  if (loading) return <div className="p-10">Loading...</div>;

  const currentSection = sections[currentSectionIndex];
  const currentQuestionIndex = sectionQuestionMap[currentSectionIndex];
  const currentQuestion = currentSection.questions[currentQuestionIndex];

  const isLastQuestionInSection =
    currentQuestionIndex === currentSection.questions.length - 1;

  const isLastSection = currentSectionIndex === sections.length - 1;

  const progress =
    ((currentQuestionIndex + 1) / currentSection.questions.length) * 100;

  function formatTime(seconds) {
    const total = Math.floor(seconds);
    const mins = Math.floor(total / 60);
    const secs = total % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }

  return (
    <div className="h-screen bg-linear-to-br from-slate-100 to-slate-200 flex overflow-hidden">
      <div className="w-72 bg-white/80 backdrop-blur-md border-r shadow-xl p-6 overflow-y-auto">
        <h2 className="text-2xl font-bold mb-8 text-slate-800">Sections</h2>

        {sections.map((section, index) => (
          <button
            key={section.id}
            onClick={() => setCurrentSectionIndex(index)}
            className={`w-full text-left px-4 py-3 rounded-xl mb-3 transition-all ${
              index === currentSectionIndex
                ? "bg-slate-900 text-white shadow-md"
                : "bg-slate-100 hover:bg-slate-200"
            }`}
          >
            {section.name}
          </button>
        ))}
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b px-10 py-4 flex justify-between items-center shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              {currentSection.name}
            </h1>
            <p className="text-slate-500 text-sm">
              Question {currentQuestionIndex + 1} of{" "}
              {currentSection.questions.length}
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-900 text-white px-5 py-2 rounded-full shadow-md">
            <Clock className="w-4 h-4" />
            <span className="font-semibold tracking-wide">
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-10">
          <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-4xl w-full mx-auto">
            <div className="w-full bg-slate-200 h-2 rounded-full mb-8">
              <div
                className="bg-slate-900 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>

            <h2 className="text-xl font-medium mb-8 text-slate-800 leading-relaxed">
              {currentQuestion.question_text}
            </h2>

            <div className="space-y-4">
              {["A", "B", "C", "D"].map((opt) => (
                <label
                  key={opt}
                  className={`flex items-center gap-4 p-5 border rounded-2xl cursor-pointer transition-all ${
                    answers[currentQuestion.id] === opt
                      ? "border-slate-900 bg-slate-100"
                      : "hover:bg-slate-50"
                  }`}
                >
                  <input
                    type="radio"
                    value={opt}
                    checked={answers[currentQuestion.id] === opt}
                    onChange={() => handleSelect(currentQuestion.id, opt)}
                  />
                  <span className="text-slate-700">
                    {currentQuestion[`option_${opt.toLowerCase()}`]}
                  </span>
                </label>
              ))}
            </div>

            <div className="flex justify-between mt-10">
              <Button
                variant="outline"
                disabled={currentQuestionIndex === 0}
                onClick={() =>
                  setSectionQuestionMap((prev) => ({
                    ...prev,
                    [currentSectionIndex]: prev[currentSectionIndex] - 1,
                  }))
                }
              >
                Previous
              </Button>

              {!isLastQuestionInSection ? (
                <Button
                  onClick={() =>
                    setSectionQuestionMap((prev) => ({
                      ...prev,
                      [currentSectionIndex]: prev[currentSectionIndex] + 1,
                    }))
                  }
                >
                  Next
                </Button>
              ) : !isLastSection ? (
                <Button
                  onClick={() => setCurrentSectionIndex((prev) => prev + 1)}
                >
                  Next Section
                </Button>
              ) : (
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={handleSubmit}
                >
                  Submit Assessment
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
