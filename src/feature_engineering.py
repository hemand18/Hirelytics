import pandas as pd
from .skill_extraction import SKILL_VOCAB

SKILLS = list(SKILL_VOCAB)
CATEGORICAL = ["job_title", "location", "education", "employment_type"]


def build_features(df):
    X = df[["experience"]].copy()
    for s in SKILLS:
        X["skill_" + s] = df["skills_list"].apply(lambda l, s=s: int(s in l))
    X["n_skills"] = df["skills_list"].apply(len)
    return pd.concat([X, pd.get_dummies(df[CATEGORICAL].astype(str))], axis=1)


def profile_to_frame(p):
    row = {"job_title": p["role"], "location": p["location"], "education": p["education"],
           "employment_type": p["employment_type"], "experience": float(p["experience"]),
           "skills_list": p.get("skills", [])}
    import pandas as pd
    return pd.DataFrame([row])
