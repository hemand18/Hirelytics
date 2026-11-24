import { NavLink } from "react-router-dom";
const links = [
  ["/", "Overview"], ["/market", "Job Market Analytics"], ["/skills", "Skills Intelligence"],
  ["/salary-insights", "Salary Insights"], ["/predict", "Salary Prediction"],
  ["/careers", "Career Recommendations"], ["/jobs", "Job Explorer"], ["/about", "About Project"],
];
export default function Sidebar() {
  return (
    <nav className="sidebar" aria-label="Main">
      <div className="brand">JobScope AI</div>
      {links.map(([to, label]) => (
        <NavLink key={to} to={to} end={to === "/"} className={({ isActive }) => "navlink" + (isActive ? " active" : "")}>{label}</NavLink>
      ))}
    </nav>
  );
}
