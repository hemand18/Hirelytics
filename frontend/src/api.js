export const api = (path, body) =>
  fetch("/api" + path, body ? { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) } : undefined)
    .then((r) => { if (!r.ok) throw new Error("Request failed"); return r.json(); });
export const lpa = (n) => (n == null ? "Not disclosed" : `₹${(n / 1e5).toFixed(1)} LPA`);
