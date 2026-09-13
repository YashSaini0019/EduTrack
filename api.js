const BASE = '/api';

async function post(path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Request failed: ${path}`);
  return res.json();
}

async function get(path) {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`Request failed: ${path}`);
  return res.json();
}

export const api = {
  health: () => get('/health'),
  predictPlacement: (payload) => post('/predict/placement', payload),
  predictSalary: (payload) => post('/predict/salary', payload),
  skillGap: (payload) => post('/skill-gap', payload),
  recommendCompanies: (payload) => post('/recommend/companies', payload),
  recommendRoles: (payload) => post('/recommend/roles', payload),
  departmentAnalytics: () => get('/analytics/department'),
  companyAnalytics: () => get('/analytics/companies'),
  skillsDemand: () => get('/analytics/skills-demand'),
  students: () => get('/students'),
};
