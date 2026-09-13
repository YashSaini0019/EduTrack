# Power BI Dashboard — Setup Guide

The React dashboard in `/frontend` covers the interactive web app. For the
Power BI part of the tech stack (useful for a separate "BI/reporting" slide
in your presentation), connect Power BI directly to the same data:

## Option A — Connect to the CSV (fastest for a demo)
1. Open Power BI Desktop → **Get Data → Text/CSV**.
2. Select `data/placement_data.csv`.
3. Load, then build visuals:
   - **Placement % by Department** — Clustered column chart (`department` on axis, `placed` averaged as measure).
   - **Average Package by Department** — Column chart (`department` vs `AVERAGE(package_lpa)`).
   - **Company-wise Hiring** — Bar chart (`company` vs count of students, filtered `placed = 1`).
   - **CGPA vs Placement** — Scatter plot (`cgpa` on X, `placed` on Y, colored by `department`).
   - **Skill Demand** — Use Power Query to split the `skills` column (delimiter `;`) into rows, then count occurrences.

## Option B — Connect to the SQL database (production setup)
1. Run `python sql/load_data.py` to generate `placement_analytics.db` (SQLite) — or
   point `sql/schema.sql` at MySQL/PostgreSQL for a real deployment.
2. In Power BI: **Get Data → ODBC/SQL Server/PostgreSQL** (SQLite needs an ODBC driver;
   for a class project, MySQL or PostgreSQL is easier to connect natively).
3. Import the views created in `schema.sql`:
   - `v_department_analytics`
   - `v_company_hiring`
   - `v_student_dashboard`
4. These views are already pre-aggregated, so you can drag fields straight onto visuals
   without writing DAX measures.

## Suggested Dashboard Pages
1. **Overview** — KPIs (total students, placement %, avg package, highest package).
2. **Department Analytics** — placement % and package comparison across departments.
3. **Company Insights** — top recruiters, offers per company, average package per company.
4. **Skill Trends** — most in-demand skills, skill-gap heatmap by department.

Export the `.pbix` file into this folder once built so it ships with the repo.
