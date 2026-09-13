import { useState } from 'react';
import { api } from '../api.js';

const DEPARTMENTS = ['Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Civil', 'Electrical'];

const DEFAULT_FORM = {
  department: 'Computer Science',
  cgpa: 7.5,
  backlogs: 0,
  internships: 1,
  projects_completed: 2,
  certifications: 1,
  communication_score: 7,
  aptitude_score: 70,
  technical_score: 70,
  attendance_percent: 85,
};

export default function PredictionPanel() {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [placement, setPlacement] = useState(null);
  const [salary, setSalary] = useState(null);
  const [loading, setLoading] = useState(false);

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const runPrediction = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const [p, s] = await Promise.all([
        api.predictPlacement(form),
        api.predictSalary(form),
      ]);
      setPlacement(p);
      setSalary(s);
    } catch (err) {
      setPlacement({ error: 'Could not reach the prediction API. Is the Flask backend running on port 5000?' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Placement Probability & Salary Prediction</h1>
        <p>Enter a student's academic and skill profile to predict placement likelihood and expected salary range.</p>
      </div>

      <div className="card">
        <form className="form-grid" onSubmit={runPrediction}>
          <div>
            <label>Department</label>
            <select value={form.department} onChange={(e) => update('department', e.target.value)}>
              {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label>CGPA (0–10)</label>
            <input type="number" step="0.1" min="0" max="10" value={form.cgpa}
              onChange={(e) => update('cgpa', parseFloat(e.target.value))} />
          </div>
          <div>
            <label>Active Backlogs</label>
            <input type="number" min="0" value={form.backlogs}
              onChange={(e) => update('backlogs', parseInt(e.target.value || 0))} />
          </div>
          <div>
            <label>Internships Completed</label>
            <input type="number" min="0" value={form.internships}
              onChange={(e) => update('internships', parseInt(e.target.value || 0))} />
          </div>
          <div>
            <label>Projects Completed</label>
            <input type="number" min="0" value={form.projects_completed}
              onChange={(e) => update('projects_completed', parseInt(e.target.value || 0))} />
          </div>
          <div>
            <label>Certifications</label>
            <input type="number" min="0" value={form.certifications}
              onChange={(e) => update('certifications', parseInt(e.target.value || 0))} />
          </div>
          <div>
            <label>Communication Score (1–10)</label>
            <input type="number" step="0.1" min="0" max="10" value={form.communication_score}
              onChange={(e) => update('communication_score', parseFloat(e.target.value))} />
          </div>
          <div>
            <label>Aptitude Test Score (%)</label>
            <input type="number" min="0" max="100" value={form.aptitude_score}
              onChange={(e) => update('aptitude_score', parseFloat(e.target.value))} />
          </div>
          <div>
            <label>Technical Test Score (%)</label>
            <input type="number" min="0" max="100" value={form.technical_score}
              onChange={(e) => update('technical_score', parseFloat(e.target.value))} />
          </div>
          <div>
            <label>Attendance (%)</label>
            <input type="number" min="0" max="100" value={form.attendance_percent}
              onChange={(e) => update('attendance_percent', parseFloat(e.target.value))} />
          </div>
          <div style={{ alignSelf: 'end' }}>
            <button className="primary" type="submit" disabled={loading}>
              {loading ? 'Predicting…' : 'Run Prediction'}
            </button>
          </div>
        </form>

        {placement?.error && (
          <div className="result-banner risk">{placement.error}</div>
        )}

        {placement && !placement.error && (
          <div className={`result-banner ${placement.placement_probability_percent >= 50 ? 'good' : 'risk'}`}>
            <strong>{placement.prediction}</strong> — placement probability of{' '}
            <strong>{placement.placement_probability_percent}%</strong>.
            {salary && (
              <div style={{ marginTop: 8 }}>
                Expected salary range: <strong>₹{salary.expected_salary_lpa.low}</strong> –{' '}
                <strong>₹{salary.expected_salary_lpa.high}</strong> LPA
                {' '}(median ₹{salary.expected_salary_lpa.median} LPA)
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
