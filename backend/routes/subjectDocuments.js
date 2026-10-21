const express = require('express');
const router = express.Router();
const db = require('../config/db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Store subject files separately
const uploadDir = path.join(__dirname, '../uploads/subject-documents');

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' +
            Math.round(Math.random() * 1E9) +
            path.extname(file.originalname);

        cb(null, uniqueName);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }
});

// Get files for a subject
router.get('/:subjectId', (req, res) => {
    const sql = `
        SELECT id, subject_id, file_name, uploaded_at
        FROM subject_documents
        WHERE subject_id = ?
        ORDER BY id DESC
    `;

    db.query(sql, [req.params.subjectId], (err, results) => {
        if (err) {
            return res.status(500).json({
                message: 'Failed to fetch subject documents'
            });
        }

        res.json(results);
    });
});

// Upload a file for a subject
router.post('/:subjectId', upload.single('file'), (req, res) => {
    const subjectId = req.params.subjectId;

    if (!req.file) {
        return res.status(400).json({ message: 'Please select a file' });
    }

    db.query(
        'SELECT id FROM subjects WHERE id = ?',
        [subjectId],
        (err, subjects) => {
            if (err || subjects.length === 0) {
                fs.unlink(req.file.path, () => { });
                return res.status(404).json({ message: 'Subject not found' });
            }

            const sql = `
                INSERT INTO subject_documents
                (subject_id, file_name, file_path)
                VALUES (?, ?, ?)
            `;

            db.query(
                sql,
                [
                    subjectId,
                    req.file.originalname,
                    path.relative(path.join(__dirname, '..'), req.file.path)
                ],
                (insertErr, result) => {
                    if (insertErr) {
                        fs.unlink(req.file.path, () => { });
                        return res.status(500).json({
                            message: 'Failed to save subject document'
                        });
                    }

                    res.status(201).json({
                        id: result.insertId,
                        subject_id: Number(subjectId),
                        file_name: req.file.originalname,
                        message: 'File uploaded successfully'
                    });
                }
            );
        }
    );
});

router.get('/:subjectId/open/:fileId', (req, res) => {
    const sql = `
        SELECT file_name, file_path
        FROM subject_documents
        WHERE id = ? AND subject_id = ?
    `;

    db.query(
        sql,
        [req.params.fileId, req.params.subjectId],
        (err, results) => {
            if (err) {
                return res.status(500).json({
                    message: 'Failed to find document'
                });
            }

            if (results.length === 0) {
                return res.status(404).json({
                    message: 'Document not found'
                });
            }

            const filePath = path.resolve(
                __dirname, '..', results[0].file_path
            );

            if (!fs.existsSync(filePath)) {
                return res.status(404).json({
                    message: 'File not found on server'
                });
            }

            res.sendFile(filePath);
        }
    );
});

// Download a subject file
router.get('/:subjectId/download/:fileId', (req, res) => {
    const sql = `
        SELECT file_name, file_path
        FROM subject_documents
        WHERE id = ? AND subject_id = ?
    `;

    db.query(
        sql,
        [req.params.fileId, req.params.subjectId],
        (err, results) => {
            if (err) {
                return res.status(500).json({
                    message: 'Failed to find document'
                });
            }

            if (results.length === 0) {
                return res.status(404).json({ message: 'Document not found' });
            }

            const filePath = path.resolve(
                __dirname, '..', results[0].file_path
            );

            if (!fs.existsSync(filePath)) {
                return res.status(404).json({ message: 'File not found on server' });
            }

            res.download(filePath, results[0].file_name);
        }
    );
});

// Delete a subject file
router.delete('/:subjectId/:fileId', (req, res) => {
    const sql = `
        SELECT file_path
        FROM subject_documents
        WHERE id = ? AND subject_id = ?
    `;

    db.query(sql, [req.params.fileId, req.params.subjectId], (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Failed to find document' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'Document not found' });
        }

        db.query(
            'DELETE FROM subject_documents WHERE id = ? AND subject_id = ?',
            [req.params.fileId, req.params.subjectId],
            (deleteErr) => {
                if (deleteErr) {
                    return res.status(500).json({
                        message: 'Failed to delete document'
                    });
                }

                const filePath = path.resolve(__dirname, '..', results[0].file_path);

                fs.unlink(filePath, (fileErr) => {
                    if (fileErr && fileErr.code !== 'ENOENT') {
                        console.error('File cleanup failed:', fileErr.message);
                    }

                    res.json({ message: 'Document deleted successfully' });
                });
            }
        );
    });
});

module.exports = router;