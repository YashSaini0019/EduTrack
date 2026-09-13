"""
load_data.py
Loads data/placement_data.csv into the SQL schema defined in schema.sql
using SQLite (swap the engine string for MySQL/Postgres in production).

Run:
    python load_data.py
Produces: placement_analytics.db (SQLite file) in the project root.
"""

import sqlite3
import pandas as pd
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DB_PATH = ROOT / "placement_analytics.db"
CSV_PATH = ROOT / "data" / "placement_data.csv"


def main():
    df = pd.read_csv(CSV_PATH)
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    cur.executescript("""
    DROP TABLE IF EXISTS placements;
    DROP TABLE IF EXISTS students;
    DROP TABLE IF EXISTS departments;
    DROP TABLE IF EXISTS companies;

    CREATE TABLE departments (
        department_id INTEGER PRIMARY KEY AUTOINCREMENT,
        department_name TEXT UNIQUE
    );

    CREATE TABLE companies (
        company_id INTEGER PRIMARY KEY AUTOINCREMENT,
        company_name TEXT UNIQUE
    );

    CREATE TABLE students (
        student_id TEXT PRIMARY KEY,
        department_id INTEGER,
        cgpa REAL, backlogs INTEGER, internships INTEGER,
        projects_completed INTEGER, certifications INTEGER,
        communication_score REAL, aptitude_score REAL,
        technical_score REAL, attendance_percent REAL,
        skills TEXT,
        FOREIGN KEY (department_id) REFERENCES departments(department_id)
    );

    CREATE TABLE placements (
        placement_id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id TEXT, company_id INTEGER,
        placed INTEGER, role_offered TEXT, package_lpa REAL,
        FOREIGN KEY (student_id) REFERENCES students(student_id),
        FOREIGN KEY (company_id) REFERENCES companies(company_id)
    );
    """)

    for dept in df["department"].dropna().unique():
        cur.execute("INSERT OR IGNORE INTO departments (department_name) VALUES (?)", (dept,))
    for comp in df["company"].dropna().unique():
        cur.execute("INSERT OR IGNORE INTO companies (company_name) VALUES (?)", (comp,))
    conn.commit()

    dept_map = dict(cur.execute("SELECT department_name, department_id FROM departments").fetchall())
    comp_map = dict(cur.execute("SELECT company_name, company_id FROM companies").fetchall())

    for _, row in df.iterrows():
        cur.execute("""
            INSERT INTO students (student_id, department_id, cgpa, backlogs, internships,
                projects_completed, certifications, communication_score, aptitude_score,
                technical_score, attendance_percent, skills)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            row["student_id"], dept_map.get(row["department"]), row["cgpa"], row["backlogs"],
            row["internships"], row["projects_completed"], row["certifications"],
            row["communication_score"], row["aptitude_score"], row["technical_score"],
            row["attendance_percent"], row["skills"],
        ))
        cur.execute("""
            INSERT INTO placements (student_id, company_id, placed, role_offered, package_lpa)
            VALUES (?, ?, ?, ?, ?)
        """, (
            row["student_id"], comp_map.get(row["company"]) if pd.notna(row["company"]) else None,
            int(row["placed"]), row["role_offered"], row["package_lpa"],
        ))

    conn.commit()
    conn.close()
    print(f"Loaded {len(df)} students into {DB_PATH}")


if __name__ == "__main__":
    main()
