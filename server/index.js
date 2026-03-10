/**
 * Express Server for Guestbook Application
 *
 * Provides REST API endpoints for managing guestbook entries
 * and serves the static frontend files.
 */

const express = require('express');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '..', 'public')));

// API Routes

// GET /api/entries - Retrieve all guestbook entries
app.get('/api/entries', (req, res) => {
  try {
    const entries = db.getAllEntries();
    res.json({
      success: true,
      count: entries.length,
      entries: entries,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to retrieve entries.' });
  }
});

// POST /api/entries - Add a new guestbook entry
app.post('/api/entries', (req, res) => {
  try {
    const { name, message } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, error: 'Name is required.' });
    }
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, error: 'Message is required.' });
    }

    const entry = db.addEntry(name, message);
    res.status(201).json({ success: true, entry: entry });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to add entry.' });
  }
});

// DELETE /api/entries/:id - Delete a guestbook entry
app.delete('/api/entries/:id', (req, res) => {
  try {
    const deleted = db.deleteEntry(req.params.id);
    if (deleted) {
      res.json({ success: true, message: 'Entry deleted.' });
    } else {
      res.status(404).json({ success: false, error: 'Entry not found.' });
    }
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to delete entry.' });
  }
});

// GET /api/stats - Get entry count
app.get('/api/stats', (req, res) => {
  try {
    const count = db.getEntryCount();
    res.json({ success: true, totalEntries: count });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to get stats.' });
  }
});

// Serve frontend for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Guestbook server running on http://localhost:${PORT}`);
});

module.exports = app;
