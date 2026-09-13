"""
skill_gap_analysis.py
Compares a student's current skill-set against the skills most
commonly required for the roles they are targeting, and reports
the missing (gap) skills ranked by importance.

Run:
    python skill_gap_analysis.py
"""

import pandas as pd
from pathlib import Path
from collections import Counter

from preprocessing import load_raw_data, clean_data

# Role -> required skill set (in a real system this comes from the
# `role_required_skills` SQL table; kept inline here for a self-contained demo)
ROLE_SKILL_MAP = {
    "Software Engineer": ["Python", "Java", "DSA", "OS", "DBMS", "Problem Solving"],
    "Data Analyst":      ["SQL", "Python", "Excel", "Power BI", "Communication"],
    "Data Scientist":    ["Python", "Machine Learning", "SQL", "Problem Solving", "Communication"],
    "System Engineer":   ["OS", "Networking", "DBMS", "Java", "Problem Solving"],
    "Business Analyst":  ["SQL", "Excel", "Communication", "Power BI", "Problem Solving"],
    "QA Engineer":       ["Java", "SQL", "OS", "Problem Solving", "Communication"],
    "Cloud Engineer":    ["AWS", "Networking", "OS", "Python", "Problem Solving"],
    "Support Engineer":  ["Networking", "OS", "Communication", "DBMS"],
}


def market_skill_demand(df: pd.DataFrame, top_n: int = 10) -> pd.Series:
    """What skills are most common among students who actually got placed —
    a proxy for 'industry-demanded skills' in the absence of live job postings."""
    placed = df[df["placed"] == 1]
    all_skills = []
    for s in placed["skills"].dropna():
        all_skills.extend([x.strip() for x in s.split(";") if x.strip()])
    return pd.Series(Counter(all_skills)).sort_values(ascending=False).head(top_n)


def student_skill_gap(student_skills: list[str], target_role: str) -> dict:
    """Return missing skills for a student aiming at `target_role`."""
    required = set(ROLE_SKILL_MAP.get(target_role, []))
    have = set(s.strip() for s in student_skills)
    missing = sorted(required - have)
    matched = sorted(required & have)
    readiness_pct = round(100 * len(matched) / max(len(required), 1), 1)
    return {
        "target_role": target_role,
        "matched_skills": matched,
        "missing_skills": missing,
        "readiness_percent": readiness_pct,
    }


def batch_skill_gap_report(df: pd.DataFrame) -> pd.DataFrame:
    """Compute skill-gap readiness for every student against their most
    natural role match (role with highest overlap)."""
    records = []
    for _, row in df.iterrows():
        student_skills = [s.strip() for s in str(row["skills"]).split(";") if s.strip()]
        best_role, best_pct, best_missing = None, -1, []
        for role in ROLE_SKILL_MAP:
            result = student_skill_gap(student_skills, role)
            if result["readiness_percent"] > best_pct:
                best_pct = result["readiness_percent"]
                best_role = role
                best_missing = result["missing_skills"]
        records.append({
            "student_id": row["student_id"],
            "best_fit_role": best_role,
            "readiness_percent": best_pct,
            "missing_skills": ", ".join(best_missing) if best_missing else "None",
        })
    return pd.DataFrame(records)


if __name__ == "__main__":
    df = clean_data(load_raw_data())

    print("Top in-demand skills among placed students:")
    print(market_skill_demand(df))

    print("\nSample skill-gap check for one student aiming at 'Data Scientist':")
    sample_skills = str(df.iloc[0]["skills"]).split(";")
    print(student_skill_gap(sample_skills, "Data Scientist"))

    report = batch_skill_gap_report(df)
    out_path = Path(__file__).resolve().parent.parent / "data" / "skill_gap_report.csv"
    report.to_csv(out_path, index=False)
    print(f"\nFull skill-gap report saved to {out_path}")
    print(report.head())
