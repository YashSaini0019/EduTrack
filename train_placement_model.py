"""
train_placement_model.py
Trains a classification model that predicts PLACEMENT PROBABILITY
for a student, based on academic + skill profile.

Run:
    python train_placement_model.py
"""

import joblib
import pandas as pd
from pathlib import Path
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score, roc_auc_score, classification_report, confusion_matrix
)

from preprocessing import load_raw_data, clean_data, get_feature_matrix

MODEL_DIR = Path(__file__).resolve().parent / "models"
MODEL_DIR.mkdir(exist_ok=True)


def train():
    df = clean_data(load_raw_data())
    X = get_feature_matrix(df)
    y = df["placed"].astype(int)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    # Random Forest -> main model (handles non-linear feature interactions well)
    rf = RandomForestClassifier(
        n_estimators=300, max_depth=8, min_samples_leaf=4,
        class_weight="balanced", random_state=42
    )
    rf.fit(X_train, y_train)

    # Logistic Regression -> baseline / explainable model
    lr = LogisticRegression(max_iter=2000, class_weight="balanced")
    lr.fit(X_train, y_train)

    for name, model in [("RandomForest", rf), ("LogisticRegression", lr)]:
        preds = model.predict(X_test)
        proba = model.predict_proba(X_test)[:, 1]
        print(f"\n--- {name} ---")
        print("Accuracy:", round(accuracy_score(y_test, preds), 3))
        print("ROC-AUC :", round(roc_auc_score(y_test, proba), 3))
        print(classification_report(y_test, preds))
        print("Confusion matrix:\n", confusion_matrix(y_test, preds))

    # Feature importance (from Random Forest) — useful for the dashboard
    importance = pd.Series(rf.feature_importances_, index=X.columns).sort_values(ascending=False)
    print("\nTop features driving placement probability:\n", importance.head(10))

    # Persist the best model + column order for serving
    joblib.dump(rf, MODEL_DIR / "placement_model.pkl")
    joblib.dump(list(X.columns), MODEL_DIR / "placement_model_columns.pkl")
    importance.to_csv(MODEL_DIR / "placement_feature_importance.csv")
    print(f"\nSaved model to {MODEL_DIR / 'placement_model.pkl'}")


if __name__ == "__main__":
    train()
