import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchDomains, startAssessment } from "../api/assessment";

export default function DomainSelection() {
  const [domains, setDomains] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadDomains() {
      const data = await fetchDomains();
      setDomains(data);
    }
    loadDomains();
  }, []);

  async function handleSelect(domain_id) {
    const data = await startAssessment(domain_id);

    if (data.attempt_id) {
      navigate(`/exam/${data.attempt_id}`);
    } else {
      alert("Could not start assessment");
    }
  }

  return (
    <div className="min-h-screen bg-blue-50 p-8">
      <h2 className="text-2xl font-bold mb-6 text-center">
        Select a Domain
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {domains.map((domain) => (
          <div
            key={domain.id}
            onClick={() => handleSelect(domain.id)}
            className="bg-white p-6 rounded-lg shadow-md cursor-pointer hover:shadow-xl transition"
          >
            <h3 className="text-lg font-semibold">
              {domain.name}
            </h3>
            <p className="text-sm text-gray-500 mt-2">
              Click to start assessment
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}