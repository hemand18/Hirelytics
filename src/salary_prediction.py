"""Salary model: train, save and load."""
import joblib, os
MODEL_PATH = os.path.join(os.path.dirname(__file__), "..", "models", "salary_model.pkl")

def load_model():
    return joblib.load(MODEL_PATH) if os.path.exists(MODEL_PATH) else None

def predict(model, features: dict):
    """Return (low, high) annual salary in INR. Replace with real model output."""
    base = model.predict([list(features.values())])[0]
    return base * 0.85, base * 1.15
