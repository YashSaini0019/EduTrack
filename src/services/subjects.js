
const API_URL = 'http://localhost:8000/api/subjects';

export async function getSubjects() {
    const response = await fetch(API_URL);

    if (!response.ok) {
        throw new Error('Failed to fetch subjects');
    }

    return response.json();
}

export async function addSubject(subject) {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(subject)
    });

    if (!response.ok) {
        throw new Error('Failed to add subject');
    }

    return response.json();
}

export async function updateSubject(id, subject) {
    const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(subject)
    });

    if (!response.ok) {
        throw new Error('Failed to update subject');
    }

    return response.json();
}

export async function deleteSubject(id) {
    const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
    });

    if (!response.ok) {
        throw new Error('Failed to delete subject');
    }

    return response.json();
}
