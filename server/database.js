/**
 * JSON File-Based Storage for Guestbook
 *
 * Provides CRUD operations for guestbook entries
 * using a local JSON file as the data store.
 */

const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', 'data', 'entries.json');

function ensureDataDir() {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2), 'utf8');
  }
}

function readEntries() {
  ensureDataDir();
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (err) {
    return [];
  }
}

function writeEntries(entries) {
  ensureDataDir();
  fs.writeFileSync(DATA_FILE, JSON.stringify(entries, null, 2), 'utf8');
}

function getAllEntries() {
  return readEntries().sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

function addEntry(name, message) {
  if (!name || !message) {
    throw new Error('Name and message are required.');
  }

  const entries = readEntries();
  const newEntry = {
    id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
    name: name.trim(),
    message: message.trim(),
    timestamp: new Date().toISOString(),
  };

  entries.push(newEntry);
  writeEntries(entries);
  return newEntry;
}

function deleteEntry(id) {
  const entries = readEntries();
  const filtered = entries.filter(e => e.id !== id);

  if (filtered.length === entries.length) {
    return false;
  }

  writeEntries(filtered);
  return true;
}

function getEntryCount() {
  return readEntries().length;
}

module.exports = {
  getAllEntries,
  addEntry,
  deleteEntry,
  getEntryCount,
};
