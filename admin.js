/*
 * Admin dashboard functionality for the Noor Project.
 *
 * This script reads all submissions from localStorage and renders them for
 * administrative review. Both published and unpublished items are shown.
 * Anonymous submissions use their pseudonym for display. A status label
 * indicates whether the piece is visible on the public archive.
 */

(() => {
  // Helper
  const $ = (selector) => document.querySelector(selector);
  const list = $('#adminList');

  function loadSubmissions() {
    const json = localStorage.getItem('noorSubmissions');
    if (!json) return [];
    try {
      return JSON.parse(json);
    } catch {
      return [];
    }
  }

  function renderAdmin() {
    if (!list) return;
    list.innerHTML = '';
    const submissions = loadSubmissions();
    submissions
      .sort((a, b) => b.timestamp - a.timestamp)
      .forEach((sub) => {
        const card = document.createElement('div');
        card.className = 'submission';
        const meta = document.createElement('div');
        meta.className = 'meta';
        const date = new Date(sub.timestamp).toLocaleString();
        const author = sub.anonymous
          ? sub.pseudonym || 'Anonymous'
          : sub.name || 'Unknown';
        const status = sub.display ? 'Published' : 'Private';
        meta.textContent = `${author} — ${date} — ${status}`;
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
        // Show the UMN email to admins below the content
        const emailDiv = document.createElement('div');
        emailDiv.className = 'meta';
        emailDiv.textContent = `Email: ${sub.email}`;
        card.appendChild(emailDiv);
        list.appendChild(card);
      });
  }

  function updateYear() {
    const yearSpan = document.getElementById('year');
    if (yearSpan) {
      yearSpan.textContent = new Date().getFullYear().toString();
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    updateYear();
    renderAdmin();
  });
})();