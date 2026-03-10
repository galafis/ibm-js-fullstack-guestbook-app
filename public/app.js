/**
 * Guestbook Frontend Application
 *
 * Handles form submission, entry display, and API communication.
 */

const API_BASE = '/api';

const entriesList = document.getElementById('entries-list');
const entryCount = document.getElementById('entry-count');
const form = document.getElementById('guestbook-form');
const formStatus = document.getElementById('form-status');
const submitBtn = document.getElementById('submit-btn');

// Load entries on page load
document.addEventListener('DOMContentLoaded', loadEntries);

// Handle form submission
form.addEventListener('submit', async function (e) {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  const message = document.getElementById('message').value.trim();

  if (!name || !message) {
    showStatus('Please fill in all fields.', 'error');
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = 'Posting...';

  try {
    const response = await fetch(`${API_BASE}/entries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, message }),
    });

    const data = await response.json();

    if (data.success) {
      showStatus('Message posted successfully!', 'success');
      form.reset();
      loadEntries();
    } else {
      showStatus(data.error || 'Failed to post message.', 'error');
    }
  } catch (err) {
    showStatus('Network error. Please try again.', 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Post Message';
  }
});

async function loadEntries() {
  try {
    const response = await fetch(`${API_BASE}/entries`);
    const data = await response.json();

    if (data.success) {
      renderEntries(data.entries);
      entryCount.textContent = `${data.count} message${data.count !== 1 ? 's' : ''}`;
    } else {
      entriesList.innerHTML = '<p class="loading">Failed to load messages.</p>';
    }
  } catch (err) {
    entriesList.innerHTML = '<p class="loading">Failed to connect to server.</p>';
  }
}

function renderEntries(entries) {
  if (entries.length === 0) {
    entriesList.innerHTML = `
      <div class="empty-state">
        <p class="icon">&#128221;</p>
        <p>No messages yet. Be the first to sign the guestbook!</p>
      </div>
    `;
    return;
  }

  entriesList.innerHTML = entries
    .map(entry => `
      <div class="entry-card" data-id="${entry.id}">
        <button class="delete-btn" onclick="deleteEntry('${entry.id}')" title="Delete">&times;</button>
        <div class="entry-header">
          <span class="entry-name">${escapeHtml(entry.name)}</span>
          <span class="entry-date">${formatDate(entry.timestamp)}</span>
        </div>
        <p class="entry-message">${escapeHtml(entry.message)}</p>
      </div>
    `)
    .join('');
}

async function deleteEntry(id) {
  if (!confirm('Are you sure you want to delete this message?')) return;

  try {
    const response = await fetch(`${API_BASE}/entries/${id}`, {
      method: 'DELETE',
    });

    const data = await response.json();
    if (data.success) {
      loadEntries();
    } else {
      showStatus('Failed to delete message.', 'error');
    }
  } catch (err) {
    showStatus('Network error. Please try again.', 'error');
  }
}

function showStatus(message, type) {
  formStatus.textContent = message;
  formStatus.className = `status-message ${type}`;

  setTimeout(() => {
    formStatus.className = 'status-message';
  }, 4000);
}

function formatDate(isoString) {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
