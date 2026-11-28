import { useEffect, useState } from "react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";
import { LayoutDashboard, TrendingUp, Sparkles, IndianRupee, Target, Compass, Briefcase, Info, Search, Rocket, MapPin, Percent, Users, Star } from "lucide-react";
import { api, lpa } from "./api";

const NAV = [["Overview", LayoutDashboard], ["Job Market Analytics", TrendingUp], ["Skills Intelligence", Sparkles], ["Salary Insights", IndianRupee],
  ["Salary Prediction", Target], ["Career Recommendations", Compass], ["Job Explorer", Briefcase], ["About Project", Info]];
const COL = ["#6c4cf5", "#a78bfa", "#f59e0b", "#22c55e", "#38bdf8"];
const tip = { contentStyle: { borderRadius: 10, border: "1px solid #e6e8f7" } };

function useFetch(path, deps = []) {
  const [data, setData] = useState(null), [error, setError] = useState("");
  useEffect(() => { setData(null); setError(""); api(path).then(setData).catch(() => setError("Could not reach the API. Check VITE_API_URL in Vercel and that the Render service is live.")); }, deps);
  return [data, error];
}
const has = (d, keys) => d && !d.error && keys.every((k) => d[k] !== undefined && d[k] !== null);
const Wait = ({ e }) => (e ? <p className="err">{e}</p> : <p className="note">Loading… (the free server may take up to a minute to wake)</p>);
const Bad = ({ d }) => <p className="err">Unexpected data from the backend: {JSON.stringify(d)?.slice(0, 200)}</p>;
const Head = ({ t, s }) => (<><h2>{t}</h2><p className="sub">{s}</p></>);
const Kpi = ({ icon: I, color = "#6c4cf5", label, value }) => (
  <div className="card kpi"><div className="ic" style={{ background: color + "1f", color }}><I size={20} /></div><div><b>{value}</b><span>{label}</span></div></div>);

function Rank({ items = [], vkey = "value", fmt = (v) => v, max }) {
  const m = max || Math.max(...items.map((i) => i[vkey]), 1);
  return items.map((it, i) => (
    <div className="rank" key={it.name}><span className="n">{i + 1}</span><span>{it.name}</span><span className="v">{fmt(it[vkey])}</span>
      <div className="bar"><i style={{ width: (100 * it[vkey]) / m + "%", background: COL[i % COL.length] }} /></div></div>));
}
const Trend = ({ data }) => (
  <ResponsiveContainer width="100%" height={230}><AreaChart data={data}><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6c4cf5" stopOpacity=".35" /><stop offset="100%" stopColor="#6c4cf5" stopOpacity="0" /></linearGradient></defs>
    <CartesianGrid stroke="#eef0fb" vertical={false} /><XAxis dataKey="name" stroke="#6b7099" fontSize={12} /><YAxis stroke="#6b7099" fontSize={12} /><Tooltip {...tip} />
    <Area dataKey="value" stroke="#6c4cf5" strokeWidth={2.5} fill="url(#g)" /></AreaChart></ResponsiveContainer>);
const Illustration = () => (
  <svg viewBox="0 0 320 200" width="100%" role="img" aria-label="Rising bar chart"><circle cx="230" cy="90" r="80" fill="#e4defe" />
    {[50, 85, 120, 160].map((h, i) => <rect key={i} x={70 + i * 42} y={170 - h} width="28" height={h} rx="6" fill={COL[i % 2 ? 1 : 0]} />)}
    <path d="M60 110 L110 85 L150 95 L225 40" stroke="#22c55e" strokeWidth="5" fill="none" strokeLinecap="round" /><circle cx="225" cy="40" r="8" fill="#22c55e" /></svg>);

function Overview({ go }) {
  const [d, e] = useFetch("/overview"), [s] = useFetch("/salary"), [k] = useFetch("/skills");
  if (!d || !s || !k) return <Wait e={e} />;
  if (!has(d, ["monthly", "roles"]) || !has(s, ["median"]) || !Array.isArray(k)) return <Bad d={d} />;
  return (<>
    <div className="card hero"><div><h1>Welcome to <b>JobScope AI</b></h1><p>Your AI-powered job market intelligence platform to explore trends, predict salaries, and plan your career better.</p>
      <button className="btn" onClick={() => go("Job Market Analytics")}>Explore Dashboard →</button><button className="btn ghost" onClick={() => go("About Project")}>Learn More</button></div><Illustration /></div>
    <div className="kpis" style={{ marginTop: 16 }}>
      <Kpi icon={Briefcase} label="Listings analysed" value={d.total} /><Kpi icon={IndianRupee} color="#22c55e" label="Median salary" value={lpa(s.median)} />
      <Kpi icon={Percent} color="#f59e0b" label="Open to freshers" value={d.fresher_share + "%"} /><Kpi icon={Star} color="#38bdf8" label="Top skill" value={k[0]?.name ?? "-"} /></div>
    <div className="grid"><div className="card"><h3>Market at a glance · listings per month</h3><Trend data={d.monthly} /></div>
      <div className="card"><h3>Trending skills</h3><Rank items={k.slice(0, 5)} vkey="share" fmt={(v) => v + "%"} max={100} /></div></div></>);
}

