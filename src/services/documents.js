
const API_URL = 'http://localhost:8000/api/documents';

// Fetch all documents
export async function getDocuments() {
    const response = await fetch(API_URL);

    if (!response.ok) {
        throw new Error('Failed to fetch documents');
    }

    return response.json();
}

// Upload a document
export async function uploadDocument(file) {
    const formData = new FormData();
    formData.append('document', file);

    const response = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        body: formData
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to upload document');
    }

    return response.json();
}

// Download a document
export async function downloadDocument(id, fileName) {
    const response = await fetch(`${API_URL}/download/${id}`);

    if (!response.ok) {
        throw new Error('Failed to download document');
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
}

// Delete a document
export async function deleteDocument(id) {
    const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
    });

    if (!response.ok) {
        throw new Error('Failed to delete document');
    }

    return response.json();
}
