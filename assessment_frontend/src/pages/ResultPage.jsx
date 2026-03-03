import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getResult } from "@/api/assessment";
import { motion, useScroll, useTransform } from "framer-motion";

const ResultPage = () => {
  const { resultId } = useParams();
  const [result, setResult] = useState(null);

  const { scrollYProgress } = useScroll();
  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  useEffect(() => {
    async function fetchResult() {
      const response = await getResult(resultId);
      setResult(response);
    }
    fetchResult();
  }, [resultId]);

  if (!result) return <div className="p-10">Loading...</div>;

  const roadmap = result.roadmap || {};

  return (
    <div className="min-h-screen bg-white text-black py-20 px-6">
      <div className="max-w-6xl mx-auto space-y-28 relative">
        {/* OVERALL PERFORMANCE */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-gray-50 rounded-3xl p-10 shadow-lg text-center"
        >
          <h1 className="text-3xl font-bold mb-4">Assessment Summary</h1>
          <p className="text-5xl font-bold mb-3">{result.score}%</p>
          <p className="text-gray-600">
            {result.correct_answers} / {result.total_questions} Correct
          </p>
        </motion.div>

        {/* SECTION PERFORMANCE */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-gray-50 rounded-3xl p-8 shadow-md"
        >
          <h2 className="text-2xl font-semibold mb-6">Section Performance</h2>

          <div className="space-y-5">
            {result.section_scores.map((sec, i) => (
              <div key={i}>
                <div className="flex justify-between mb-1">
                  <span className="font-medium">{sec.topic_name}</span>
                  <span className="text-gray-600">{sec.percentage}%</span>
                </div>

                {/* Animated Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${sec.percentage}%` }}
                    transition={{ duration: 0.8 }}
                    className="h-3 bg-black rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* TIMELINE */}
        <div className="relative">
          {/* Animated Vertical Line */}
          <motion.div
            style={{ height: lineHeight }}
            className="absolute left-1/2 top-0 w-1 bg-black -translate-x-1/2"
          />

          <div className="space-y-32">
            {roadmap.roadmap?.map((week, index) => {
              const isLeft = index % 2 === 0;

              return (
                <div
                  key={index}
                  className={`relative flex ${
                    isLeft ? "justify-start" : "justify-end"
                  }`}
                >
                  <div className="absolute left-1/2 -translate-x-1/2 w-7 h-7 bg-black rounded-full border-4 border-white shadow-md z-10"></div>

                  <motion.div
                    initial={{ x: isLeft ? -250 : 250, opacity: 0 }}
                    whileInView={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.7 }}
                    viewport={{ amount: 0.4 }}
                    className={`w-[45%] bg-gray-50 border rounded-3xl p-8 shadow-lg
                    transition-all duration-300 ease-out
                    hover:scale-105 hover:shadow-2xl hover:z-20
                    transform-gpu
                    ${isLeft ? "mr-auto" : "ml-auto"}`}
                  >
                    <h3 className="text-lg font-bold mb-3">Week {week.week}</h3>

                    <h4 className="text-xl font-semibold mb-4">{week.focus}</h4>

                    <ul className="list-disc pl-5 space-y-2 text-gray-700">
                      {week.tasks.map((task, i) => (
                        <li key={i}>{task}</li>
                      ))}
                    </ul>
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>

        {/* DAILY HABITS */}
        {roadmap.daily_habits && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-gray-50 rounded-3xl p-8 shadow-md"
          >
            <h2 className="text-2xl font-semibold mb-6">Daily Study Habits</h2>
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              {roadmap.daily_habits.map((habit, index) => (
                <li key={index}>{habit}</li>
              ))}
            </ul>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ResultPage;
