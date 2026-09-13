"""
app.py
Flask REST API for the Smart Placement Analytics & Prediction System.
Serves: placement probability, salary range, skill gap, company
recommendations, and department-wise analytics for the React dashboard.

Run:
    pip install -r ../ml/requirements.txt
    python app.py
    -> API available at http://localhost:5000
"""

import sys
from pathlib import Path

# allow importing modules from ../ml
sys.path.append(str(Path(__file__).resolve().parent.parent / "ml"))

import joblib
import pandas as pd
from flask import Flask, request, jsonify

from preprocessing import load_raw_data, clean_data, FEATURE_COLUMNS
from skill_gap_analysis import ROLE_SKILL_MAP, student_skill_gap, market_skill_demand
from recommend_companies import build_company_profiles, recommend_for_student, recommend_roles
from train_salary_model import predict_salary_range

app = Flask(__name__)

# Manual CORS handling so the React dev server (different port) can call this
# API without needing the flask-cors package installed.
@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    response.headers["Access-Control-Allow-Methods"] = "GET,POST,OPTIONS"
    return response

MODEL_DIR = Path(__file__).resolve().parent.parent / "ml" / "models"
DF = clean_data(load_raw_data())

# Lazy-loaded model cache
_cache = {}


def get_placement_model():
    if "placement_model" not in _cache:
        _cache["placement_model"] = joblib.load(MODEL_DIR / "placement_model.pkl")
        _cache["placement_columns"] = joblib.load(MODEL_DIR / "placement_model_columns.pkl")
    return _cache["placement_model"], _cache["placement_columns"]


def get_salary_model():
    if "salary_model" not in _cache:
        _cache["salary_model"] = joblib.load(MODEL_DIR / "salary_model.pkl")
        _cache["salary_columns"] = joblib.load(MODEL_DIR / "salary_model_columns.pkl")
    return _cache["salary_model"], _cache["salary_columns"]


def build_feature_row(payload: dict) -> pd.DataFrame:
    row = {col: payload.get(col, 0) for col in FEATURE_COLUMNS}
    df_row = pd.DataFrame([row])
    if "department" in payload:
        dept_col = f"dept_{payload['department']}"
        df_row[dept_col] = 1
    return df_row


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "students_loaded": len(DF)})


@app.route("/api/predict/placement", methods=["POST"])
def predict_placement():
    """
    Body JSON example:
    {
      "cgpa": 8.1, "backlogs": 0, "internships": 2, "projects_completed": 3,
      "certifications": 1, "communication_score": 7.5, "aptitude_score": 75,
      "technical_score": 80, "attendance_percent": 88, "department": "Computer Science"
    }
    """
    payload = request.get_json(force=True)
    model, columns = get_placement_model()
    row = build_feature_row(payload).reindex(columns=columns, fill_value=0)
    probability = float(model.predict_proba(row)[0][1])
    return jsonify({
        "placement_probability_percent": round(probability * 100, 1),
        "prediction": "Likely to be Placed" if probability >= 0.5 else "At Risk - Needs Improvement",
    })


@app.route("/api/predict/salary", methods=["POST"])
def predict_salary():
    payload = request.get_json(force=True)
    model, columns = get_salary_model()
    row = build_feature_row(payload)
    low, mid, high = predict_salary_range(row, model=model, columns=columns)
    return jsonify({
        "expected_salary_lpa": {"low": low, "median": mid, "high": high}
    })


@app.route("/api/skill-gap", methods=["POST"])
def skill_gap():
    """
    Body JSON example:
    { "skills": ["Python", "SQL"], "target_role": "Data Scientist" }
    """
    payload = request.get_json(force=True)
    skills = payload.get("skills", [])
    target_role = payload.get("target_role")
    if target_role:
        return jsonify(student_skill_gap(skills, target_role))
    # if no role given, evaluate against all roles and return the best fit
    best = max(
        (student_skill_gap(skills, r) for r in ROLE_SKILL_MAP),
        key=lambda r: r["readiness_percent"]
    )
    return jsonify(best)


@app.route("/api/recommend/companies", methods=["POST"])
def recommend_companies_api():
    payload = request.get_json(force=True)
    features = {col: payload.get(col, 0) for col in FEATURE_COLUMNS}
    result = recommend_for_student(features, DF, top_n=payload.get("top_n", 5))
    return jsonify(result.reset_index().to_dict(orient="records"))


@app.route("/api/recommend/roles", methods=["POST"])
def recommend_roles_api():
    payload = request.get_json(force=True)
    skills = payload.get("skills", [])
    roles = recommend_roles(skills, top_n=payload.get("top_n", 3))
    return jsonify([{"role": r, "match_percent": p} for r, p in roles])


@app.route("/api/analytics/department", methods=["GET"])
def department_analytics():
    grouped = DF.groupby("department").agg(
        total_students=("student_id", "count"),
        placed_students=("placed", "sum"),
        avg_package=("package_lpa", "mean"),
        highest_package=("package_lpa", "max"),
    ).reset_index()
    grouped["placement_percent"] = round(
        100 * grouped["placed_students"] / grouped["total_students"], 1
    )
    grouped["avg_package"] = grouped["avg_package"].round(2)
    return jsonify(grouped.to_dict(orient="records"))


@app.route("/api/analytics/companies", methods=["GET"])
def company_analytics():
    placed = DF[DF["placed"] == 1]
    grouped = placed.groupby("company").agg(
        students_hired=("student_id", "count"),
        avg_package=("package_lpa", "mean"),
    ).reset_index().sort_values("students_hired", ascending=False)
    grouped["avg_package"] = grouped["avg_package"].round(2)
    return jsonify(grouped.to_dict(orient="records"))


@app.route("/api/analytics/skills-demand", methods=["GET"])
def skills_demand():
    demand = market_skill_demand(DF, top_n=12)
    return jsonify([{"skill": k, "count": int(v)} for k, v in demand.items()])


@app.route("/api/students", methods=["GET"])
def list_students():
    """Powers the student performance dashboard table."""
    cols = ["student_id", "department", "cgpa", "backlogs", "internships",
            "projects_completed", "communication_score", "aptitude_score",
            "technical_score", "attendance_percent", "placed", "package_lpa"]
    return jsonify(DF[cols].fillna("").to_dict(orient="records"))


if __name__ == "__main__":
    app.run(debug=True, port=5000)
