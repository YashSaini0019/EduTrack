# Smart Placement Analytics & Prediction System

Ek data analytics + AI/ML project jo college ke historical placement data ko
analyze karke placement probability predict karta hai, expected salary range
batata hai, skill-gap dikhata hai, company/role recommend karta hai, aur
department-wise placement analytics ka dashboard deta hai.

**Tech stack:** Python · Pandas · Scikit-learn · SQL · Flask (API) · React (dashboard) · Power BI (reporting)

---

## What this project does

| Feature | How |
|---|---|
| **Placement probability prediction** | Random Forest / Logistic Regression classifier trained on CGPA, backlogs, internships, projects, test scores, attendance |
| **Expected salary range** | Random Forest Regressor — range derived from the spread of predictions across trees (low / median / high) |
| **Skill-gap analysis** | Compares a student's skills against the skills required for their target role, returns matched + missing skills |
| **Company / role recommendation** | Content-based recommender — matches a student's profile against the average profile of students historically hired by each company |
| **Student performance dashboard** | Full student-level table (React) with filters |
| **Department-wise placement analytics** | Aggregated charts: placement %, avg/highest package, top hiring companies, in-demand skills |

## Project structure

```
smart-placement-analytics/
├── data/
│   └── placement_data.csv        # synthetic sample dataset (600 students) — replace with your college's data
├── sql/
│   ├── schema.sql                # full relational schema + analytical views
│   └── load_data.py              # loads the CSV into a SQLite DB (swap for MySQL/Postgres)
├── ml/
│   ├── requirements.txt
│   ├── preprocessing.py          # shared data cleaning + feature engineering
│   ├── train_placement_model.py  # classification model (placement probability)
│   ├── train_salary_model.py     # regression model (salary range)
│   ├── skill_gap_analysis.py     # skill-gap logic
│   ├── recommend_companies.py    # recommendation engine
│   └── models/                   # trained .pkl models are saved here
├── backend/
│   └── app.py                    # Flask REST API serving all predictions to the dashboard
├── frontend/                     # React (Vite) dashboard
│   └── src/
│       ├── App.jsx
│       └── components/           # DepartmentDashboard, PredictionPanel, SkillGapPanel, RecommendationPanel, StudentTable
├── powerbi/
│   └── README.md                 # how to wire the same data into Power BI
└── docs/
    └── PROJECT_PROMPT.md         # the full project brief/prompt (for your report or to extend with AI tools)
```

## Setup & Run

### 1. Generate / load data
A ready-made synthetic dataset (600 students, realistic distributions) is already in
`data/placement_data.csv`. To use your own college data, replace this file — keep the
same column names (see the table in `ml/preprocessing.py`).

### 2. Train the ML models
```bash
cd ml
pip install -r requirements.txt
python train_placement_model.py   # prints accuracy/ROC-AUC, saves ml/models/placement_model.pkl
python train_salary_model.py      # prints MAE/R2, saves ml/models/salary_model.pkl
python skill_gap_analysis.py      # prints top in-demand skills, saves data/skill_gap_report.csv
python recommend_companies.py     # sample recommendation run
```

### 3. Start the backend API
```bash
cd backend
python app.py
# API runs at http://localhost:5000
```

### 4. Start the React dashboard
```bash
cd frontend
npm install
npm run dev
# Dashboard runs at http://localhost:5173 (proxies /api to the Flask backend)
```

### 5. (Optional) Load into SQL + build the Power BI report
```bash
python sql/load_data.py
```
Then follow `powerbi/README.md` to connect Power BI to the CSV or the database.

## API Reference (Flask backend)

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/predict/placement` | POST | Placement probability for a student profile |
| `/api/predict/salary` | POST | Expected salary range (low/median/high) |
| `/api/skill-gap` | POST | Missing skills for a target role |
| `/api/recommend/companies` | POST | Top matching companies for a profile |
| `/api/recommend/roles` | POST | Top matching roles for a skill set |
| `/api/analytics/department` | GET | Department-wise placement stats |
| `/api/analytics/companies` | GET | Company-wise hiring stats |
| `/api/analytics/skills-demand` | GET | Most in-demand skills |
| `/api/students` | GET | Full student table for the dashboard |

## Model performance (on the sample dataset)

- **Placement classifier:** ~71–75% accuracy, ROC-AUC ~0.77 (Random Forest)
- **Salary regressor:** MAE ≈ ₹0.5–0.6 LPA, R² ≈ 0.65–0.70 (Gradient Boosting)

These will change once you plug in your college's real historical data — the sample
dataset is only meant to make the whole pipeline runnable out of the box.

## Pushing this to GitHub

```bash
cd smart-placement-analytics
git init
git add .
git commit -m "Initial commit: Smart Placement Analytics & Prediction System"
git branch -M main
git remote add origin https://github.com/<your-username>/smart-placement-analytics.git
git push -u origin main
```

## College presentation notes

This project intentionally spans **both** Data Analytics and AI/ML so it works well
as a single capstone/mini-project submission:
- Data Analytics: SQL schema + views, Power BI dashboard, department-wise analytics
- AI/ML: two trained models (classification + regression) plus a recommendation engine
- Full-stack delivery: Flask API + React dashboard, so it's demo-able live, not just notebooks

See `docs/PROJECT_PROMPT.md` for the full problem statement / write-up you can drop into
your project report, and to reuse as a prompt if you want an AI tool to extend this further
(e.g. add authentication, deploy it, or connect a real college database).
