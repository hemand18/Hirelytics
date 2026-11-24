# JobScope AI – Job Market Intelligence & Salary Prediction

React frontend + FastAPI backend + Python data science pipeline.

## Run
    # backend (from project root)
    pip install -r requirements.txt
    uvicorn backend.main:app --reload        # http://localhost:8000

    # frontend
    cd frontend && npm install && npm run dev  # http://localhost:5173

## Layout
- data/, notebooks/, src/, models/, database/: data science work (unchanged)
- backend/main.py: API that serves data and predictions (replaces Streamlit app.py)
- frontend/src/pages/: React pages (replaces Streamlit dashboard/)

Dashboards should always show dataset source, collection date, currency and sample size.
