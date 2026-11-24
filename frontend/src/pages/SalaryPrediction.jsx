import { useState } from "react";
import { predictSalary } from "../api.js";

export default function SalaryPrediction() {
  const [form, setForm] = useState({ role: "Data Analyst", experience: 0, skills: "Python, SQL", location: "Chennai" });
  const [result, setResult] = useState(null);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const submit = async () => {
    const skills = form.skills.split(",").map(s => s.trim()).filter(Boolean);
    setResult(await predictSalary({ ...form, experience: Number(form.experience), skills }));
  };
  return (
    <>
      <h1>Salary Prediction</h1>
      <div className="card form">
        <label>Job role<input value={form.role} onChange={set("role")} /></label>
        <label>Experience (years)<input type="number" min="0" value={form.experience} onChange={set("experience")} /></label>
        <label>Skills (comma separated)<input value={form.skills} onChange={set("skills")} /></label>
        <label>Location<input value={form.location} onChange={set("location")} /></label>
        <button onClick={submit}>Estimate salary</button>
      </div>
      {result && (
        <div className="card result">
          <div className="muted">Estimated range</div>
          <div className="stat-value">₹{result.low_lpa}–{result.high_lpa} LPA</div>
          {result.is_placeholder && <div className="muted small">Placeholder formula, not a trained model yet.</div>}
        </div>
      )}
    </>
  );
}
