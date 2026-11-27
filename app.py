"""JobScope AI backend (Flask). Run: python app.py  -> http://localhost:5000"""
import os
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from src.preprocessing import load_data, ROLES, LOCATIONS, EDUCATION, EMPLOYMENT, SOURCE
from src.skill_extraction import SKILL_VOCAB
from src.salary_prediction import load_or_train, predict
from dashboard.overview import overview, jobs
from dashboard.skills import skill_demand, skill_gap
from dashboard.salary import salary_insights

DIST = os.path.join(os.path.dirname(__file__), "frontend", "dist")
app = Flask(__name__, static_folder=DIST, static_url_path="")
CORS(app)
df = load_data()
bundle = load_or_train(df)


@app.get("/api/meta")
def meta():
    return jsonify(source=SOURCE, currency="INR (annual)", collected="2026", rows=len(df),
                   roles=list(ROLES), locations=list(LOCATIONS), education=EDUCATION,
                   employment=EMPLOYMENT, skills=list(SKILL_VOCAB), metrics=bundle["metrics"],
                   n_train=bundle["n_train"], n_test=bundle["n_test"])

@app.get("/api/overview")
def api_overview(): return jsonify(overview(df))

@app.get("/api/skills")
def api_skills(): return jsonify(skill_demand(df, request.args.get("role", "")))

@app.get("/api/salary")
def api_salary(): return jsonify(salary_insights(df))

@app.get("/api/jobs")
def api_jobs():
    a = request.args
    return jsonify(jobs(df, a.get("q", ""), a.get("location", ""), a.get("fresher") == "1"))

@app.post("/api/predict")
def api_predict(): return jsonify(predict(bundle, request.get_json()))

@app.post("/api/skill-gap")
def api_gap():
    b = request.get_json()
    return jsonify(skill_gap(df, b["role"], b.get("skills", [])))

@app.get("/", defaults={"path": ""})
@app.get("/<path:path>")
def spa(path):
    if os.path.isdir(DIST):
        return send_from_directory(DIST, path if path and os.path.exists(os.path.join(DIST, path)) else "index.html")
    return "Run the React dev server: cd frontend && npm run dev", 200

if __name__ == "__main__":
    app.run(debug=True, port=5000)
