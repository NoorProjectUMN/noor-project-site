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

  // === Configuration ===
  // If you set FETCH_ENDPOINT to a valid URL returning a JSON array of
  // submissions, the admin page will load entries from the server. Leave
  // blank to use localStorage only. See README for server setup.
  // Endpoint for loading all submissions from the Google Apps Script backend.  
  // This URL should point to the deployed Apps Script web app without any query
  // parameters. The admin dashboard will fetch both published and unpublished
  // entries from this endpoint.
  // Updated endpoint for retrieving all submissions (published and unpublished)
  // from the latest Apps Script deployment. This URL must not include
  // query parameters so that the admin dashboard can see every entry.
  // Updated endpoint for retrieving all submissions (published and
  // unpublished) from the latest Apps Script deployment (version 4,
  // Aug 16 2025).  If you redeploy your script again, update this URL.
// Updated endpoint for retrieving all submissions (published and
// unpublished) from the latest Apps Script deployment (Aug 16 2025).
// We split the URL into parts to prevent editors from wrapping the
// string and introducing unwanted line breaks.  If you redeploy
// your Apps Script again, update the ID below accordingly.
const FETCH_ENDPOINT =
    'https://script.google.com/macros/s/' +
    'AKfcybyt40ZjrousE-nwapWFk0anNMCoVh1byNz5cbFpS2vNR64TJIDDOn4_h2idv9TADsq' +
    '/exec';

  function loadSubmissions() {
    const json = localStorage.getItem('noorSubmissions');
    if (!json) return [];
    try {
      return JSON.parse(json);
    } catch {
      return [];
    }
  }

  async function fetchSubmissions() {
    if (FETCH_ENDPOINT) {
      try {
        const res = await fetch(FETCH_ENDPOINT);
        const data = await res.json();
        if (Array.isArray(data)) {
          return data;
        }
      } catch (err) {
        console.error('Failed to fetch submissions from server', err);
      }
    }
    return loadSubmissions();
  }

  async function renderAdmin() {
    if (!list) return;
    list.innerHTML = '';
    const submissions = await fetchSubmissions();
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