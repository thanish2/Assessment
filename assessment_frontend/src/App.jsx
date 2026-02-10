import MCQTest from "./components/MCQTest";
import Roadmap from "./pages/Roadmap"
import { BrowserRouter, Routes, Route } from "react-router-dom";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MCQTest />} />
        <Route path="/roadmap/:resultId" element={<Roadmap />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

