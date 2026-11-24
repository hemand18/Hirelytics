import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { getSkills } from "../api.js";

export default function Skills() {
  const [skills, setSkills] = useState([]);
  useEffect(() => { getSkills().then(d => setSkills(d.skills)).catch(() => {}); }, []);
  return (
    <>
      <h1>Skills Intelligence</h1>
      <p className="muted">Most requested skills in job descriptions</p>
      <div className="card" style={{ height: 360 }}>
        <ResponsiveContainer>
          <BarChart data={skills} layout="vertical" margin={{ left: 40 }}>
            <XAxis type="number" /><YAxis type="category" dataKey="skill" />
            <Tooltip /><Bar dataKey="demand" fill="#5b4cf0" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </>
  );
}
