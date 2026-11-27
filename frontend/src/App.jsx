import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from "recharts";
import { api, lpa } from "./api";

const PAGES = ["Overview", "Job Market Analytics", "Skills Intelligence", "Salary Insights", "Salary Prediction", "Career Recommendations", "Job Explorer", "About Project"];
const tip = { contentStyle: { background: "#0d1030", border: "1px solid #262c5c", borderRadius: 8 }, cursor: { fill: "#ffffff0d" } };

function useFetch(path, deps = []) {
  const [data, setData] = useState(null), [error, setError] = useState("");
  useEffect(() => { setData(null); api(path).then(setData).catch(() => setError("Could not reach the API. Start the backend with: python app.py")); }, deps);
  return [data, error];
}
const Load = ({ d, e }) => (e ? <p className="err">{e}</p> : !d ? <p className="note">Loading…</p> : null);

function Bars({ title, data, x = "name", y = "value", fmt, horizontal = true }) {
  return (
    <div className="card"><h3>{title}</h3>
      <ResponsiveContainer width="100%" height={Math.max(220, horizontal ? data.length * 32 : 240)}>
        <BarChart data={data} layout={horizontal ? "vertical" : "horizontal"} margin={{ left: 10 }}>
          {horizontal ? <><XAxis type="number" hide /><YAxis type="category" dataKey={x} width={130} stroke="#8f94bf" fontSize={12} /></>
            : <><XAxis dataKey={x} stroke="#8f94bf" fontSize={12} /><YAxis stroke="#8f94bf" fontSize={12} tickFormatter={fmt} /></>}
          <Tooltip {...tip} formatter={fmt} /><Bar dataKey={y} fill="#7c5cff" radius={4} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
const Head = ({ t, s }) => (<><h2>{t}</h2><p className="sub">{s}</p></>);

function Overview({ market }) {
  const [d, e] = useFetch("/overview");
  if (!d) return <Load d={d} e={e} />;
  return (<>
    <Head t="Hiring at a glance" s={`${d.total} job listings analysed · ${market}`} />
    <div className="kpis">
      <div className="kpi"><b>{d.total}</b><span>Listings analysed</span></div>
      <div className="kpi"><b>{d.roles[0].name}</b><span>Most advertised role</span></div>
      <div className="kpi"><b>{d.fresher_share}%</b><span>Open to freshers</span></div>
      <div className="kpi"><b>{d.locations[0].name}</b><span>Top hiring city</span></div>
    </div>
    <div className="grid">
      <div className="card"><h3>Listings posted per month</h3>
        <ResponsiveContainer width="100%" height={240}><LineChart data={d.monthly}><CartesianGrid stroke="#262c5c" /><XAxis dataKey="name" stroke="#8f94bf" fontSize={12} /><YAxis stroke="#8f94bf" fontSize={12} /><Tooltip {...tip} /><Line dataKey="value" stroke="#b9a8ff" strokeWidth={2} dot={false} /></LineChart></ResponsiveContainer></div>
      <Bars title="Most popular roles" data={d.roles} />
    </div></>);
}

function Market() {
  const [d, e] = useFetch("/overview");
  if (!d) return <Load d={d} e={e} />;
  return (<><Head t="Job market analytics" s="Where hiring happens, and at what experience level." />
    <div className="grid"><Bars title="Top hiring companies" data={d.companies} /><Bars title="Jobs by location" data={d.locations} />
      <Bars title="Experience-level distribution" data={d.experience} horizontal={false} /></div></>);
}

function Skills({ meta }) {
  const [role, setRole] = useState("");
  const [d, e] = useFetch("/skills?role=" + encodeURIComponent(role), [role]);
  return (<><Head t="Skills intelligence" s="Skills most requested in job listings." />
    <div className="card" style={{ marginBottom: 16, maxWidth: 360 }}><label>Job role</label>
      <select value={role} onChange={(x) => setRole(x.target.value)}><option value="">All roles</option>{meta.roles.map((r) => <option key={r}>{r}</option>)}</select></div>
    {d ? <Bars title={`Skill demand${role ? " · " + role : ""} (share of listings, %)`} data={d} y="share" fmt={(v) => v + "%"} /> : <Load d={d} e={e} />}</>);
}

function Salary() {
  const [d, e] = useFetch("/salary");
  if (!d) return <Load d={d} e={e} />;
  const f = (v) => lpa(v);
  return (<><Head t="Salary insights" s={`Median salary ${lpa(d.median)} · based on ${d.with_salary} listings with disclosed pay (${d.missing} undisclosed, excluded)`} />
    <div className="grid"><Bars title="Median salary by role" data={d.by_role} y="median" fmt={f} />
      <Bars title="Median salary by experience (years)" data={d.by_experience} y="median" fmt={f} horizontal={false} />
      <Bars title="Median salary by location" data={d.by_location} y="median" fmt={f} />
      <Bars title="Top-paying companies" data={d.by_company} y="median" fmt={f} /></div></>);
}

function Predict({ meta }) {
  const [p, setP] = useState({ role: meta.roles[0], location: "Chennai", education: meta.education[0], employment_type: "Full-time", experience: 0, skills: [] });
  const [r, setR] = useState(null), [err, setErr] = useState("");
  const set = (k, v) => setP({ ...p, [k]: v });
  const toggle = (s) => set("skills", p.skills.includes(s) ? p.skills.filter((x) => x !== s) : [...p.skills, s]);
  const sel = (k, opts, lab) => (<div><label>{lab}</label><select value={p[k]} onChange={(x) => set(k, x.target.value)}>{opts.map((o) => <option key={o}>{o}</option>)}</select></div>);
  return (<><Head t="Salary prediction" s="Enter a profile to get an estimated annual salary range." />
    <div className="grid"><div className="card">
      <div className="row">{sel("role", meta.roles, "Job role")}{sel("location", meta.locations, "Location")}</div>
      <div className="row">{sel("education", meta.education, "Education")}{sel("employment_type", meta.employment, "Employment type")}</div>
      <label>Years of experience</label><input type="number" min="0" max="30" value={p.experience} onChange={(x) => set("experience", x.target.value)} />
      <label>Skills</label><div className="chips">{meta.skills.map((s) => <button key={s} className={"chip" + (p.skills.includes(s) ? " on" : "")} onClick={() => toggle(s)}>{s}</button>)}</div>
      <button className="btn" onClick={() => { setErr(""); api("/predict", p).then(setR).catch(() => setErr("Prediction failed. Is the backend running?")); }}>Estimate salary</button>
    </div>
    <div className="card"><h3>Estimated range</h3>
      {r ? <><div className="result">{lpa(r.low)} – {lpa(r.high)}</div><p>Most likely around {lpa(r.mid)}.</p></> : <p className="note">Your estimate will appear here.</p>}
      {err && <p className="err">{err}</p>}
      <p className="note">Model: Random Forest. Test MAE {lpa(meta.metrics.MAE)}, RMSE {lpa(meta.metrics.RMSE)}, R² {meta.metrics.R2.toFixed(2)}. The range is the spread across the model's trees, not a guarantee. Trained on {meta.source.toLowerCase()}.</p></div></div></>);
}

function Career({ meta }) {
  const [role, setRole] = useState(meta.roles[0]), [have, setHave] = useState([]), [r, setR] = useState(null);
  const toggle = (s) => setHave(have.includes(s) ? have.filter((x) => x !== s) : [...have, s]);
  return (<><Head t="Career recommendations" s="Compare your skills with what your target role asks for." />
    <div className="grid"><div className="card"><label>Target role</label>
      <select value={role} onChange={(x) => setRole(x.target.value)}>{meta.roles.map((o) => <option key={o}>{o}</option>)}</select>
      <label>Skills you already have</label><div className="chips">{meta.skills.map((s) => <button key={s} className={"chip" + (have.includes(s) ? " on" : "")} onClick={() => toggle(s)}>{s}</button>)}</div>
      <button className="btn" onClick={() => api("/skill-gap", { role, skills: have }).then(setR)}>Analyse my skills</button></div>
      <div className="card"><h3>Your match</h3>{r ? <><div className="result">{r.match}%</div>
        <p>{r.missing.length ? "Learn these next, in this order:" : "You cover every top skill for this role."}</p>
        {r.missing.map((m) => (<div key={m.name} style={{ marginBottom: 10 }}><b>{m.name}</b> <span className="note">asked in {m.share}% of {role} listings</span><div className="bar"><i style={{ width: m.share + "%" }} /></div></div>))}</>
        : <p className="note">Pick your skills and run the analysis.</p>}</div></div></>);
}

function Explorer({ meta }) {
  const [q, setQ] = useState(""), [loc, setLoc] = useState(""), [fr, setFr] = useState(false);
  const [d, e] = useFetch(`/jobs?q=${encodeURIComponent(q)}&location=${encodeURIComponent(loc)}&fresher=${fr ? 1 : 0}`, [q, loc, fr]);
  return (<><Head t="Job explorer" s="Search listings by title or skill. Use the fresher filter for entry-level roles." />
    <div className="card row" style={{ marginBottom: 16 }}>
      <div><label>Title or skill</label><input type="text" value={q} onChange={(x) => setQ(x.target.value)} placeholder="e.g. SQL" /></div>
      <div><label>Location</label><select value={loc} onChange={(x) => setLoc(x.target.value)}><option value="">All locations</option>{meta.locations.map((l) => <option key={l}>{l}</option>)}</select></div>
      <div><button className={"chip" + (fr ? " on" : "")} onClick={() => setFr(!fr)}>Freshers only</button></div></div>
    {d ? <div className="card scroll"><p className="note">{d.count} matching listings (showing latest {d.rows.length})</p>
      <table><thead><tr><th>Role</th><th>Company</th><th>City</th><th>Exp</th><th>Skills</th><th>Salary</th></tr></thead>
        <tbody>{d.rows.map((j, i) => (<tr key={i}><td>{j.job_title}</td><td>{j.company}</td><td>{j.location}</td><td>{j.experience}y</td><td>{j.skills}</td>
          <td>{j.salary_min ? `${lpa(j.salary_min)} – ${lpa(j.salary_max)}` : "Not disclosed"}</td></tr>))}</tbody></table></div> : <Load d={d} e={e} />}</>);
}

function About({ meta }) {
  const rows = [["Data source", meta.source], ["Collection year", meta.collected], ["Salary currency", meta.currency], ["Sample size", `${meta.rows} listings`],
    ["Model split", `${meta.n_train} train / ${meta.n_test} test, grouped by company to prevent leakage`]];
  return (<><Head t="About this project" s="JobScope AI: job market intelligence and salary prediction for Indian job seekers." />
    <div className="card"><table><tbody>{rows.map(([k, v]) => <tr key={k}><th>{k}</th><td>{v}</td></tr>)}</tbody></table>
      <p className="note">This demo runs on generated data. Put a real dataset at data/processed/jobs.csv (same columns) and delete models/salary_model.pkl to retrain.</p></div></>);
}

export default function App() {
  const [page, setPage] = useState(PAGES[0]);
  const [meta, err] = useFetch("/meta");
  const view = { "Overview": <Overview market={meta?.source} />, "Job Market Analytics": <Market />, "Skills Intelligence": meta && <Skills meta={meta} />,
    "Salary Insights": <Salary />, "Salary Prediction": meta && <Predict meta={meta} />, "Career Recommendations": meta && <Career meta={meta} />,
    "Job Explorer": meta && <Explorer meta={meta} />, "About Project": meta && <About meta={meta} /> }[page];
  return (<div className="shell"><nav><h1>JobScope <b>AI</b></h1>
    {PAGES.map((p) => <button key={p} className={p === page ? "on" : ""} onClick={() => setPage(p)}>{p}</button>)}</nav>
    <main>{err ? <p className="err">{err}</p> : meta ? view : <p className="note">Loading…</p>}</main></div>);
}
