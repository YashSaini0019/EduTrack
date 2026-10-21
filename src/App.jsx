import { useState, useEffect } from 'react';
import './App.css';

import {
  getSubjects,
  addSubject as saveSubject,
  updateSubject,
  deleteSubject as removeSubject,
} from './services/subjects';

import {
  getDocuments,
  uploadDocument,
  downloadDocument,
  deleteDocument,
} from './services/documents';

import {
  getSubjectDocuments,
  uploadSubjectDocument,
  downloadSubjectDocument,
  deleteSubjectDocument
} from './services/subjectDocuments';

import {
  getAssignments,
  addAssignment,
  updateAssignment,
  deleteAssignment,
} from './services/assignments';

import {
  getProjects,
  addProject,
  updateProject,
  deleteProject,
} from './services/projects';

function App() {
  const [activePage, setActivePage] = useState('Dashboard');
  const [subjects, setSubjects] = useState([]);


  const [assignments, setAssignments] = useState([]);
  const [assignmentsLoading, setAssignmentsLoading] = useState(false);
  const [assignmentsError, setAssignmentsError] = useState('');

  const [showAssignmentForm, setShowAssignmentForm] = useState(false);
  const [editingAssignmentId, setEditingAssignmentId] = useState(null);
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  const [assignmentTitle, setAssignmentTitle] = useState('');
  const [assignmentDescription, setAssignmentDescription] = useState('');
  const [assignmentDueDate, setAssignmentDueDate] = useState('');
  const [assignmentStatus, setAssignmentStatus] = useState('Pending');


  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [projectsError, setProjectsError] = useState('');

  const [showProjectForm, setShowProjectForm] = useState(false);
  const [projectTitle, setProjectTitle] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [projectTechnology, setProjectTechnology] = useState('');
  const [projectStatus, setProjectStatus] = useState('In Progress');
  const [editingProjectId, setEditingProjectId] = useState(null);

  const [subjectDocuments, setSubjectDocuments] = useState([]);
  const [subjectDocumentsLoading, setSubjectDocumentsLoading] = useState(false);
  const [subjectDocumentsError, setSubjectDocumentsError] = useState('');
  const [showForm, setShowForm] = useState(false);

  const [documents, setDocuments] = useState([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [documentsError, setDocumentsError] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadSubjects() {
      try {
        const data = await getSubjects();
        setSubjects(data);
      } catch (err) {
        setError('Could not load subjects. Please check the backend.');
      } finally {
        setLoading(false);
      }
    }

    loadSubjects();
  }, []);

  useEffect(() => {
    if (activePage !== 'Documents') return;

    async function loadDocuments() {
      try {
        setDocumentsLoading(true);
        setDocumentsError('');

        const data = await getDocuments();
        console.log('Documents received:', data);
        setDocuments(data);
      } catch (err) {
        setDocumentsError('Could not load documents. Please check the backend.');
      } finally {
        setDocumentsLoading(false);
      }
    }

    loadDocuments();
  }, [activePage]);

  useEffect(() => {
    if (!activePage.startsWith('Subject-')) return;

    const subjectId = activePage.replace('Subject-', '');

    async function loadSubjectDocuments() {
      try {
        setSubjectDocumentsLoading(true);
        setSubjectDocumentsError('');

        const data = await getSubjectDocuments(subjectId);
        setSubjectDocuments(data);
      } catch (err) {
        setSubjectDocumentsError(
          'Could not load subject notes and PDFs.'
        );
      } finally {
        setSubjectDocumentsLoading(false);
      }
    }

    loadSubjectDocuments();
  }, [activePage]);



  useEffect(() => {
    if (activePage !== 'Assignments') return;

    async function loadAssignments() {
      try {
        setAssignmentsLoading(true);
        setAssignmentsError('');

        const data = await getAssignments();
        setAssignments(data);
      } catch (err) {
        setAssignmentsError('Could not load assignments.');
      } finally {
        setAssignmentsLoading(false);
      }
    }

    loadAssignments();
  }, [activePage]);


  const [subjectName, setSubjectName] = useState('');
  const [subjectDescription, setSubjectDescription] = useState('');
  const [editingId, setEditingId] = useState(null);

  const menuItems = [
    { name: 'Dashboard', icon: '▦' },
    { name: 'My Subjects', icon: '▤' },

    { name: 'Assignments', icon: '✓' },
    { name: 'Projects', icon: '⌘' },
    { name: 'Documents', icon: '▣' },
    { name: 'Revision Tracker', icon: '◷' },
  ];


  async function addSubject(event) {
    event.preventDefault();

    if (!subjectName.trim()) return;

    const subject = {
      name: subjectName.trim(),
      description: subjectDescription.trim(),
    };

    try {
      setError('');

      if (editingId !== null) {
        const updated = await updateSubject(editingId, subject);

        setSubjects((current) =>
          current.map((item) =>
            item.id === editingId ? updated : item
          )
        );
      } else {
        const created = await saveSubject(subject);
        setSubjects((current) => [...current, created]);
      }

      setSubjectName('');
      setSubjectDescription('');
      setEditingId(null);
      setShowForm(false);
    } catch (err) {
      setError('Could not save subject. Please try again.');
    }
  }


  async function handleDocumentUpload(event) {
    event.preventDefault();

    if (!selectedFile) {
      setDocumentsError('Please select a file first.');
      return;
    }

    try {
      setUploading(true);
      setDocumentsError('');

      await uploadDocument(selectedFile);

      const data = await getDocuments();
      setDocuments(data);

      setSelectedFile(null);
      document.getElementById('documentFile').value = '';

    } catch (err) {
      console.error('Upload error:', err);
      setDocumentsError(
        err.message || 'Could not upload document. Please try again.'
      );
    } finally {
      setUploading(false);
    }
  }


  async function handleSubjectDocumentUpload(event) {
    event.preventDefault();

    const fileInput = document.getElementById('subjectDocumentFile');
    const file = fileInput?.files?.[0];

    if (!file || !activePage.startsWith('Subject-')) return;

    const subjectId = activePage.replace('Subject-', '');

    try {
      setSubjectDocumentsError('');

      await uploadSubjectDocument(subjectId, file);

      const data = await getSubjectDocuments(subjectId);
      setSubjectDocuments(data);

      fileInput.value = '';
    } catch (err) {
      setSubjectDocumentsError(
        err.message || 'Could not upload the file.'
      );
    }
  }


  async function deleteSubject(id) {
    try {
      setError('');
      await removeSubject(id);

      setSubjects((current) =>
        current.filter((subject) => subject.id !== id)
      );
    } catch (err) {
      setError('Could not delete subject. Please try again.');
    }
  }


  function editSubject(subject) {
    setSubjectName(subject.name);
    setSubjectDescription(subject.description);
    setEditingId(subject.id);
    setShowForm(true);
  }



  const resetAssignmentForm = () => {
    setAssignmentTitle('');
    setAssignmentDescription('');
    setAssignmentDueDate('');
    setAssignmentStatus('Pending');
    setEditingAssignmentId(null);
    setShowAssignmentForm(false);
  };

  const handleAssignmentSubmit = async (event) => {
    event.preventDefault();
    setAssignmentsError('');

    const assignmentData = {
      title: assignmentTitle.trim(),
      description: assignmentDescription,
      due_date: assignmentDueDate || null,
      status: assignmentStatus,
    };

    try {
      if (editingAssignmentId !== null) {
        const updated = await updateAssignment(
          editingAssignmentId,
          assignmentData
        );

        setAssignments((current) =>
          current.map((item) =>
            item.id === updated.id ? updated : item
          )
        );
      } else {
        const created = await addAssignment(assignmentData);
        setAssignments((current) => [...current, created]);
      }

      resetAssignmentForm();
    } catch (err) {
      setAssignmentsError('Could not save assignment. Please try again.');
    }
  };

  const handleEditAssignment = (assignment) => {
    setAssignmentTitle(assignment.title);
    setAssignmentDescription(assignment.description || '');
    setAssignmentDueDate(
      assignment.due_date
        ? String(assignment.due_date).slice(0, 10)
        : ''
    );
    setAssignmentStatus(assignment.status || 'Pending');
    setEditingAssignmentId(assignment.id);
    setSelectedAssignment(null);
    setShowAssignmentForm(true);
  };



  const handleDeleteAssignment = async (id) => {
    if (!window.confirm('Delete this assignment?')) return;

    setAssignmentsError('');

    try {
      await deleteAssignment(id);

      setAssignments((current) =>
        current.filter((item) => item.id !== id)
      );

      if (selectedAssignment?.id === id) {
        setSelectedAssignment(null);
      }
    } catch (err) {
      setAssignmentsError('Could not delete assignment.');
    }
  };

  const handleAssignmentStatusChange = async (assignment) => {
    const newStatus =
      assignment.status === 'Completed' ? 'Pending' : 'Completed';

    try {
      const updated = await updateAssignment(assignment.id, {
        title: assignment.title,
        description: assignment.description || '',
        due_date: assignment.due_date
          ? String(assignment.due_date).slice(0, 10)
          : null,
        status: newStatus,
      });

      setAssignments((current) =>
        current.map((item) =>
          item.id === updated.id ? updated : item
        )
      );

      if (selectedAssignment?.id === updated.id) {
        setSelectedAssignment(updated);
      }
    } catch (err) {
      setAssignmentsError('Could not update assignment status.');
    }
  };

  const fetchProjects = async () => {
    try {
      setProjectsLoading(true);
      setProjectsError('');

      const data = await getProjects();
      setProjects(data);
    } catch (error) {
      setProjectsError(error.message || 'Failed to load projects');
    } finally {
      setProjectsLoading(false);
    }
  };

  useEffect(() => {
    if (activePage === 'Projects') {
      fetchProjects();
    }
  }, [activePage]);

  const handleEditProject = (project) => {
    setEditingProjectId(project.id);
    setProjectTitle(project.title);
    setProjectDescription(project.description || '');
    setProjectTechnology(project.technology || '');
    setProjectStatus(project.status || 'In Progress');
    setShowProjectForm(true);
  };

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">E</div>
          <span>EduVault</span>
        </div>

        <p className="menu-label">WORKSPACE</p>

        <nav className="navigation">
          {menuItems.map((item) => (
            <button
              key={item.name}
              className={`nav-item ${activePage === item.name ? 'active' : ''
                }`}
              onClick={() => setActivePage(item.name)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.name}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="profile-avatar">YS</div>
          <div>
            <strong>My Workspace</strong>
            <p>Personal account</p>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <span className="breadcrumb">Workspace / {activePage}</span>
          <div className="topbar-right">
            <span className="status-dot"></span>
            <span>My Learning Space</span>
          </div>
        </header>

        <section className="page-content">
          {activePage === 'My Subjects' ? (
            <>
              <div className="welcome-section">
                <div>
                  <p className="eyebrow">YOUR COURSEWORK</p>
                  <h1>My Subjects</h1>
                  <p className="subtitle">
                    Keep your subjects and study material organized.
                  </p>
                </div>

                <button
                  className="primary-button"
                  onClick={() => {
                    setShowForm(!showForm);
                    setEditingId(null);
                    setSubjectName('');
                    setSubjectDescription('');
                  }}
                >
                  {showForm ? 'Cancel' : '+ Add Subject'}
                </button>
              </div>


              {error && <p role="alert">{error}</p>}
              {loading && <p>Loading subjects...</p>}
              {showForm && (
                <form className="subject-form" onSubmit={addSubject}>
                  <h3>{editingId !== null ? 'Edit subject' : 'Add a subject'}</h3>

                  <label htmlFor="subjectName">Subject name *</label>
                  <input
                    id="subjectName"
                    type="text"
                    placeholder="e.g. Database Management System"
                    value={subjectName}
                    onChange={(event) => setSubjectName(event.target.value)}
                    required
                  />

                  <label htmlFor="subjectDescription">
                    Description (optional)
                  </label>
                  <textarea
                    id="subjectDescription"
                    placeholder="What are you studying in this subject?"
                    value={subjectDescription}
                    onChange={(event) =>
                      setSubjectDescription(event.target.value)
                    }
                    rows="3"
                  />

                  <button className="primary-button" type="submit">
                    {editingId !== null ? 'Update Subject' : 'Save Subject'}
                  </button>

                </form>
              )}

              <div className="subject-list-heading">
                <h3>All Subjects</h3>
                <span>{subjects.length} subjects</span>
              </div>


              {!loading && (
                subjects.length === 0 ? (
                  <div className="subjects-empty">
                    <h3>No subjects added yet</h3>
                    <p>
                      Add your first subject to keep your coursework in one place.
                    </p>
                    <button
                      className="secondary-button"
                      onClick={() => setShowForm(true)}
                    >
                      Add your first subject
                    </button>
                  </div>
                ) : (
                  <div className="subjects-grid">
                    {subjects.map((subject) => (
                      <article className="subject-card" key={subject.id}>
                        <div className="subject-card-top">
                          <div className="subject-letter">
                            {subject.name.charAt(0).toUpperCase()}
                          </div>

                          <div className="subject-actions">
                            <button
                              className="edit-button"
                              onClick={() => editSubject(subject)}
                            >
                              Edit
                            </button>

                            <button
                              className="delete-button"
                              onClick={() => deleteSubject(subject.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </div>

                        <h3>{subject.name}</h3>

                        <p>{subject.description || 'No description added.'}</p>

                        <button
                          className="primary-button"
                          onClick={() => {
                            setActivePage(`Subject-${subject.id}`);
                          }}
                        >
                          Open Subject
                        </button>
                      </article>
                    ))}
                  </div>
                )
              )}

            </>
          ) : activePage === 'Documents' ? (

            <div>
              <div className="welcome-section">
                <div>
                  <p className="eyebrow">YOUR FILE LIBRARY</p>
                  <h1>Documents</h1>
                  <p className="subtitle">
                    Upload and manage your academic documents.
                  </p>
                </div>
              </div>

              {documentsError && (
                <p role="alert">{documentsError}</p>
              )}

              <form onSubmit={handleDocumentUpload} className="subject-form">
                <label htmlFor="documentFile">Choose a document</label>

                <input
                  id="documentFile"
                  type="file"
                  onChange={(event) => {
                    setSelectedFile(event.target.files[0] || null);
                    setDocumentsError('');
                  }}
                />

                <p>Maximum file size: 10 MB.</p>

                <button
                  className="primary-button"
                  type="submit"
                  disabled={!selectedFile || uploading}
                >
                  {uploading ? 'Uploading...' : 'Upload Document'}
                </button>
              </form>


              <div className="subject-list-heading">
                <h3>All Documents</h3>
                <span>{documents.length} documents</span>
              </div>

              {documentsLoading && <p>Loading documents...</p>}

              {!documentsLoading && documents.length === 0 && (
                <div className="subjects-empty">
                  <h3>No documents uploaded yet</h3>
                  <p>Upload your first academic document to get started.</p>
                </div>
              )}

              {!documentsLoading && documents.length > 0 && (
                <div className="subjects-grid">
                  {documents.map((document) => (
                    <article className="subject-card" key={document.id}>
                      <div className="subject-card-top">
                        <div className="subject-letter">
                          {document.original_name.split('.').pop().toUpperCase()}
                        </div>

                        <div className="subject-actions">
                          <button
                            className="edit-button"
                            onClick={async () => {
                              try {
                                await downloadDocument(
                                  document.id,
                                  document.original_name
                                );
                              } catch (err) {
                                setDocumentsError('Could not download document.');
                              }
                            }}
                          >
                            Download
                          </button>

                          <button
                            className="delete-button"
                            onClick={async () => {
                              if (!window.confirm('Delete this document?')) return;

                              try {
                                await deleteDocument(document.id);
                                setDocuments((current) =>
                                  current.filter((item) => item.id !== document.id)
                                );
                              } catch (err) {
                                setDocumentsError('Could not delete document.');
                              }
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>

                      <h3>{document.original_name}</h3>
                      <p>{document.file_type || 'Document'}</p>
                      <p>
                        Uploaded: {new Date(document.uploaded_at).toLocaleDateString()}
                      </p>
                    </article>
                  ))}
                </div>
              )}



            </div>

          ) : activePage.startsWith('Subject-') ? (
            <div className="welcome-section">
              <div>
                <p className="eyebrow">YOUR SUBJECT</p>

                <h1>
                  {subjects.find(
                    (subject) =>
                      String(subject.id) === activePage.replace('Subject-', '')
                  )?.name || 'Subject Not Found'}
                </h1>

                <p className="subtitle">
                  {subjects.find(
                    (subject) =>
                      String(subject.id) === activePage.replace('Subject-', '')
                  )?.description || 'No description added.'}
                </p>

                <button
                  className="primary-button"
                  onClick={() => setActivePage('My Subjects')}
                >
                  Back to My Subjects
                </button>

                <h2>Notes & PDFs</h2>
                <form onSubmit={handleSubjectDocumentUpload} className="subject-form">
                  <input
                    type="file"
                    id="subjectDocumentFile"
                    accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
                    required
                  />

                  <button type="submit" className="primary-button">
                    Upload Note / PDF
                  </button>
                </form>

                {subjectDocumentsError && (
                  <p className="error-message">{subjectDocumentsError}</p>
                )}

                {subjectDocumentsLoading ? (
                  <p>Loading notes and PDFs...</p>
                ) : subjectDocuments.length === 0 ? (
                  <p>No notes or PDFs uploaded yet.</p>
                ) : (
                  <div className="subject-documents-list">
                    {subjectDocuments.map((doc) => (
                      <div key={doc.id} className="document-card">
                        <span>
                          {doc.file_name.toLowerCase().endsWith('.pdf')
                            ? '📕 '
                            : /\.(png|jpg|jpeg|gif|webp)$/i.test(doc.file_name)
                              ? '🖼️ '
                              : /\.(txt|md)$/i.test(doc.file_name)
                                ? '📝 '
                                : '📄 '}
                          {doc.file_name}
                        </span>

                        <button
                          type="button"
                          onClick={() => {
                            const subjectId = activePage.replace('Subject-', '');

                            window.open(
                              `http://127.0.0.1:8000/api/subject-documents/${subjectId}/open/${doc.id}`,
                              '_blank'
                            );
                          }}
                        >
                          Open
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            downloadSubjectDocument(
                              activePage.replace('Subject-', ''),
                              doc.id
                            )
                          }
                        >
                          Download
                        </button>

                        <button
                          type="button"
                          onClick={async () => {
                            const subjectId = activePage.replace('Subject-', '');

                            try {
                              await deleteSubjectDocument(subjectId, doc.id);

                              const data = await getSubjectDocuments(subjectId);
                              setSubjectDocuments(data);
                            } catch (err) {
                              setSubjectDocumentsError('Could not delete the file.');
                            }
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          ) : activePage === 'Dashboard' ? (
            <>
              <div className="welcome-section">
                <div>
                  <p className="eyebrow">YOUR ACADEMIC SPACE</p>
                  <h1>Welcome back!</h1>
                  <p className="subtitle">
                    Keep your learning organized, one step at a time.
                  </p>
                </div>

                <button
                  className="primary-button"
                  onClick={() => setActivePage('My Subjects')}
                >
                  View subjects
                </button>
              </div>

              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-top">
                    <span>Total Subjects</span>
                    <span className="stat-icon blue">▦</span>
                  </div>
                  <h2>{subjects.length}</h2>
                  <p>Subjects in your workspace</p>
                </div>

                <div className="stat-card">
                  <div className="stat-top">
                    <span>Study Notes</span>
                    <span className="stat-icon purple">▤</span>
                  </div>
                  <h2>0</h2>
                  <p>Notes saved</p>
                </div>

                <div className="stat-card">
                  <div className="stat-top">
                    <span>Pending Tasks</span>
                    <span className="stat-icon orange">◷</span>
                  </div>
                  <h2>0</h2>
                  <p>Assignments to complete</p>
                </div>

                <div className="stat-card">
                  <div className="stat-top">
                    <span>Projects</span>
                    <span className="stat-icon green">⌘</span>
                  </div>
                  <h2>0</h2>
                  <p>Academic projects</p>
                </div>
              </div>

              <div className="content-grid">
                <section className="panel">
                  <div className="panel-heading">
                    <h3>Quick Access</h3>
                    <p>Open a section of your workspace.</p>
                  </div>

                  <div className="quick-access-grid">
                    {['My Subjects', 'Assignments', 'Documents'].map(
                      (name) => (
                        <button
                          className="quick-card"
                          key={name}
                          onClick={() => setActivePage(name)}
                        >
                          <span>{name}</span>
                          <span className="quick-arrow">→</span>
                        </button>
                      )
                    )}
                  </div>
                </section>

                <section className="panel">
                  <div className="panel-heading">
                    <h3>Recent Activity</h3>
                    <p>Your latest updates.</p>
                  </div>

                  <div className="empty-state">
                    <strong>No recent activity</strong>
                    <p>Your updates will appear here.</p>
                  </div>
                </section>
              </div>
            </>

          ) : activePage === 'Assignments' ? (
            <div>
              <div className="welcome-section">
                <div>
                  <p className="eyebrow">YOUR WORKSPACE</p>
                  <h1>Assignments</h1>
                  <p className="subtitle">
                    Manage your assignments and deadlines.
                  </p>
                </div>

                <button
                  className="primary-button"
                  onClick={() => {
                    resetAssignmentForm();
                    setShowAssignmentForm(true);
                    setSelectedAssignment(null);
                  }}
                >
                  + Add Assignment
                </button>
              </div>

              {showAssignmentForm && (
                <form
                  className="subject-form"
                  onSubmit={handleAssignmentSubmit}
                >
                  <h2>
                    {editingAssignmentId !== null
                      ? 'Edit Assignment'
                      : 'Add Assignment'}
                  </h2>

                  <label>Assignment Title</label>
                  <input
                    type="text"
                    value={assignmentTitle}
                    onChange={(e) => setAssignmentTitle(e.target.value)}
                    placeholder="Enter assignment title"
                    required
                  />

                  <label>Description</label>
                  <textarea
                    value={assignmentDescription}
                    onChange={(e) =>
                      setAssignmentDescription(e.target.value)
                    }
                    placeholder="Enter assignment details"
                    rows="4"
                  />

                  <label>Due Date</label>
                  <input
                    type="date"
                    value={assignmentDueDate}
                    onChange={(e) => setAssignmentDueDate(e.target.value)}
                  />

                  <label>Status</label>
                  <select
                    value={assignmentStatus}
                    onChange={(e) => setAssignmentStatus(e.target.value)}
                  >
                    <option value="Pending">Pending</option>
                    <option value="Completed">Completed</option>
                  </select>

                  <div className="form-actions">
                    <button type="submit" className="primary-button">
                      {editingAssignmentId !== null
                        ? 'Update'
                        : 'Save Assignment'}
                    </button>

                    <button
                      type="button"
                      className="secondary-button"
                      onClick={resetAssignmentForm}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {assignmentsError && (
                <p className="error-message">{assignmentsError}</p>
              )}

              {assignmentsLoading && <p>Loading assignments...</p>}

              {!assignmentsLoading && assignments.length === 0 && (
                <div className="empty-state">
                  <strong>No assignments yet</strong>
                  <p>
                    Click “Add Assignment” to create your first assignment.
                  </p>
                </div>
              )}

              <div className="subjects-grid">
                {assignments.map((assignment) => (
                  <div className="subject-card" key={assignment.id}>
                    <h3>{assignment.title}</h3>

                    <p>
                      {assignment.description || 'No description provided.'}
                    </p>

                    <p>
                      <strong>Due date:</strong>{' '}
                      {assignment.due_date
                        ? String(assignment.due_date).slice(0, 10)
                        : 'Not set'}
                    </p>

                    <p>
                      <strong>Status:</strong> {assignment.status}
                    </p>

                    <div className="card-actions">
                      <button
                        type="button"
                        onClick={() => setSelectedAssignment(assignment)}
                      >
                        Open
                      </button>

                      <button
                        type="button"
                        onClick={() => handleEditAssignment(assignment)}
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteAssignment(assignment.id)}
                      >
                        Delete
                      </button>

                      <button
                        type="button"
                        onClick={() => handleAssignmentStatusChange(assignment)}
                      >
                        Mark as{' '}
                        {assignment.status === 'Completed'
                          ? 'Pending'
                          : 'Completed'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>


          ) : activePage === 'Projects' ? (
            <div className="projects-page">
              <div>
                <p className="eyebrow">YOUR WORKSPACE</p>
                <h1>Projects</h1>
                <p className="subtitle">
                  Manage your academic projects in one place.
                </p>
                <button
                  className="primary-button"
                  onClick={() => {
                    setEditingProjectId(null);
                    setProjectTitle('');
                    setProjectDescription('');
                    setProjectTechnology('');
                    setProjectStatus('In Progress');
                    setShowProjectForm(true);
                  }}
                >
                  + Add Project
                </button>
              </div>

              {showProjectForm && (
                <form
                  className="subject-form"
                  onSubmit={async (e) => {
                    e.preventDefault();

                    try {
                      setProjectsError('');

                      const projectData = {
                        title: projectTitle,
                        description: projectDescription,
                        technology: projectTechnology,
                        status: projectStatus,
                      };

                      if (editingProjectId) {
                        await updateProject(editingProjectId, projectData);
                      } else {
                        await addProject(projectData);
                      }

                      setProjectTitle('');
                      setProjectDescription('');
                      setProjectTechnology('');
                      setProjectStatus('In Progress');
                      setShowProjectForm(false);

                      await fetchProjects();
                    } catch (error) {
                      setProjectsError(error.message || 'Failed to add project');
                    }
                  }}
                >
                  <h2>{editingProjectId ? 'Edit Project' : 'Add Project'}</h2>

                  <label>Project Title</label>
                  <input
                    type="text"
                    value={projectTitle}
                    onChange={(e) => setProjectTitle(e.target.value)}
                    placeholder="Enter project title"
                    required
                  />

                  <label>Description</label>
                  <textarea
                    value={projectDescription}
                    onChange={(e) => setProjectDescription(e.target.value)}
                    placeholder="Enter project description"
                    rows="3"
                  />

                  <label>Technology</label>
                  <input
                    type="text"
                    value={projectTechnology}
                    onChange={(e) => setProjectTechnology(e.target.value)}
                    placeholder="e.g. React, Node.js, MySQL"
                  />

                  <label>Status</label>
                  <select
                    value={projectStatus}
                    onChange={(e) => setProjectStatus(e.target.value)}
                  >
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="On Hold">On Hold</option>
                  </select>

                  <div className="form-actions">
                    <button type="submit" className="primary-button">
                      Save Project
                    </button>

                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => {
                        setShowProjectForm(false);
                        setEditingProjectId(null);
                        setProjectTitle('');
                        setProjectDescription('');
                        setProjectTechnology('');
                        setProjectStatus('In Progress');
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {projectsError && (
                <p className="error-message">{projectsError}</p>
              )}

              {projectsLoading && <p>Loading projects...</p>}

              {!projectsLoading && projects.length === 0 && (
                <div className="empty-state">
                  <strong>No projects yet</strong>
                  <p>Click “Add Project” to create your first project.</p>
                </div>
              )}

              <div className="projects-grid">
                {projects.map((project) => (
                  <div className="subject-card" key={project.id}>
                    <h3>{project.title}</h3>

                    <p>{project.description || 'No description provided.'}</p>

                    <p>
                      <strong>Technology:</strong>{' '}
                      {project.technology || 'Not specified'}
                    </p>

                    <p>
                      <strong>Status:</strong> {project.status}
                    </p>

                    <div className="form-actions">
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() => handleEditProject(project)}
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className="secondary-button"
                        onClick={async () => {
                          const confirmed = window.confirm(
                            'Are you sure you want to delete this project?'
                          );

                          if (!confirmed) return;

                          try {
                            setProjectsError('');
                            await deleteProject(project.id);
                            await fetchProjects();
                          } catch (error) {
                            setProjectsError(error.message || 'Failed to delete project');
                          }
                        }}
                      >
                        Delete
                      </button>
                    </div>

                  </div>
                ))}
              </div>

            </div>

          ) : (
            <div className="welcome-section">
              <div>
                <p className="eyebrow">YOUR WORKSPACE</p>
                <h1>{activePage}</h1>
                <p className="subtitle">
                  This section will be available as we build EduVault.
                </p>
              </div>
            </div>

          )}
        </section>
      </main>
    </div>
  );
}

export default App;

