from collections import Counter


def skill_demand(df, role=""):
    d = df[df["job_title"] == role] if role else df
    c = Counter(s for l in d["skills_list"] for s in l)
    return [{"name": k, "value": v, "share": round(100 * v / max(len(d), 1), 1)} for k, v in c.most_common(12)]


def skill_gap(df, role, have):
    demand = skill_demand(df, role)
    have = set(have)
    missing = [s for s in demand if s["name"] not in have]
    matched = [s["name"] for s in demand if s["name"] in have]
    score = round(100 * sum(s["share"] for s in demand if s["name"] in have) / max(sum(s["share"] for s in demand), 1))
    return {"match": score, "have": matched, "missing": missing[:6]}
