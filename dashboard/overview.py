def _count(df, col, n=10):
    return [{"name": k, "value": int(v)} for k, v in df[col].value_counts().head(n).items()]


def overview(df):
    monthly = df.groupby(df["posted_date"].dt.strftime("%Y-%m")).size()
    exp = df["experience"].apply(lambda e: "Fresher (0)" if e == 0 else "1-3 yrs" if e <= 3 else "4-6 yrs" if e <= 6 else "7+ yrs")
    return {"total": len(df), "roles": _count(df, "job_title"), "companies": _count(df, "company"),
            "locations": _count(df, "location"), "experience": _count(exp.to_frame("e"), "e"),
            "monthly": [{"name": k, "value": int(v)} for k, v in monthly.items()],
            "fresher_share": round(float((df["experience"] == 0).mean()) * 100, 1)}


def jobs(df, q="", location="", fresher=False, limit=40):
    d = df
    if q: d = d[d["job_title"].str.contains(q, case=False) | d["skills"].str.contains(q, case=False)]
    if location: d = d[d["location"] == location]
    if fresher: d = d[d["experience"] == 0]
    d = d.sort_values("posted_date", ascending=False)
    cols = ["job_title", "company", "location", "experience", "skills", "salary_min", "salary_max", "employment_type", "posted_date"]
    out = d.head(limit)[cols].copy()
    out["posted_date"] = out["posted_date"].dt.strftime("%Y-%m-%d")
    return {"count": len(d), "rows": out.astype(object).where(out.notna(), None).to_dict("records")}
