import { useEffect, useState } from "react";
import { fetchMCQs, submitMCQs,fetchAssessmentStatus,saveAnswer, startAssessment } from "../api/assessment";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button"; // Shadcn Button
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Shadcn Card
import { useRef } from "react";
export default function MCQTest() {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const[timeLeft,setTimeLeft]=useState(null);
  const navigate = useNavigate();
  const hasStarted=useRef(false);

  

  useEffect(() => {
    if(hasStarted.current)return;
    hasStarted.current=true;
    const token=localStorage.getItem("access");
    if(!token){
      navigate("/");
    }

    async function initializeTest(){
      try{
        const startData=await startAssessment();
        setTimeLeft(startData.remaining_time);

        const questionsData=await fetchMCQs();
        setQuestions(questionsData);

      }catch(err){
        console.error("Initialization failed");
      }
      

    }

    initializeTest()
  }, []);

  useEffect(()=>{
    if(timeLeft==null)return;
    if(timeLeft<=0){
      handleSubmit();
      return;
    }
    const timer=setInterval(()=>{
      setTimeLeft((prev)=>prev-1);
    },1000);
    return () => clearInterval(timer);
  },[timeLeft]);

  async function handleSelect(qid, option) {
    setAnswers((prev) => ({
      ...prev,
      [qid]: option,
    }));

    try{
      await saveAnswer(qid,option);
    }catch(err){
      console.error("Failed to save");
    }
  }

  async function handleSubmit() {
    const res = await submitMCQs(answers);
    setResult(res);
    setSubmitted(true);
  }

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl bg-white border-blue-200 shadow-lg rounded-lg">
          <CardHeader className="bg-blue-100 text-blue-900 rounded-t-lg">
            <CardTitle className="text-2xl font-bold">Quiz Completed</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <p className="text-lg mb-2 text-gray-800">
              Score: {result?.correct_answers}
            </p>
            <p className="text-lg mb-2 text-gray-800">
              Total: {result?.total_questions}
            </p>
            <p className="text-lg mb-4 text-gray-800">
              Percentage: {result?.score_percent}%
            </p>
            <Button
              onClick={() => navigate(`/roadmap/${result.result_id}`)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md"
            >
              View Analysis
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <p className="text-blue-700 text-lg">Loading questions...</p>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const isFirstQuestion = currentQuestionIndex === 0;
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  function formatTime(seconds){
    const mins=Math.floor(seconds/60);
    const secs=seconds%60;
    return `${mins}:${secs}`;
  }

  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-white border-blue-200 shadow-lg rounded-lg">
        <div className="text-red-600 font-bold text-lg mb-4">
          Time Remaining: {formatTime(timeLeft)}
        </div>
        <CardHeader className="bg-blue-100 text-blue-900 rounded-t-lg">
          <CardTitle className="text-xl font-semibold">
            Question {currentQuestionIndex + 1} of {questions.length}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <h2 className="text-lg font-medium mb-4 text-gray-800">
            {currentQuestion.question_text}
          </h2>
          <div className="space-y-3">
            {["A", "B", "C", "D"].map((opt) => (
              <label
                key={opt}
                className="flex items-center space-x-3 p-3 border border-blue-200 rounded-lg hover:bg-blue-50 cursor-pointer transition-colors"
              >
                <input
                  type="radio"
                  name={`q-${currentQuestion.id}`}
                  value={opt}
                  checked={answers[currentQuestion.id] === opt}
                  onChange={() => handleSelect(currentQuestion.id, opt)}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-700">
                  {currentQuestion[`option_${opt.toLowerCase()}`]}
                </span>
              </label>
            ))}
          </div>
          <div className="flex justify-between mt-6">
            <Button
              onClick={handlePrevious}
              disabled={isFirstQuestion}
              variant="outline"
              className="border-blue-300 text-blue-700 hover:bg-blue-100 disabled:opacity-50 px-4 py-2 rounded-md"
            >
              Previous
            </Button>
            {!isLastQuestion ? (
              <Button
                onClick={handleNext}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
              >
                Submit
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
