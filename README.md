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
### Backend on Render

- Create a Web Service from this repository with the repository root as its root directory.
- Build command: `pip install -r requirements.txt`
- Start command: `gunicorn app:app --workers 1 --timeout 180` (also configured in `Procfile`)
- Use `/healthz` as the health check path.
- `.python-version` and `requirements.txt` pin the tested runtime and Python dependencies.

The Vercel rewrite proxies API requests, so browser requests are same-origin and the default `ALLOWED_ORIGIN=*` is sufficient. If you instead set `VITE_API_URL` to call Render directly, set Render's `ALLOWED_ORIGIN` to your Vercel domain.

### Frontend on Vercel

- Set the project root directory to `frontend`.
- Build command: `npm run build`; output directory: `dist`. Vercel will install from the committed `package-lock.json`.
- In `frontend/vercel.json`, replace the Render host with your backend's public URL if it differs. The rewrite must preserve `/api/:path*`.

The API and sample dataset are synthetic/demo data; replace `data/processed/jobs.csv` with your own compatible dataset before using this for real market analysis.
