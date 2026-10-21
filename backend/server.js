/*const express = require('express');
const app = express();
const PORT = 8000;

app.get('/', (req, res) => {
    res.send('Academic Backend is running!');
});

app.listen(PORT, '127.0.0.1', () => {
    console.log(`Server running on http://127.0.0.1:${PORT}`);
});
*/
/*
const express = require("express");
const cors = require("cors");

const app = express();

const PORT = 8000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Academic Backend is running!");
});

app.listen(PORT, '127.0.0.1', () => {
    console.log(`Server running on http://127.0.0.1:${PORT}`);
});
*/



const express = require('express');
const cors = require('cors');
require('./config/db');

const app = express();
const PORT = 8000;

app.use(cors());
app.use(express.json());

// Subjects API
const subjectsRoutes = require('./routes/subjects');
app.use('/api/subjects', subjectsRoutes);

const assignmentsRoutes = require('./routes/assignments');
app.use('/api/assignments', assignmentsRoutes);

// Documents API - NEW
const documentsRoutes = require('./routes/documents');
app.use('/api/documents', documentsRoutes);

const projectRoutes = require('./routes/projects');
app.use('/api/projects', projectRoutes);

// Subject-specific Notes & PDFs API
const subjectDocumentsRoutes = require('./routes/subjectDocuments');
app.use('/api/subject-documents', subjectDocumentsRoutes);

app.get('/', (req, res) => {
    res.send('Academic Backend is running!');
});

app.listen(PORT, '127.0.0.1', () => {
    console.log(`Server running on http://127.0.0.1:${PORT}`);
});
