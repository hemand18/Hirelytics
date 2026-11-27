"""JobScope AI / Hirelytics backend (Flask).
Local run: python app.py  -> http://localhost:5000
Render start command: gunicorn app:app --workers 1 --timeout 180

Render > Environment variables:
  API_KEY        (required for /api/external)
  API_URL        (provider address, from its docs)
  API_HEADER     (optional, default "Authorization"; e.g. "x-api-key")
  API_PREFIX     (optional, default "Bearer "; use a single space-free empty value if none)
  ALLOWED_ORIGIN (optional, default "*"; set to your Vercel URL later)
"""
import os
import requests
from dotenv import load_dotenv
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from src.preprocessing import load_data, ROLES, LOCATIONS, EDUCATION, EMPLOYMENT, SOURCE
from src.skill_extraction import SKILL_VOCAB
from src.salary_prediction import load_or_train, predict
from dashboard.overview import overview, jobs
from dashboard.skills import skill_demand, skill_gap
from dashboard.salary import salary_insights

load_dotenv()  # reads .env locally; on Render values come from the Environment tab

DIST = os.path.join(os.path.dirname(__file__), "frontend", "dist")
app = Flask(__name__, static_folder=DIST, static_url_path="")
CORS(app, origins=os.environ.get("ALLOWED_ORIGIN", "*"))

API_KEY = os.environ.get("API_KEY")
API_URL = os.environ.get("API_URL", "")
API_HEADER = os.environ.get("API_HEADER", "Authorization")
API_PREFIX = os.environ.get("API_PREFIX", "Bearer ")

df = load_data()
bundle = load_or_train(df)


@app.get("/healthz")
def healthz():
    return "ok"


@app.get("/api/meta")
def meta():
    return jsonify(source=SOURCE, currency="INR (annual)", collected="2026", rows=len(df),
                   roles=list(ROLES), locations=list(LOCATIONS), education=EDUCATION,
                   employment=EMPLOYMENT, skills=list(SKILL_VOCAB), metrics=bundle["metrics"],
                   n_train=bundle["n_train"], n_test=bundle["n_test"])


@app.get("/api/overview")
def api_overview():
    return jsonify(overview(df))


@app.get("/api/skills")
def api_skills():
    return jsonify(skill_demand(df, request.args.get("role", "")))


@app.get("/api/salary")
def api_salary():
    return jsonify(salary_insights(df))


@app.get("/api/jobs")
def api_jobs():
    a = request.args
    return jsonify(jobs(df, a.get("q", ""), a.get("location", ""), a.get("fresher") == "1"))


@app.post("/api/predict")
def api_predict():
    return jsonify(predict(bundle, request.get_json()))


@app.post("/api/skill-gap")
def api_gap():
    b = request.get_json()
    return jsonify(skill_gap(df, b["role"], b.get("skills", [])))


@app.get("/api/hello")
def hello():
    return jsonify(message="Hello from Hirelytics")


@app.get("/api/external")
def external():
    """Forwards the request to your provider using the API key stored in Render."""
    if not API_KEY or not API_URL:
        return jsonify(error="Set API_KEY and API_URL in Render > Environment"), 503
    try:
        r = requests.get(API_URL, params=request.args,
                         headers={API_HEADER: API_PREFIX + API_KEY}, timeout=10)
        try:
            return jsonify(r.json()), r.status_code
        except ValueError:
            return jsonify(error="Provider did not return JSON", status=r.status_code), 502
    except requests.RequestException:
        return jsonify(error="External API request failed"), 502


@app.get("/", defaults={"path": ""})
@app.get("/<path:path>")
def spa(path):
    if os.path.isdir(DIST):
        return send_from_directory(DIST, path if path and os.path.exists(os.path.join(DIST, path)) else "index.html")
    return jsonify(status="API running", docs="/api/meta"), 200


if __name__ == "__main__":
    app.run(debug=True, port=5000)