function Market() {
  const [d, e] = useFetch("/overview");
  if (!d) return <Wait e={e} />;
  if (!has(d, ["companies", "locations", "experience", "monthly"])) return <Bad d={d} />;
  return (<><Head t="Job Market Analytics" s="Explore hiring trends across companies, cities and experience levels." />
    <div className="kpis"><Kpi icon={Briefcase} label="Total job postings" value={d.total} /><Kpi icon={Percent} color="#f59e0b" label="Fresher share" value={d.fresher_share + "%"} />
      <Kpi icon={MapPin} color="#22c55e" label="Top hiring city" value={d.locations[0]?.name} /><Kpi icon={Users} color="#38bdf8" label="Top role" value={d.roles[0]?.name} /></div>
    <div className="grid"><div className="card"><h3>Job trends over time</h3><Trend data={d.monthly} /></div>
      <div className="card"><h3>Top hiring companies</h3><Rank items={d.companies.slice(0, 6)} /></div>
      <div className="card"><h3>Jobs by location</h3><Rank items={d.locations} /></div>
      <div className="card"><h3>Experience-level distribution</h3><Rank items={d.experience} /></div></div></>);
}

function Skills({ meta, go }) {
  const [role, setRole] = useState("");
  const [d, e] = useFetch("/skills?role=" + encodeURIComponent(role), [role]);
  return (<><Head t="Skills Intelligence" s="Discover in-demand skills and skill gaps in the job market." />
    <div className="grid" style={{ marginTop: 0 }}><div className="card"><div className="row" style={{ marginBottom: 12 }}><div><label>Job role</label>
      <select value={role} onChange={(x) => setRole(x.target.value)}><option value="">All roles</option>{meta.roles.map((r) => <option key={r}>{r}</option>)}</select></div></div>
      <h3>Top in-demand skills</h3>{!d ? <Wait e={e} /> : !Array.isArray(d) ? <Bad d={d} /> : <Rank items={d.slice(0, 8)} vkey="share" fmt={(v) => v + "%"} max={100} />}</div>
      <div className="card"><h3>Skill gap analysis</h3><p>Mark the skills you already have and see which ones to learn next for your target role.</p>
        <button className="btn" onClick={() => go("Career Recommendations")}>Start Learning →</button></div></div></>);
}

function Salary({ meta }) {
  const [d, e] = useFetch("/salary"), [role, setRole] = useState(meta.roles[0]);
  if (!d) return <Wait e={e} />;
  if (!has(d, ["by_role", "by_experience", "by_location"])) return <Bad d={d} />;
  const cur = d.by_role.find((r) => r.name === role), meds = d.by_role.map((r) => r.median);
  return (<><Head t="Salary Insights" s={`Explore salary trends. Based on ${d.with_salary} listings with disclosed pay (${d.missing} undisclosed, excluded).`} />
    <div className="row" style={{ maxWidth: 340, marginBottom: 16 }}><div><label>Role</label><select value={role} onChange={(x) => setRole(x.target.value)}>{meta.roles.map((r) => <option key={r}>{r}</option>)}</select></div></div>
    <div className="kpis"><Kpi icon={IndianRupee} color="#22c55e" label={`Median salary · ${role}`} value={cur ? lpa(cur.median) : "n/a"} />
      <Kpi icon={TrendingUp} label="Range across roles" value={`${lpa(Math.min(...meds))} – ${lpa(Math.max(...meds))}`} /></div>
    <div className="grid"><div className="card"><h3>Median salary by experience (years)</h3>
      <ResponsiveContainer width="100%" height={240}><BarChart data={d.by_experience}><XAxis dataKey="name" stroke="#6b7099" fontSize={12} /><YAxis stroke="#6b7099" fontSize={12} tickFormatter={lpa} width={80} /><Tooltip {...tip} formatter={lpa} />
        <Bar dataKey="median" radius={6}>{d.by_experience.map((_, i) => <Cell key={i} fill={COL[i % COL.length]} />)}</Bar></BarChart></ResponsiveContainer></div>
      <div className="card"><h3>Median salary by location</h3><Rank items={d.by_location} vkey="median" fmt={lpa} /></div>
      <div className="card"><h3>Median salary by role</h3><Rank items={d.by_role} vkey="median" fmt={lpa} /></div></div></>);
}

