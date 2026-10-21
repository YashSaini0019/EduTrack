
const API_URL = 'http://127.0.0.1:8000/api/assignments';

// Get all assignments
export async function getAssignments() {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error('Could not fetch assignments');
  }

  return response.json();
}

// Get one assignment
export async function getAssignment(id) {
  const response = await fetch(`${API_URL}/${id}`);

  if (!response.ok) {
    throw new Error('Could not fetch assignment');
  }

  return response.json();
}

// Add assignment
export async function addAssignment(assignment) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(assignment),
  });

  if (!response.ok) {
    throw new Error('Could not add assignment');
  }

  return response.json();
}

// Update assignment
export async function updateAssignment(id, assignment) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(assignment),
  });

  if (!response.ok) {
    throw new Error('Could not update assignment');
  }

  return response.json();
}

// Delete assignment
export async function deleteAssignment(id) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Could not delete assignment');
  }

  return response.json();
}
