
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const upload = require('../config/multer');
const path = require('path');
const fs = require('fs');

// GET: Fetch all documents
router.get('/', (req, res) => {
    db.query(
        'SELECT * FROM documents ORDER BY uploaded_at DESC',
        (err, results) => {
            if (err) {
                return res.status(500).json({
                    message: 'Failed to fetch documents'
                });
            }

            res.json(results);
        }
    );
});

// POST: Upload a document
router.post('/upload', upload.single('document'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({
            message: 'Please select a file'
        });
    }

    const { originalname, filename, mimetype, path: filePath } = req.file;

    const sql = `
        INSERT INTO documents (name, original_name, file_path, file_type)
        VALUES (?, ?, ?, ?)
    `;

    db.query(
        sql,
        [originalname, originalname, filename, mimetype],
        (err, result) => {
            if (err) {
                fs.unlink(filePath, () => {});
                return res.status(500).json({
                    message: 'Failed to save document'
                });
            }

            res.status(201).json({
                message: 'Document uploaded successfully',
                id: result.insertId
            });
        }
    );
});

// GET: Download a document
router.get('/download/:id', (req, res) => {
    db.query(
        'SELECT * FROM documents WHERE id = ?',
        [req.params.id],
        (err, results) => {
            if (err) {
                return res.status(500).json({
                    message: 'Database error'
                });
            }

            if (results.length === 0) {
                return res.status(404).json({
                    message: 'Document not found'
                });
            }

            const document = results[0];
            const filePath = path.join(
                __dirname,
                '../uploads',
                document.file_path
            );

            res.download(filePath, document.original_name, (err) => {
                if (err && !res.headersSent) {
                    res.status(404).json({
                        message: 'File not found on server'
                    });
                }
            });
        }
    );
});

// DELETE: Delete a document
router.delete('/:id', (req, res) => {
    db.query(
        'SELECT * FROM documents WHERE id = ?',
        [req.params.id],
        (err, results) => {
            if (err) {
                return res.status(500).json({
                    message: 'Database error'
                });
            }

            if (results.length === 0) {
                return res.status(404).json({
                    message: 'Document not found'
                });
            }

            const document = results[0];
            const filePath = path.join(
                __dirname,
                '../uploads',
                document.file_path
            );

            db.query(
                'DELETE FROM documents WHERE id = ?',
                [req.params.id],
                (deleteErr) => {
                    if (deleteErr) {
                        return res.status(500).json({
                            message: 'Failed to delete document'
                        });
                    }

                    fs.unlink(filePath, (fileErr) => {
                        if (fileErr && fileErr.code !== 'ENOENT') {
                            console.error(
                                'File deletion failed:',
                                fileErr.message
                            );
                        }
                    });

                    res.json({
                        message: 'Document deleted successfully'
                    });
                }
            );
        }
    );
});

module.exports = router;
