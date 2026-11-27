"""Data generation, loading and cleaning. Salaries are annual INR."""
import numpy as np
import pandas as pd

ROLES = {  # role: (base LPA for freshers, typical skills)
    "Data Analyst": (3.8, ["SQL", "Excel", "Power BI", "Python", "Tableau", "Statistics"]),
    "Data Scientist": (6.5, ["Python", "Machine Learning", "SQL", "Statistics", "Deep Learning", "NLP"]),
    "Business Analyst": (4.2, ["SQL", "Excel", "Power BI", "Tableau", "Statistics"]),
    "Python Developer": (4.5, ["Python", "SQL", "Git", "Docker", "AWS"]),
    "Machine Learning Engineer": (8.0, ["Python", "Machine Learning", "Deep Learning", "Docker", "AWS", "Git"]),
    "Data Engineer": (7.0, ["Python", "SQL", "Spark", "AWS", "Docker", "Git"]),
    "AI Engineer": (9.0, ["Python", "Deep Learning", "NLP", "Machine Learning", "Docker", "AWS"]),
}
LOCATIONS = {"Chennai": 1.0, "Bengaluru": 1.18, "Hyderabad": 1.1, "Pune": 1.05, "Mumbai": 1.12, "Delhi NCR": 1.08, "Coimbatore": 0.88}
COMPANIES = ["Zoho", "Freshworks", "TCS", "Infosys", "Wipro", "Cognizant", "HCLTech", "Mu Sigma", "Fractal", "Tiger Analytics", "Accenture", "Capgemini", "Ford Business Solutions", "PayPal India", "Amazon"]
EDUCATION = ["B.E/B.Tech", "B.Sc", "BCA", "M.E/M.Tech", "M.Sc", "MBA"]
EMPLOYMENT = ["Full-time", "Contract", "Internship"]
SOURCE = "Synthetic sample dataset (generated, not real market data)"


def generate_sample_data(n=1500, seed=42):
    """Synthetic demo data so the app runs end-to-end. Replace with Kaggle data."""
    rng = np.random.default_rng(seed)
    rows = []
    for i in range(n):
        role = rng.choice(list(ROLES))
        base, pool = ROLES[role]
        loc = rng.choice(list(LOCATIONS), p=[.28, .22, .14, .1, .1, .09, .07])
        exp = float(rng.choice([0, 0, 1, 1, 2, 3, 4, 5, 7, 10]))
        k = rng.integers(3, len(pool) + 1)
        skills = list(rng.choice(pool, size=k, replace=False))
        emp = rng.choice(EMPLOYMENT, p=[.85, .09, .06])
        mid = base * (1 + .16 * exp) * LOCATIONS[loc] * (1 + .02 * len(skills)) * rng.normal(1, .08)
        if emp == "Internship":
            mid *= .3
        smin, smax = mid * .85, mid * 1.15
        if rng.random() < .15:  # missing salary stays missing, never zero
            smin = smax = np.nan
        date = pd.Timestamp("2026-01-01") + pd.Timedelta(days=int(rng.integers(0, 330)))
        rows.append(dict(
            job_id=i, job_title=role, company=rng.choice(COMPANIES), location=loc,
            experience=exp, skills=", ".join(skills), employment_type=emp,
            education=rng.choice(EDUCATION), posted_date=date.date().isoformat(),
            salary_min=None if np.isnan(smin) else round(smin * 1e5, -3),
            salary_max=None if np.isnan(smax) else round(smax * 1e5, -3),
            job_description=f"We are hiring a {role} with {exp:g} years experience. Skills: {', '.join(skills)}."))
    return pd.DataFrame(rows)


def clean(df):
    df = df.drop_duplicates(subset=["job_title", "company", "location", "posted_date", "skills"]).copy()
    df["posted_date"] = pd.to_datetime(df["posted_date"])
    df["salary_mid"] = (df["salary_min"] + df["salary_max"]) / 2  # NaN stays NaN
    df["skills_list"] = df["skills"].fillna("").apply(lambda s: [x.strip() for x in s.split(",") if x.strip()])
    return df.reset_index(drop=True)


def load_data(path="data/processed/jobs.csv"):
    import os
    if not os.path.exists(path):
        os.makedirs(os.path.dirname(path), exist_ok=True)
        generate_sample_data().to_csv(path, index=False)
    return clean(pd.read_csv(path))
