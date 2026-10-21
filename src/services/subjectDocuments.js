const API_URL = 'http://127.0.0.1:8000/api/subject-documents';

// Get notes and PDFs for a specific subject
export async function getSubjectDocuments(subjectId) {
    const response = await fetch(`${API_URL}/${subjectId}`);

    if (!response.ok) {
        throw new Error('Failed to load subject documents');
    }

    return response.json();
}

// Upload a note or PDF
export async function uploadSubjectDocument(subjectId, file) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_URL}/${subjectId}`, {
        method: 'POST',
        body: formData
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to upload file');
    }

    return response.json();
}

// Download a subject document
export async function downloadSubjectDocument(subjectId, fileId) {
    const response = await fetch(
        `${API_URL}/${subjectId}/download/${fileId}`
    );

    if (!response.ok) {
        throw new Error('Failed to download file');
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = 'document';
    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
}

// Delete a subject document
export async function deleteSubjectDocument(subjectId, fileId) {
    const response = await fetch(
        `${API_URL}/${subjectId}/${fileId}`,
        { method: 'DELETE' }
    );

    if (!response.ok) {
        throw new Error('Failed to delete document');
    }

    return response.json();
}