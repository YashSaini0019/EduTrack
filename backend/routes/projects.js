
const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get all projects
router.get('/', (req, res) => {
  const sql = 'SELECT * FROM projects ORDER BY created_at DESC';

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching projects:', err);
      return res.status(500).json({ error: 'Failed to fetch projects' });
    }

    res.json(results);
  });
});

// Add a project
router.post('/', (req, res) => {
  const { title, description, technology, status } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Project title is required' });
  }

  const sql = `
    INSERT INTO projects (title, description, technology, status)
    VALUES (?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      title.trim(),
      description || '',
      technology || '',
      status || 'In Progress'
    ],
    (err, result) => {
      if (err) {
        console.error('Error adding project:', err);
        return res.status(500).json({ error: 'Failed to add project' });
      }

      res.status(201).json({
        message: 'Project added successfully',
        id: result.insertId
      });
    }
  );
});

// Update a project
router.put('/:id', (req, res) => {
  const { title, description, technology, status } = req.body;
  const { id } = req.params;

  if (!title || !title.trim()) {
    return res.status(400).json({
      error: 'Project title is required',
    });
  }

  const sql = `
    UPDATE projects
    SET title = ?, description = ?, technology = ?, status = ?
    WHERE id = ?
  `;

  db.query(
    sql,
    [
      title.trim(),
      description || '',
      technology || '',
      status || 'In Progress',
      id,
    ],
    (err, result) => {
      if (err) {
        console.error('Error updating project:', err);
        return res.status(500).json({
          error: 'Failed to update project',
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          error: 'Project not found',
        });
      }

      res.json({ message: 'Project updated successfully' });
    }
  );
});

// Delete a project
router.delete('/:id', (req, res) => {
  const { id } = req.params;

  db.query('DELETE FROM projects WHERE id = ?', [id], (err, result) => {
    if (err) {
      console.error('Error deleting project:', err);
      return res.status(500).json({
        error: 'Failed to delete project',
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        error: 'Project not found',
      });
    }

    res.json({ message: 'Project deleted successfully' });
  });
});

module.exports = router;
