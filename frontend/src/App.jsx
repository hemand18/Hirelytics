import { Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar.jsx";
import Overview from "./pages/Overview.jsx";
import Skills from "./pages/Skills.jsx";
import SalaryPrediction from "./pages/SalaryPrediction.jsx";
import Placeholder from "./pages/Placeholder.jsx";

export default function App() {
  return (
    <div className="shell">
      <Sidebar />
      <main className="main">
        <Routes>
          <Route path="/" element={<Overview />} />
          <Route path="/market" element={<Placeholder title="Job Market Analytics" />} />
          <Route path="/skills" element={<Skills />} />
          <Route path="/salary-insights" element={<Placeholder title="Salary Insights" />} />
          <Route path="/predict" element={<SalaryPrediction />} />
          <Route path="/careers" element={<Placeholder title="Career Recommendations" />} />
          <Route path="/jobs" element={<Placeholder title="Job Explorer" />} />
          <Route path="/about" element={<Placeholder title="About Project" />} />
        </Routes>
      </main>
    </div>
  );
}
