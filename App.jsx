import { useState } from 'react';
import DepartmentDashboard from './components/DepartmentDashboard.jsx';
import PredictionPanel from './components/PredictionPanel.jsx';
import SkillGapPanel from './components/SkillGapPanel.jsx';
import RecommendationPanel from './components/RecommendationPanel.jsx';
import StudentTable from './components/StudentTable.jsx';

const PAGES = [
  { id: 'dashboard', label: 'Department Analytics' },
  { id: 'predict', label: 'Placement & Salary Prediction' },
  { id: 'skillgap', label: 'Skill-Gap Analysis' },
  { id: 'recommend', label: 'Company & Role Recommender' },
  { id: 'students', label: 'Student Performance' },
];

export default function App() {
  const [page, setPage] = useState('dashboard');

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">Smart Placement <span>Analytics</span></div>
        {PAGES.map((p) => (
          <div
            key={p.id}
            className={`nav-item ${page === p.id ? 'active' : ''}`}
            onClick={() => setPage(p.id)}
          >
            {p.label}
          </div>
        ))}
      </aside>
      <main className="main">
        {page === 'dashboard' && <DepartmentDashboard />}
        {page === 'predict' && <PredictionPanel />}
        {page === 'skillgap' && <SkillGapPanel />}
        {page === 'recommend' && <RecommendationPanel />}
        {page === 'students' && <StudentTable />}
      </main>
    </div>
  );
}
