# JobScope AI
Job market intelligence and salary prediction. Python (Flask, scikit-learn) backend, React (Vite) frontend.

## Run
```
pip install -r requirements.txt
python app.py                  # API on :5000 (auto-generates sample data and trains the model)
cd frontend && npm install && npm run dev   # UI on :5173
```
Production: `npm run build` in `frontend/`, then `python app.py` serves the UI at :5000.

Sample data is synthetic. Use a real Kaggle dataset at `data/processed/jobs.csv` (columns in `database/schema.sql`), delete `models/salary_model.pkl`, restart.

## Deploy
Backend (Render/Railway): build `pip install -r requirements.txt`, start `gunicorn app:app`.
Frontend (Vercel): root directory `frontend`, then set the backend URL in `frontend/vercel.json`.
