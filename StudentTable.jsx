import { useEffect, useState } from 'react';
import { api } from '../api.js';

export default function StudentTable() {
  const [students, setStudents] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    api.students().then(setStudents).catch(() => setStudents([]));
  }, []);

  if (!students) return <div className="loading">Loading students…</div>;

  const filtered = students.filter((s) => {
    if (filter === 'placed') return s.placed === 1;
    if (filter === 'not_placed') return s.placed === 0;
    return true;
  });

  return (
    <div>
      <div className="page-header">
        <h1>Student Performance Dashboard</h1>
        <p>Academic and readiness profile for every tracked student, with placement outcome.</p>
      </div>

      <div className="card">
        <div className="form-grid" style={{ gridTemplateColumns: '200px 1fr', marginBottom: 14 }}>
          <div>
            <label>Filter</label>
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">All Students ({students.length})</option>
              <option value="placed">Placed</option>
              <option value="not_placed">Not Yet Placed</option>
            </select>
          </div>
        </div>

        <div style={{ maxHeight: 480, overflowY: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>Student ID</th>
                <th>Department</th>
                <th>CGPA</th>
                <th>Backlogs</th>
                <th>Internships</th>
                <th>Attendance</th>
                <th>Status</th>
                <th>Package (LPA)</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 150).map((s) => (
                <tr key={s.student_id}>
                  <td>{s.student_id}</td>
                  <td>{s.department}</td>
                  <td>{s.cgpa}</td>
                  <td>{s.backlogs}</td>
                  <td>{s.internships}</td>
                  <td>{s.attendance_percent}%</td>
                  <td>
                    <span className={`tag ${s.placed ? '' : 'missing'}`}>
                      {s.placed ? 'Placed' : 'Not Placed'}
                    </span>
                  </td>
                  <td>{s.package_lpa || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
