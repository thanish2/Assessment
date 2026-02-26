import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { getResult } from "@/api/assessment";

const ResultPage = () => {
  const { resultId } = useParams();
  const [result, setResult] = useState(null);

  useEffect(() => {
    async function fetchResult(){
        const response=await getResult(resultId);
        setResult(response);
    }
    fetchResult();
  }, [resultId]);

  if (!result) return <div>Loading...</div>;

  return (
    <div style={{ padding: "30px" }}>
      <h1>Assessment Result</h1>

      {/* Overall Score */}
      <h2>Overall Score: {result.score}%</h2>
      <p>
        {result.correct_answers} / {result.total_questions} Correct
      </p>

      {/* Section Breakdown */}
      <h3>Section-wise Performance</h3>
      <ul>
        {result.section_scores.map((section, index) => (
          <li key={index}>
            {section.topic_name}: {section.correct}/{section.total} (
            {section.percentage}%)
          </li>
        ))}
      </ul>

      {/* Strengths */}
      <h3>Strengths</h3>
      <ul>
        {result.strengths?.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>

      {/* Weaknesses */}
      <h3>Weaknesses</h3>
      <ul>
        {result.weaknesses?.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>

      {/* Roadmap */}
      <h3>Roadmap</h3>
      <ul>
       {result.roadmap?.roadmap?.map((week, index) => (
  <li key={index}>
    <b>Week {week.week}</b> — {week.focus}
    <ul>
      {week.tasks.map((task, i) => (
        <li key={i}>{task}</li>
      ))}
    </ul>
  </li>
))}
      </ul>

      <p style={{ marginTop: "20px", fontSize: "12px" }}>
        Submitted at: {new Date(result.submitted_at).toLocaleString()}
      </p>
    </div>
  );
};

export default ResultPage;