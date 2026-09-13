import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { api } from '../api.js';

export default function DepartmentDashboard() {
  const [dept, setDept] = useState(null);
  const [companies, setCompanies] = useState(null);
  const [skills, setSkills] = useState(null);

  useEffect(() => {
    api.departmentAnalytics().then(setDept).catch(() => setDept([]));
    api.companyAnalytics().then(setCompanies).catch(() => setCompanies([]));
    api.skillsDemand().then(setSkills).catch(() => setSkills([]));
  }, []);

  if (!dept) return <div className="loading">Loading analytics…</div>;

  const totalStudents = dept.reduce((s, d) => s + d.total_students, 0);
  const totalPlaced = dept.reduce((s, d) => s + d.placed_students, 0);
  const overallPercent = totalStudents ? Math.round((100 * totalPlaced) / totalStudents) : 0;
  const avgPackage = dept.length
    ? (dept.reduce((s, d) => s + (d.avg_package || 0), 0) / dept.length).toFixed(2)
    : 0;
  const highest = dept.length ? Math.max(...dept.map((d) => d.highest_package || 0)) : 0;

  return (
    <div>
      <div className="page-header">
        <h1>Department-wise Placement Analytics</h1>
        <p>Historical placement outcomes across departments — probability, package, and hiring trends.</p>
      </div>

      <div className="grid grid-4" style={{ marginBottom: 22 }}>
        <div className="card stat-card">
          <div className="value">{totalStudents}</div>
          <div className="label">Total Students Tracked</div>
        </div>
        <div className="card stat-card">
          <div className="value">{overallPercent}%</div>
          <div className="label">Overall Placement Rate</div>
        </div>
        <div className="card stat-card">
          <div className="value">{avgPackage} LPA</div>
          <div className="label">Average Package</div>
        </div>
        <div className="card stat-card">
          <div className="value">{highest} LPA</div>
          <div className="label">Highest Package</div>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <div className="section-title">Placement % by Department</div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={dept}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E4E0D6" />
              <XAxis dataKey="department" tick={{ fontSize: 11 }} interval={0} angle={-20} textAnchor="end" height={70} />
              <YAxis tick={{ fontSize: 11 }} unit="%" />
              <Tooltip />
              <Bar dataKey="placement_percent" fill="#C98A2C" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="section-title">Average Package by Department (LPA)</div>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={dept}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E4E0D6" />
              <XAxis dataKey="department" tick={{ fontSize: 11 }} interval={0} angle={-20} textAnchor="end" height={70} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="avg_package" fill="#12213B" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <div className="section-title">Top Hiring Companies</div>
          {companies && (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={companies.slice(0, 8)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#E4E0D6" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="company" tick={{ fontSize: 11 }} width={90} />
                <Tooltip />
                <Bar dataKey="students_hired" fill="#C98A2C" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="card">
          <div className="section-title">Most In-Demand Skills (among placed students)</div>
          {skills && (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={skills} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#E4E0D6" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="skill" tick={{ fontSize: 11 }} width={90} />
                <Tooltip />
                <Bar dataKey="count" fill="#12213B" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
