import { useEffect, useState } from "react";
import StatCard from "../components/StatCard.jsx";
import { getOverview } from "../api.js";

export default function Overview() {
  const [data, setData] = useState(null);
  useEffect(() => { getOverview().then(setData).catch(() => setData({ error: true })); }, []);
  return (
    <>
      <h1>Overview</h1>
      <p className="muted">Hiring trends and market insights</p>
      {data?.error && <p className="notice">Can&apos;t reach the backend. Start it with: uvicorn backend.main:app --reload</p>}
      {data?.is_sample && <p className="notice">Showing sample data. Load your dataset into MySQL to see real numbers.</p>}
      <div className="grid4">
        <StatCard label="Jobs analyzed" value={data?.total_jobs ?? "–"} />
        <StatCard label="Skills tracked" value="–" />
        <StatCard label="Median salary (INR)" value="–" />
        <StatCard label="Fresher roles" value="–" />
      </div>
    </>
  );
}
