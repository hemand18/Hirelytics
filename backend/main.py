"""FastAPI backend (replaces Streamlit app.py). Run: uvicorn backend.main:app --reload"""
import sys, os
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from src.salary_prediction import load_model

app = FastAPI(title="JobScope AI")
app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:5173"],
                   allow_methods=["*"], allow_headers=["*"])
model = load_model()

# SAMPLE DATA: replace with MySQL queries once your dataset is loaded.
SKILLS = [
    {"skill": "Python", "demand": 92, "avg_salary_lpa": 8.6},
    {"skill": "SQL", "demand": 88, "avg_salary_lpa": 7.2},
    {"skill": "Excel", "demand": 75, "avg_salary_lpa": 5.1},
    {"skill": "Power BI", "demand": 68, "avg_salary_lpa": 6.4},
    {"skill": "Machine Learning", "demand": 61, "avg_salary_lpa": 11.2},
]

@app.get("/api/overview")
def overview():
    return {"is_sample": True, "total_jobs": 0, "roles": [], "source": "sample data"}

@app.get("/api/skills")
def skills():
    return {"is_sample": True, "skills": SKILLS}

class Profile(BaseModel):
    role: str
    experience: float
    skills: list[str] = []
    location: str = "Chennai"

@app.post("/api/predict-salary")
def predict_salary(p: Profile):
    if model is None:  # placeholder until the real model is trained
        mid = 3.0 + p.experience * 1.2 + len(p.skills) * 0.3
        return {"low_lpa": round(mid * 0.85, 1), "high_lpa": round(mid * 1.15, 1),
                "is_placeholder": True}
    raise NotImplementedError("Wire feature engineering + model here")
