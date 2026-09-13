-- ============================================================
-- Smart Placement Analytics & Prediction System
-- Database Schema (MySQL / PostgreSQL compatible)
-- ============================================================

CREATE DATABASE IF NOT EXISTS placement_analytics;
USE placement_analytics;

-- ---------------------------------------------------------
-- Departments
-- ---------------------------------------------------------
CREATE TABLE departments (
    department_id   INT AUTO_INCREMENT PRIMARY KEY,
    department_name VARCHAR(100) NOT NULL UNIQUE
);

-- ---------------------------------------------------------
-- Companies that visited campus
-- ---------------------------------------------------------
CREATE TABLE companies (
    company_id   INT AUTO_INCREMENT PRIMARY KEY,
    company_name VARCHAR(120) NOT NULL UNIQUE,
    industry     VARCHAR(80),
    tier         VARCHAR(20)          -- e.g. Dream, Super-Dream, Mass Recruiter
);

-- ---------------------------------------------------------
-- Skills master list
-- ---------------------------------------------------------
CREATE TABLE skills (
    skill_id   INT AUTO_INCREMENT PRIMARY KEY,
    skill_name VARCHAR(80) NOT NULL UNIQUE
);

-- ---------------------------------------------------------
-- Students (core academic + demographic profile)
-- ---------------------------------------------------------
CREATE TABLE students (
    student_id           VARCHAR(10) PRIMARY KEY,
    name                 VARCHAR(120),
    department_id        INT REFERENCES departments(department_id),
    year_of_admission     INT,
    cgpa                 DECIMAL(3,2),
    backlogs              INT DEFAULT 0,
    internships           INT DEFAULT 0,
    projects_completed     INT DEFAULT 0,
    certifications         INT DEFAULT 0,
    communication_score    DECIMAL(4,1),
    aptitude_score         DECIMAL(5,1),
    technical_score        DECIMAL(5,1),
    attendance_percent      DECIMAL(5,1),
    FOREIGN KEY (department_id) REFERENCES departments(department_id)
);

-- ---------------------------------------------------------
-- Student <-> Skill mapping (many-to-many)
-- ---------------------------------------------------------
CREATE TABLE student_skills (
    student_id VARCHAR(10) REFERENCES students(student_id),
    skill_id   INT REFERENCES skills(skill_id),
    PRIMARY KEY (student_id, skill_id)
);

-- ---------------------------------------------------------
-- Role master list (skills required per role, for gap analysis)
-- ---------------------------------------------------------
CREATE TABLE roles (
    role_id   INT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE role_required_skills (
    role_id  INT REFERENCES roles(role_id),
    skill_id INT REFERENCES skills(skill_id),
    weight   DECIMAL(3,2) DEFAULT 1.0,   -- importance of skill for the role
    PRIMARY KEY (role_id, skill_id)
);

-- ---------------------------------------------------------
-- Placement records (historical outcomes - the label table)
-- ---------------------------------------------------------
CREATE TABLE placements (
    placement_id  INT AUTO_INCREMENT PRIMARY KEY,
    student_id    VARCHAR(10) REFERENCES students(student_id),
    company_id    INT REFERENCES companies(company_id),
    role_id       INT REFERENCES roles(role_id),
    placed        BOOLEAN DEFAULT FALSE,
    package_lpa   DECIMAL(5,2),
    offer_date    DATE,
    FOREIGN KEY (student_id) REFERENCES students(student_id),
    FOREIGN KEY (company_id) REFERENCES companies(company_id),
    FOREIGN KEY (role_id) REFERENCES roles(role_id)
);

-- ============================================================
-- Useful analytical views (feed Power BI / React dashboard)
-- ============================================================

-- Department-wise placement % and average package
CREATE VIEW v_department_analytics AS
SELECT
    d.department_name,
    COUNT(s.student_id)                              AS total_students,
    SUM(CASE WHEN p.placed THEN 1 ELSE 0 END)         AS placed_students,
    ROUND(100.0 * SUM(CASE WHEN p.placed THEN 1 ELSE 0 END) / COUNT(s.student_id), 2) AS placement_percent,
    ROUND(AVG(CASE WHEN p.placed THEN p.package_lpa END), 2) AS avg_package_lpa,
    ROUND(MAX(p.package_lpa), 2)                       AS highest_package_lpa
FROM students s
JOIN departments d ON s.department_id = d.department_id
LEFT JOIN placements p ON s.student_id = p.student_id
GROUP BY d.department_name;

-- Company-wise hiring summary
CREATE VIEW v_company_hiring AS
SELECT
    c.company_name,
    COUNT(p.placement_id)          AS students_hired,
    ROUND(AVG(p.package_lpa), 2)   AS avg_package_lpa
FROM placements p
JOIN companies c ON p.company_id = c.company_id
WHERE p.placed = TRUE
GROUP BY c.company_name
ORDER BY students_hired DESC;

-- Student-level performance dashboard feed
CREATE VIEW v_student_dashboard AS
SELECT
    s.student_id, s.name, d.department_name, s.cgpa, s.backlogs,
    s.internships, s.projects_completed, s.certifications,
    s.communication_score, s.aptitude_score, s.technical_score, s.attendance_percent,
    p.placed, p.package_lpa
FROM students s
JOIN departments d ON s.department_id = d.department_id
LEFT JOIN placements p ON s.student_id = p.student_id;
