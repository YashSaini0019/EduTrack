
const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get all assignments
router.get('/', (req, res) => {
  db.query(
    'SELECT * FROM assignments ORDER BY due_date ASC, id DESC',
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Could not fetch assignments' });
      }

      res.json(results);
    }
  );
});

// Get one assignment
router.get('/:id', (req, res) => {
  db.query(
    'SELECT * FROM assignments WHERE id = ?',
    [req.params.id],
    (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Could not fetch assignment' });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: 'Assignment not found' });
      }

      res.json(results[0]);
    }
  );
});

// Add assignment
router.post('/', (req, res) => {
  const { title, description, due_date } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Title is required' });
  }

  db.query(
    `INSERT INTO assignments (title, description, due_date)
     VALUES (?, ?, ?)`,
    [title.trim(), description || null, due_date || null],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Could not add assignment' });
      }

      db.query(
        'SELECT * FROM assignments WHERE id = ?',
        [result.insertId],
        (selectErr, rows) => {
          if (selectErr) {
            return res.status(500).json({
              error: 'Assignment saved, but could not retrieve it',
            });
          }

          res.status(201).json(rows[0]);
        }
      );
    }
  );
});

// Update assignment
router.put('/:id', (req, res) => {
  const { title, description, due_date, status } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Title is required' });
  }

  if (!['Pending', 'Completed'].includes(status)) {
    return res.status(400).json({ error: 'Invalid assignment status' });
  }

  db.query(
    `UPDATE assignments
     SET title = ?, description = ?, due_date = ?, status = ?
     WHERE id = ?`,
    [
      title.trim(),
      description || null,
      due_date || null,
      status,
      req.params.id,
    ],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Could not update assignment' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Assignment not found' });
      }

      db.query(
        'SELECT * FROM assignments WHERE id = ?',
        [req.params.id],
        (selectErr, rows) => {
          if (selectErr) {
            return res.status(500).json({
              error: 'Assignment updated, but could not retrieve it',
            });
          }

          res.json(rows[0]);
        }
      );
    }
  );
});

// Delete assignment
router.delete('/:id', (req, res) => {
  db.query(
    'DELETE FROM assignments WHERE id = ?',
    [req.params.id],
    (err, result) => {
      if (err) {
        return res.status(500).json({ error: 'Could not delete assignment' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Assignment not found' });
      }

      res.json({ message: 'Assignment deleted successfully' });
    }
  );
});

module.exports = router;
