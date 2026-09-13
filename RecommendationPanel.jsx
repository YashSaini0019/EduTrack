import { useState } from 'react';
import { api } from '../api.js';

const DEFAULT_FORM = {
  cgpa: 8.0, backlogs: 0, internships: 2, projects_completed: 3,
  certifications: 1, communication_score: 7.5, aptitude_score: 75,
  technical_score: 78, attendance_percent: 88,
};

export default function RecommendationPanel() {
  const [form, setForm] = useState(DEFAULT_FORM);
  const [companies, setCompanies] = useState(null);
  const [loading, setLoading] = useState(false);

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const run = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.recommendCompanies({ ...form, top_n: 6 });
      setCompanies(res);
    } catch {
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Company & Role Recommendation</h1>
        <p>Finds companies whose historically-hired students most closely match this profile.</p>
      </div>

      <div className="card">
        <form className="form-grid" onSubmit={run}>
          <div>
            <label>CGPA</label>
            <input type="number" step="0.1" value={form.cgpa} onChange={(e) => update('cgpa', parseFloat(e.target.value))} />
          </div>
          <div>
            <label>Internships</label>
            <input type="number" value={form.internships} onChange={(e) => update('internships', parseInt(e.target.value || 0))} />
          </div>
          <div>
            <label>Projects Completed</label>
            <input type="number" value={form.projects_completed} onChange={(e) => update('projects_completed', parseInt(e.target.value || 0))} />
          </div>
          <div>
            <label>Technical Score (%)</label>
            <input type="number" value={form.technical_score} onChange={(e) => update('technical_score', parseFloat(e.target.value))} />
          </div>
          <div>
            <label>Communication Score</label>
            <input type="number" step="0.1" value={form.communication_score} onChange={(e) => update('communication_score', parseFloat(e.target.value))} />
          </div>
          <div style={{ alignSelf: 'end' }}>
            <button className="primary" type="submit" disabled={loading}>
              {loading ? 'Finding matches…' : 'Get Recommendations'}
            </button>
          </div>
        </form>

        {companies && (
          <div style={{ marginTop: 20 }}>
            <table>
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Match Score</th>
                  <th>Historical Hires</th>
                </tr>
              </thead>
              <tbody>
                {companies.map((c) => (
                  <tr key={c.company}>
                    <td>{c.company}</td>
                    <td>{c.match_score_percent}%</td>
                    <td>{c.historical_hires}</td>
                  </tr>
                ))}
                {companies.length === 0 && (
                  <tr><td colSpan={3} className="empty">No results — is the backend running?</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
