import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchRoadmap } from "../api/assessment";

export default function Roadmap() {
  const { resultId } = useParams();
  const [roadmap, setRoadmap] = useState(null);

  useEffect(() => {
    fetchRoadmap(resultId).then(setRoadmap);
  }, [resultId]);

  if (!roadmap) return <p>Loading roadmap...</p>;

  return (
    <div>
      <h1>Your Personalized Roadmap</h1>
     {roadmap && (
    <div>
    <h2 className="text-2xl font-bold mb-4">📚 Your Learning Roadmap</h2>

    {roadmap.roadmap.map((weekBlock, idx) => (
      <div key={idx} className="mb-6 p-4 border rounded-lg shadow">
        <h3 className="text-xl font-semibold">
          Week {weekBlock.week} — {weekBlock.focus.toUpperCase()}
        </h3>

        <ul className="list-disc pl-6 mt-2">
          {weekBlock.tasks.map((task, i) => (
            <li key={i}>{task}</li>
          ))}
        </ul>
      </div>
    ))}

    <div className="mt-6 p-4 bg-gray-100 rounded-lg">
      <h3 className="text-lg font-semibold">🔥 Daily Habits</h3>
      <ul className="list-disc pl-6 mt-2">
        {roadmap.daily_habits.map((habit, idx) => (
          <li key={idx}>{habit}</li>
        ))}
      </ul>
    </div>
  </div>
)}

    </div>
  );
}
