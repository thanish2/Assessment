
import Login from "./pages/Login";
import DomainSelectionPage from "./pages/DomainSelectionPage"
import AttemptPage from "./pages/AttemptPage"
import ResultPage from "./pages/ResultPage";
import Roadmap from "./pages/Roadmap"
import { BrowserRouter, Routes, Route } from "react-router-dom";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/domains" element={<DomainSelectionPage />} />
        <Route path="/exam/:attemptId" element={<AttemptPage />} />
        <Route path="/result/:resultId" element={<ResultPage />} />
        <Route path="/exam/:attemptId" element={<AttemptPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

