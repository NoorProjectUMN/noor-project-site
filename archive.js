/*
 * Archive page functionality for the Noor Project.
 *
 * This script reads submissions from localStorage and renders only those
 * marked for publication (display === true). Anonymous submissions use
 * the stored pseudonym, while named submissions show the provided name.
 * There is no form on this page; it is purely read‑only.
 */

(() => {
  // Helper to select elements
  const $ = (selector) => document.querySelector(selector);

  const list = $('#archiveList');

  // === Configuration ===
  // If you set FETCH_ENDPOINT to a valid URL that returns a JSON array of
  // submissions, the archive page will load entries from the server. Each
  // submission object should include the same fields used in localStorage
  // (email, name, pseudonym, anonymous, display, type, content, timestamp).
  // Leave this blank to use localStorage only. See README for server setup.
  const FETCH_ENDPOINT = 'https://script.google.com/macros/s/AKfycbxXgoLi99KCf9rH8Ng1aiihMfEzw1ct3GHFQcuMPpP67SLtlR5iVajpUHo4puzlKFI8/exec?published=true';

  // Load all submissions from localStorage. Shared with the main site.
  function loadSubmissions() {
    const json = localStorage.getItem('noorSubmissions');
    if (!json) return [];
    try {
      return JSON.parse(json);
    } catch {
      return [];
    }
  }

  // Fetch submissions from the server (if configured). Returns a promise
  // resolving to an array. Falls back to localStorage on failure.
  async function fetchSubmissions() {
    if (FETCH_ENDPOINT) {
      try {
        const res = await fetch(FETCH_ENDPOINT);
        // Expect JSON data. If the server returns CORS errors, this
        // may fail.
        const data = await res.json();
        if (Array.isArray(data)) {
          return data;
        }
      } catch (err) {
        console.error('Failed to fetch submissions from server', err);
      }
    }
    // Fallback: return data from localStorage
    return loadSubmissions();
  }

  // Render only published submissions to the archive
  async function renderArchive() {
    if (!list) return;
    list.innerHTML = '';
    const submissions = await fetchSubmissions();
    submissions
      .filter((s) => s.display)
      .sort((a, b) => b.timestamp - a.timestamp)
      .forEach((sub) => {
        const card = document.createElement('div');
        card.className = 'submission';
        const meta = document.createElement('div');
        meta.className = 'meta';
        const date = new Date(sub.timestamp).toLocaleString();
        // Display pseudonym for anonymous submissions, otherwise show name.
        const author = sub.anonymous
          ? sub.pseudonym || 'Anonymous'
          : sub.name || 'Unknown';
        meta.textContent = `${author} — ${date}`;
        const content = document.createElement('div');
        content.className = 'content';
        if (sub.type === 'text') {
          content.innerHTML = sub.content;
        } else if (sub.type === 'drawing') {
          const img = document.createElement('img');
          img.src = sub.content;
          img.alt = 'Drawing submission';
          content.appendChild(img);
        }
        card.appendChild(meta);
        card.appendChild(content);
        list.appendChild(card);
      });
  }

  // Update year in footer
  function updateYear() {
    const yearSpan = document.getElementById('year');
    if (yearSpan) {
      yearSpan.textContent = new Date().getFullYear().toString();
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    updateYear();
    renderArchive();
  });
})();