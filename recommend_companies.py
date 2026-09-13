"""
recommend_companies.py
Content-based recommendation engine: suggests companies/roles a
student is most likely to be a strong match for, based on the
profile of students who were historically placed in each company.

Approach: build a per-company "average placed-student profile"
vector from historical data, then rank companies by cosine
similarity to the target student's profile (+ a placement-history
popularity prior).

Run:
    python recommend_companies.py
"""

import pandas as pd
import numpy as np
from pathlib import Path
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import StandardScaler

from preprocessing import load_raw_data, clean_data, FEATURE_COLUMNS


def build_company_profiles(df: pd.DataFrame) -> pd.DataFrame:
    placed = df[df["placed"] == 1]
    profiles = placed.groupby("company")[FEATURE_COLUMNS].mean()
    counts = placed.groupby("company").size().rename("historical_hires")
    return profiles.join(counts)


def recommend_for_student(student_features: dict, df: pd.DataFrame, top_n: int = 5) -> pd.DataFrame:
    profiles = build_company_profiles(df)
    scaler = StandardScaler()
    scaled_profiles = scaler.fit_transform(profiles[FEATURE_COLUMNS])

    student_vec = pd.DataFrame([student_features])[FEATURE_COLUMNS]
    scaled_student = scaler.transform(student_vec)

    similarity = cosine_similarity(scaled_student, scaled_profiles)[0]

    result = profiles.copy()
    result["match_score_percent"] = np.round(similarity * 100, 1)
    # slight boost for companies that hire more often on campus (popularity prior)
    result["adjusted_score"] = (
        0.85 * result["match_score_percent"] +
        0.15 * (result["historical_hires"] / result["historical_hires"].max() * 100)
    )
    return result.sort_values("adjusted_score", ascending=False).head(top_n)[
        ["historical_hires", "match_score_percent", "adjusted_score"]
    ]


def recommend_roles(student_skills: list[str], top_n: int = 3):
    """Lightweight role recommendation reusing the skill-gap role map,
    ranked by skill overlap (see skill_gap_analysis.py for the full map)."""
    from skill_gap_analysis import ROLE_SKILL_MAP, student_skill_gap
    scored = []
    for role in ROLE_SKILL_MAP:
        res = student_skill_gap(student_skills, role)
        scored.append((role, res["readiness_percent"]))
    scored.sort(key=lambda x: x[1], reverse=True)
    return scored[:top_n]


if __name__ == "__main__":
    df = clean_data(load_raw_data())

    sample_student = {
        "cgpa": 8.2, "backlogs": 0, "internships": 2, "projects_completed": 3,
        "certifications": 2, "communication_score": 7.5, "aptitude_score": 78,
        "technical_score": 82, "attendance_percent": 90,
    }

    print("Top company recommendations for sample student profile:")
    print(recommend_for_student(sample_student, df))

    print("\nTop role recommendations based on skills [Python, SQL, Communication]:")
    print(recommend_roles(["Python", "SQL", "Communication"]))
