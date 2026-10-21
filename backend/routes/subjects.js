
const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get all subjects
router.get('/', (req, res) => {
    db.query('SELECT * FROM subjects ORDER BY id DESC', (err, results) => {
        if (err) {
            return res.status(500).json({ message: 'Failed to fetch subjects' });
        }

        res.json(results);
    });
});

// Add a subject
router.post('/', (req, res) => {
    const { name, description } = req.body;

    if (!name || !name.trim()) {
        return res.status(400).json({ message: 'Subject name is required' });
    }

    const sql = 'INSERT INTO subjects (name, description) VALUES (?, ?)';

    db.query(sql, [name.trim(), description || ''], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Failed to add subject' });
        }

        res.status(201).json({
            id: result.insertId,
            name: name.trim(),
            description: description || ''
        });
    });
});

// Update a subject
router.put('/:id', (req, res) => {
    const { name, description } = req.body;
    const { id } = req.params;

    if (!name || !name.trim()) {
        return res.status(400).json({ message: 'Subject name is required' });
    }

    const sql = 'UPDATE subjects SET name = ?, description = ? WHERE id = ?';

    db.query(sql, [name.trim(), description || '', id], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Failed to update subject' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Subject not found' });
        }

        res.json({
            id: Number(id),
            name: name.trim(),
            description: description || ''
        });
    });
});

// Delete a subject
router.delete('/:id', (req, res) => {
    db.query('DELETE FROM subjects WHERE id = ?', [req.params.id], (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Failed to delete subject' });
        }

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Subject not found' });
        }

        res.json({ message: 'Subject deleted successfully' });
    });
});

module.exports = router;
