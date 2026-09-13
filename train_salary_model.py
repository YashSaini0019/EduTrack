"""
train_salary_model.py
Trains a regression model that predicts EXPECTED SALARY (LPA) for
students who are likely to be placed, and derives a realistic
salary RANGE (low - high) using the model's tree-level spread.

Run:
    python train_salary_model.py
"""

import joblib
import numpy as np
import pandas as pd
from pathlib import Path
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.metrics import mean_absolute_error, r2_score

from preprocessing import load_raw_data, clean_data, get_feature_matrix

MODEL_DIR = Path(__file__).resolve().parent / "models"
MODEL_DIR.mkdir(exist_ok=True)


def train():
    df = clean_data(load_raw_data())
    placed_df = df[df["placed"] == 1].copy()

    X = get_feature_matrix(placed_df)
    y = placed_df["package_lpa"].astype(float)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    rf = RandomForestRegressor(
        n_estimators=400, max_depth=8, min_samples_leaf=4, random_state=42
    )
    rf.fit(X_train, y_train)

    gb = GradientBoostingRegressor(random_state=42)
    gb.fit(X_train, y_train)

    for name, model in [("RandomForest", rf), ("GradientBoosting", gb)]:
        preds = model.predict(X_test)
        print(f"\n--- {name} ---")
        print("MAE (LPA):", round(mean_absolute_error(y_test, preds), 2))
        print("R2 score :", round(r2_score(y_test, preds), 3))

    joblib.dump(rf, MODEL_DIR / "salary_model.pkl")
    joblib.dump(list(X.columns), MODEL_DIR / "salary_model_columns.pkl")
    print(f"\nSaved model to {MODEL_DIR / 'salary_model.pkl'}")


def predict_salary_range(feature_row: pd.DataFrame, model=None, columns=None):
    """
    Predict a salary range using the spread of predictions across all
    trees in the Random Forest (gives a natural low/high band instead
    of a single point estimate).
    """
    if model is None:
        model = joblib.load(MODEL_DIR / "salary_model.pkl")
    if columns is None:
        columns = joblib.load(MODEL_DIR / "salary_model_columns.pkl")

    feature_row = feature_row.reindex(columns=columns, fill_value=0)
    row_values = feature_row.to_numpy()
    tree_preds = np.array([tree.predict(row_values)[0] for tree in model.estimators_])
    low, mid, high = np.percentile(tree_preds, [15, 50, 85])
    return round(float(low), 2), round(float(mid), 2), round(float(high), 2)


if __name__ == "__main__":
    train()
