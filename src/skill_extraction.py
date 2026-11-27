"""Rule-based skill extraction. Swap in spaCy PhraseMatcher for a fuller NLP version."""
import re

SKILL_VOCAB = {
    "Python": r"\bpython\b", "SQL": r"\bsql\b", "Excel": r"\bexcel\b", "Power BI": r"power\s?bi",
    "Tableau": r"\btableau\b", "Machine Learning": r"machine learning|\bml\b", "Deep Learning": r"deep learning",
    "NLP": r"\bnlp\b|natural language", "Statistics": r"statistic", "AWS": r"\baws\b|amazon web services",
    "Docker": r"\bdocker\b", "Git": r"\bgit\b", "Spark": r"\bspark\b",
}


def extract_skills(text):
    text = (text or "").lower()
    return [s for s, pat in SKILL_VOCAB.items() if re.search(pat, text)]
