import { useState } from 'react';
import { api } from '../api.js';

const ALL_SKILLS = ['Python', 'Java', 'SQL', 'DSA', 'Machine Learning', 'Communication', 'DBMS', 'OS', 'Networking', 'React', 'C++', 'Excel', 'Power BI', 'AWS', 'Problem Solving'];
const ROLES = ['Software Engineer', 'Data Analyst', 'Data Scientist', 'System Engineer', 'Business Analyst', 'QA Engineer', 'Cloud Engineer', 'Support Engineer'];

export default function SkillGapPanel() {
  const [selected, setSelected] = useState(['Python', 'SQL']);
  const [role, setRole] = useState('Data Scientist');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const toggleSkill = (skill) => {
    setSelected((cur) => cur.includes(skill) ? cur.filter((s) => s !== skill) : [...cur, skill]);
  };

  const analyze = async () => {
    setLoading(true);
    try {
      const res = await api.skillGap({ skills: selected, target_role: role });
      setResult(res);
    } catch {
      setResult({ error: 'Could not reach the API. Is the Flask backend running?' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Skill-Gap Analysis</h1>
        <p>Select a student's current skills and a target role to see which skills are missing for that role.</p>
      </div>

      <div className="card">
        <div className="section-title">Current Skills</div>
        <div style={{ marginBottom: 18 }}>
          {ALL_SKILLS.map((s) => (
            <span
              key={s}
              className="tag"
              style={{
                cursor: 'pointer',
                opacity: selected.includes(s) ? 1 : 0.4,
                border: selected.includes(s) ? '1px solid #C98A2C' : '1px solid transparent',
              }}
              onClick={() => toggleSkill(s)}
            >
              {s}
            </span>
          ))}
        </div>

        <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <div>
            <label>Target Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div style={{ alignSelf: 'end' }}>
            <button className="primary" onClick={analyze} disabled={loading}>
              {loading ? 'Analyzing…' : 'Analyze Skill Gap'}
            </button>
          </div>
        </div>

        {result?.error && <div className="result-banner risk">{result.error}</div>}

        {result && !result.error && (
          <div className={`result-banner ${result.readiness_percent >= 60 ? 'good' : 'risk'}`}>
            <strong>{result.readiness_percent}% ready</strong> for {result.target_role}.
            <div style={{ marginTop: 10 }}>
              <div style={{ fontSize: 12.5, color: '#6B7280', marginBottom: 4 }}>Matched skills</div>
              {result.matched_skills.length
                ? result.matched_skills.map((s) => <span key={s} className="tag">{s}</span>)
                : <span style={{ fontSize: 13, color: '#6B7280' }}>None yet</span>}
            </div>
            <div style={{ marginTop: 10 }}>
              <div style={{ fontSize: 12.5, color: '#6B7280', marginBottom: 4 }}>Missing skills to work on</div>
              {result.missing_skills.length
                ? result.missing_skills.map((s) => <span key={s} className="tag missing">{s}</span>)
                : <span style={{ fontSize: 13, color: '#6B7280' }}>None — fully skill-ready!</span>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
