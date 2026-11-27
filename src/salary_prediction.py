import os
import joblib
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import GroupShuffleSplit
from .feature_engineering import build_features, profile_to_frame
from .evaluation import evaluate

MODEL_PATH = "models/salary_model.pkl"


def train(df, path=MODEL_PATH):
    d = df.dropna(subset=["salary_mid"])  # train only on real salaries
    X, y = build_features(d), d["salary_mid"]
    # group by company so one company's postings never land in both train and test
    tr, te = next(GroupShuffleSplit(test_size=.2, random_state=42).split(X, y, groups=d["company"]))
    model = RandomForestRegressor(n_estimators=100, min_samples_leaf=3, random_state=42, n_jobs=1)
    bundle = {"model": model, "columns": list(X.columns),
              "metrics": evaluate(y.iloc[te], model.predict(X.iloc[te])),
              "n_train": len(tr), "n_test": len(te)}
    os.makedirs(os.path.dirname(path), exist_ok=True)
    joblib.dump(bundle, path)
    return bundle


def load_or_train(df, path=MODEL_PATH):
    return joblib.load(path) if os.path.exists(path) else train(df, path)


def predict(bundle, profile):
    X = build_features(profile_to_frame(profile)).reindex(columns=bundle["columns"], fill_value=0)
    per_tree = np.array([t.predict(X.values)[0] for t in bundle["model"].estimators_])
    low, mid, high = np.percentile(per_tree, [15, 50, 85])
    return {"low": round(low), "mid": round(mid), "high": round(high), "currency": "INR / year"}
