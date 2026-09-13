"""
preprocessing.py
Shared data loading + feature engineering for the Smart Placement
Analytics & Prediction System.
"""

import pandas as pd
import numpy as np
from pathlib import Path

DATA_PATH = Path(__file__).resolve().parent.parent / "data" / "placement_data.csv"

FEATURE_COLUMNS = [
    "cgpa", "backlogs", "internships", "projects_completed",
    "certifications", "communication_score", "aptitude_score",
    "technical_score", "attendance_percent",
]


def load_raw_data(path: str = None) -> pd.DataFrame:
    """Load the raw historical placement CSV."""
    df = pd.read_csv(path or DATA_PATH)
    return df


def clean_data(df: pd.DataFrame) -> pd.DataFrame:
    """Basic cleaning: handle missing values, trim strings, sane bounds."""
    df = df.copy()
    df["skills"] = df["skills"].fillna("")
    numeric_cols = FEATURE_COLUMNS
    for col in numeric_cols:
        df[col] = pd.to_numeric(df[col], errors="coerce")
        df[col] = df[col].fillna(df[col].median())
    df["cgpa"] = df["cgpa"].clip(0, 10)
    df["attendance_percent"] = df["attendance_percent"].clip(0, 100)
    return df


def get_feature_matrix(df: pd.DataFrame, one_hot_department: bool = True):
    """Return (X, department_dummies_columns) ready for model training."""
    df = clean_data(df)
    X = df[FEATURE_COLUMNS].copy()
    if one_hot_department and "department" in df.columns:
        dept_dummies = pd.get_dummies(df["department"], prefix="dept")
        X = pd.concat([X, dept_dummies], axis=1)
    return X


def train_test_ready(df: pd.DataFrame):
    """Convenience: returns X (features) for the whole cleaned dataset."""
    return get_feature_matrix(df)


if __name__ == "__main__":
    raw = load_raw_data()
    print("Rows loaded:", len(raw))
    print(raw.head())
