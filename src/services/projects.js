
const API_URL = 'http://127.0.0.1:8000/api/projects';

// Get all projects
export const getProjects = async () => {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error('Failed to fetch projects');
  }

  return response.json();
};

// Add a project
export const addProject = async (projectData) => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(projectData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to add project');
  }

  return data;
};

// Update a project
export const updateProject = async (id, projectData) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(projectData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to update project');
  }

  return data;
};

// Delete a project
export const deleteProject = async (id) => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to delete project');
  }

  return data;
};