def _agg(df, col):
    g = df.dropna(subset=["salary_mid"]).groupby(col)["salary_mid"].agg(["median", "mean", "count"])
    return [{"name": str(k), "median": round(r["median"]), "mean": round(r["mean"]), "n": int(r["count"])} for k, r in g.sort_values("median", ascending=False).iterrows()]


def salary_insights(df):
    d = df.dropna(subset=["salary_mid"]).copy()
    d["band"] = d["experience"].apply(lambda e: "0" if e == 0 else "1-3" if e <= 3 else "4-6" if e <= 6 else "7+")
    exp = _agg(d, "band"); exp.sort(key=lambda x: ["0", "1-3", "4-6", "7+"].index(x["name"]))
    return {"with_salary": len(d), "missing": int(len(df) - len(d)), "median": round(d["salary_mid"].median()),
            "by_role": _agg(d, "job_title"), "by_location": _agg(d, "location"), "by_experience": exp,
            "by_company": _agg(d, "company")[:8]}