function Predict({ meta }) {
  const [p, setP] = useState({ role: meta.roles[0], location: "Chennai", education: meta.education[0], employment_type: "Full-time", experience: 0, skills: [] });
  const [r, setR] = useState(null), [err, setErr] = useState("");
  const set = (k, v) => setP({ ...p, [k]: v });
  const toggle = (s) => set("skills", p.skills.includes(s) ? p.skills.filter((x) => x !== s) : [...p.skills, s]);
  const sel = (k, opts, lab) => (<div><label>{lab}</label><select value={p[k]} onChange={(x) => set(k, x.target.value)}>{opts.map((o) => <option key={o}>{o}</option>)}</select></div>);
  return (<><Head t="Salary Prediction" s="Find your estimated salary based on skills and experience." />
    <div className="grid" style={{ marginTop: 0 }}><div className="card">
      <div className="row">{sel("role", meta.roles, "Select job role")}{sel("location", meta.locations, "Location")}</div>
      <div className="row">{sel("education", meta.education, "Education")}{sel("employment_type", meta.employment, "Employment type")}</div>
      <label>Years of experience</label><input type="number" min="0" max="30" value={p.experience} onChange={(x) => set("experience", x.target.value)} />
      <label>Key skills</label><div className="chips">{meta.skills.map((s) => <button key={s} className={"chip" + (p.skills.includes(s) ? " on" : "")} onClick={() => toggle(s)}>{s}</button>)}</div>
      <button className="btn" style={{ marginTop: 16, width: "100%" }} onClick={() => { setErr(""); setR(null); api("/predict", p).then(setR).catch(() => setErr("Prediction failed. Check that the backend is live.")); }}>Predict Salary</button></div>
      <div className="card"><h3>Predicted salary</h3>{has(r, ["low", "mid", "high"]) ? <><div className="big">{lpa(r.low)} – {lpa(r.high)}</div><p>per year · most likely around {lpa(r.mid)}</p></> : <p className="note">Your estimate will appear here.</p>}
        {err && <p className="err">{err}</p>}<p className="note">Random Forest. Test MAE {lpa(meta.metrics.MAE)}, RMSE {lpa(meta.metrics.RMSE)}, R² {meta.metrics.R2.toFixed(2)}. The range is the spread across the model's trees, not a guarantee. Trained on {meta.source.toLowerCase()}.</p></div></div></>);
}

function Career({ meta }) {
  const [have, setHave] = useState([]), [res, setRes] = useState(null), [err, setErr] = useState("");
  const toggle = (s) => setHave(have.includes(s) ? have.filter((x) => x !== s) : [...have, s]);
  const run = () => { setErr(""); Promise.all(meta.roles.map((role) => api("/skill-gap", { role, skills: have }).then((g) => ({ role, ...g }))))
    .then((all) => setRes(all.sort((a, b) => b.match - a.match))).catch(() => setErr("Analysis failed. Check that the backend is live.")); };
  return (<><Head t="Career Recommendations" s="Personalised career advice based on your skills and market demand." />
    <div className="grid" style={{ marginTop: 0 }}><div className="card"><h3>Your profile</h3><label>Skills you already have</label>
      <div className="chips">{meta.skills.map((s) => <button key={s} className={"chip" + (have.includes(s) ? " on" : "")} onClick={() => toggle(s)}>{s}</button>)}</div>
      <button className="btn" style={{ marginTop: 16 }} onClick={run}>Analyse my skills</button>{err && <p className="err">{err}</p>}</div>
      <div className="card"><h3>Recommended career paths</h3>{res ? res.slice(0, 3).map((g, i) => (<div key={g.role} style={{ marginBottom: 16 }}>
        <div className="rank" style={{ marginBottom: 4 }}><span className="n">{i + 1}</span><b>{g.role}</b><span className="v">{g.match}%</span><div className="bar"><i style={{ width: g.match + "%", background: COL[i] }} /></div></div>
        <span className="note">{g.missing.length ? "Learn next: " + g.missing.slice(0, 3).map((m) => m.name).join(", ") : "You cover the top skills."}</span></div>)) : <p className="note">Pick your skills and run the analysis.</p>}</div></div></>);
}

function Explorer({ meta, initialQ }) {
  const [q, setQ] = useState(initialQ || ""), [loc, setLoc] = useState(""), [fr, setFr] = useState(false);
  useEffect(() => setQ(initialQ || ""), [initialQ]);
  const [d, e] = useFetch(`/jobs?q=${encodeURIComponent(q)}&location=${encodeURIComponent(loc)}&fresher=${fr ? 1 : 0}`, [q, loc, fr]);
  return (<><Head t="Job Explorer" s="Find job opportunities by title or skill. Use Freshers only for entry-level roles." />
    <div className="card row" style={{ marginBottom: 16 }}>
      <div><label>Title or skill</label><input type="text" value={q} onChange={(x) => setQ(x.target.value)} placeholder="e.g. Data Analyst, SQL" /></div>
      <div><label>Location</label><select value={loc} onChange={(x) => setLoc(x.target.value)}><option value="">All locations</option>{meta.locations.map((l) => <option key={l}>{l}</option>)}</select></div>
      <div><button className={"chip" + (fr ? " on" : "")} onClick={() => setFr(!fr)}>Freshers only</button></div></div>
    {!d ? <Wait e={e} /> : !has(d, ["rows", "count"]) ? <Bad d={d} /> : <div className="card"><p className="note">{d.count} matching listings (showing latest {d.rows.length})</p>
      {d.rows.map((j, i) => (<div className="job" key={i}><div className="logo2">{j.company[0]}</div>
        <div className="t"><b>{j.job_title}</b><span>{j.company} · {j.location} · {j.experience}y exp · {j.skills}</span></div><span className="tag">{j.employment_type}</span>
        <span className="sal">{j.salary_min ? `${lpa(j.salary_min)} – ${lpa(j.salary_max)}` : "Not disclosed"}</span></div>))}</div>}</>);
}

function About({ meta, go }) {
  const rows = [["Data source", meta.source], ["Collection year", meta.collected], ["Salary currency", meta.currency], ["Sample size", `${meta.rows} listings`], ["Model split", `${meta.n_train} train / ${meta.n_test} test, grouped by company`]];
  return (<><div className="card hero"><div><h1>JobScope <b>AI</b></h1><p>Job market intelligence and salary prediction platform for Indian job seekers: market trends, in-demand skills, salary estimates and career guidance.</p>
    <button className="btn" onClick={() => go("Overview")}><Rocket size={14} style={{ verticalAlign: -2 }} /> Back to dashboard</button></div><Illustration /></div>
    <div className="card" style={{ marginTop: 16 }}><h3>Data and model</h3>{rows.map(([k, v]) => <div className="rank" key={k} style={{ gridTemplateColumns: "160px 1fr" }}><span className="note">{k}</span><span>{v}</span></div>)}
      <p className="note">This demo runs on generated data. Put a real dataset at data/processed/jobs.csv (same columns) and retrain to use it.</p></div></>);
}

export default function App() {
  const [page, setPage] = useState("Overview"), [q, setQ] = useState(""), [sq, setSq] = useState("");
  const [meta, err] = useFetch("/meta");
  const ok = has(meta, ["roles", "locations", "education", "employment", "skills", "metrics"]);
  const go = (p) => setPage(p);
  const view = { "Overview": <Overview go={go} />, "Job Market Analytics": <Market />, "Skills Intelligence": ok && <Skills meta={meta} go={go} />, "Salary Insights": ok && <Salary meta={meta} />,
    "Salary Prediction": ok && <Predict meta={meta} />, "Career Recommendations": ok && <Career meta={meta} />, "Job Explorer": ok && <Explorer meta={meta} initialQ={sq} />, "About Project": ok && <About meta={meta} go={go} /> }[page];
  return (<div className="shell"><nav><div className="logo"><i><TrendingUp size={17} /></i>JobScope AI</div>
    {NAV.map(([n, I]) => <button key={n} className={"item" + (n === page ? " on" : "")} onClick={() => go(n)}><I size={17} />{n}</button>)}
    <div className="promo">Build a Smarter Career with Data-Driven Insights<br /><button onClick={() => go("Overview")}>Explore Now</button></div></nav>
    <div><div className="top"><form className="search" onSubmit={(x) => { x.preventDefault(); setSq(q); go("Job Explorer"); }}><Search size={16} />
      <input value={q} onChange={(x) => setQ(x.target.value)} placeholder="Search jobs or skills…" aria-label="Search jobs" /></form><div className="avatar">J</div></div>
      <main>{err ? <p className="err">{err}</p> : !meta ? <Wait /> : !ok ? <Bad d={meta} /> : view}</main></div></div>);
}