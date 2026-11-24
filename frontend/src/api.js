export const getSkills = () => fetch("/api/skills").then(r => r.json());
export const getOverview = () => fetch("/api/overview").then(r => r.json());
export const predictSalary = (profile) =>
  fetch("/api/predict-salary", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(profile) }).then(r => r.json());
