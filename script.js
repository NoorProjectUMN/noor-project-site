/*
 * Client-side functionality for the Noor Project submission site.
 *
 * This script handles:
 *  - toggling between the text editor and drawing canvas when the user
 *    changes the submission type
 *  - basic text formatting (bold, italic, underline) using
 *    document.execCommand
 *  - setting the foreground colour of selected text
 *  - drawing on a canvas with configurable brush colour and size
 *  - storing submissions to localStorage so they persist between page loads
 *  - rendering submissions to the dashboard when authors opted to display
 */

(() => {
  // === Configuration ===
  // If you set SUBMIT_ENDPOINT to a valid URL (e.g. the URL of your Google
  // Apps Script web app), the site will send each submission to that
  // endpoint using a POST request. Leaving this blank keeps all data
  // client‑side (localStorage only). See README or project docs for
  // instructions on creating a Google Apps Script that saves data to
  // Google Sheets.
  // Updated endpoint after deploying the latest Apps Script web app. This
  // value points to version 3 of the Noor Project backend hosted on
  // Google Apps Script. If you redeploy your script again in the future,
  // remember to update this constant accordingly.
  // Updated endpoint after redeploying the Apps Script web app.  This URL
  // points to version 4 of the backend (created Aug 16 2025) which fixes
  // sheet access and supports cross-device persistence.  If you redeploy
  // your script again later, remember to update this constant.
  // Updated endpoint after the latest Apps Script deployment (Aug 16 2025).
  // We split the URL into parts to avoid extremely long lines that GitHub's
  // editor might wrap incorrectly.  If you redeploy your Apps Script
  // again in the future, update the ID below accordingly.
  const SUBMIT_ENDPOINT =
    'https://script.google.com/macros/s/AKfycbwpB87Ky-hzkvFTsxYN5lJS8tba8UmzujoeUI-0qbmXTFezDDqMSLhkbgLqzRGOZRfQ/exec'
    const FETCH_ENDPOINT = SUBMIT_ENDPOINT;
const FETCH_PUBLISHED_ENDPOINT = SUBMIT_ENDPOINT + "?published=true";
  // Generate a random pseudonym for anonymous submissions. Combines
  // descriptive adjectives and nouns with a number to make it unique.
  function generateRandomUsername() {
    const adjectives = [
      'Luminous',
      'Radiant',
      'Soothing',
      'Gentle',
      'Serene',
      'Mystic',
      'Whispering',
      'Eternal',
      'Sunny',
      'Dancing',
      'Blooming',
      'Dreaming',
      'Hushed',
      'Wandering',
    ];
    const nouns = [
      'Willow',
      'Raven',
      'River',
      'Lotus',
      'Phoenix',
      'Aurora',
      'Meadow',
      'Storm',
      'Sage',
      'Echo',
      'Lantern',
      'Breeze',
      'Crescent',
      'Harbor',
    ];
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const number = Math.floor(Math.random() * 10000);
    return `${adj}${noun}${number}`;
  }
  // Helper to select elements
  const $ = (selector) => document.querySelector(selector);

  // Initialise year in footer
  const yearSpan = $('#year');
  if (yearSpan) {
    yearSpan.textContent = new Date().getFullYear().toString();
  }

  // Elements
  const form = $('#submissionForm');
  const typeInputs = form.querySelectorAll('input[name="type"]');
  const textContainer = $('#textContainer');
  const drawingContainer = $('#drawingContainer');
  const textEditor = $('#textEditor');
  const boldBtn = $('#boldBtn');
  const italicBtn = $('#italicBtn');
  const underlineBtn = $('#underlineBtn');
  const textColor = $('#textColor');
  const drawColor = $('#drawColor');
  const brushSize = $('#brushSize');
  const clearCanvasBtn = $('#clearCanvas');
  const canvas = $('#drawingCanvas');
  const submissionsList = $('#submissionsList');

  // Toggle between text and drawing containers
  function updateType() {
    const selectedType = form.querySelector('input[name="type"]:checked').value;
    if (selectedType === 'text') {
      textContainer.classList.remove('hidden');
      drawingContainer.classList.add('hidden');
    } else {
      textContainer.classList.add('hidden');
      drawingContainer.classList.remove('hidden');
    }
  }

  typeInputs.forEach((input) => {
    input.addEventListener('change', updateType);
  });

  // Basic rich text commands
  function execCmd(command, value = null) {
    document.execCommand(command, false, value);
  }
  boldBtn.addEventListener('click', () => execCmd('bold'));
  italicBtn.addEventListener('click', () => execCmd('italic'));
  underlineBtn.addEventListener('click', () => execCmd('underline'));
  // Set selected text colour using execCommand
  textColor.addEventListener('input', (e) => {
    execCmd('foreColor', e.target.value);
  });

  // Canvas drawing setup
  const ctx = canvas.getContext('2d');
  let drawing = false;
  // Set initial stroke properties
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.strokeStyle = drawColor.value;
  ctx.lineWidth = Number(brushSize.value);

  function getPos(evt) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: evt.clientX - rect.left,
      y: evt.clientY - rect.top,
    };
  }

  function startDraw(evt) {
    drawing = true;
    ctx.beginPath();
    const pos = getPos(evt);
    ctx.moveTo(pos.x, pos.y);
  }

  function draw(evt) {
    if (!drawing) return;
    const pos = getPos(evt);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  }

  function endDraw() {
    drawing = false;
    ctx.closePath();
  }

  // Mouse events
  canvas.addEventListener('mousedown', startDraw);
  canvas.addEventListener('mousemove', draw);
  canvas.addEventListener('mouseup', endDraw);
  canvas.addEventListener('mouseleave', endDraw);
  // Touch events for mobile
  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    startDraw({ clientX: touch.clientX, clientY: touch.clientY });
  });
  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    draw({ clientX: touch.clientX, clientY: touch.clientY });
  });
  canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    endDraw();
  });

  // Update brush colour and size when inputs change
  drawColor.addEventListener('input', (e) => {
    ctx.strokeStyle = e.target.value;
  });
  brushSize.addEventListener('input', (e) => {
    ctx.lineWidth = Number(e.target.value);
  });
  clearCanvasBtn.addEventListener('click', () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  });

  // Local storage helper functions
  function loadSubmissions() {
    const json = localStorage.getItem('noorSubmissions');
    if (!json) return [];
    try {
      return JSON.parse(json);
    } catch {
      return [];
    }
  }
  function saveSubmissions(list) {
    localStorage.setItem('noorSubmissions', JSON.stringify(list));
  }

  // Render submissions to the dashboard
  function renderSubmissions() {
    submissionsList.innerHTML = '';
    const submissions = loadSubmissions();
    submissions
      .filter((s) => s.display)
      .sort((a, b) => b.timestamp - a.timestamp)
      .forEach((sub) => {
        const card = document.createElement('div');
        card.className = 'submission';
        const meta = document.createElement('div');
        meta.className = 'meta';
        const date = new Date(sub.timestamp).toLocaleString();
        // Determine how to display the author. If the submission is
        // anonymous, show the generated pseudonym. Otherwise show the
        // supplied name (falling back to Unknown if blank).
        const author = sub.anonymous
          ? sub.pseudonym || 'Anonymous'
          : sub.name || 'Unknown';
        meta.textContent = `${author} — ${date}`;
        const content = document.createElement('div');
        content.className = 'content';
        if (sub.type === 'text') {
          // Set as HTML (trusted from user). Could be sanitized in a real app
          content.innerHTML = sub.content;
        } else if (sub.type === 'drawing') {
          const img = document.createElement('img');
          img.src = sub.content;
          img.alt = 'Drawing submission';
          content.appendChild(img);
        }
        card.appendChild(meta);
        card.appendChild(content);
        submissionsList.appendChild(card);
      });
  }

  // Form submission handler
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = $('#email').value.trim();
    const name = $('#name').value.trim();
    const anonymousVal = form.querySelector('input[name="anonymous"]:checked').value;
    const displayVal = form.querySelector('input[name="display"]:checked').value;
    const type = form.querySelector('input[name="type"]:checked').value;
    // Basic validation: rely on HTML5 email pattern; check content not empty
    let content;
    if (type === 'text') {
      content = textEditor.innerHTML.trim();
      if (!content) {
        alert('Please write something in the text editor before submitting.');
        return;
      }
    } else {
      // Convert canvas to data URL (PNG)
      content = canvas.toDataURL('image/png');
      // Also require drawing not empty (pixels). We check if canvas is blank
      // by examining pixel data.
      const blank = isCanvasBlank(canvas);
      if (blank) {
        alert('Please draw something on the canvas before submitting.');
        return;
      }
    }
    const submissions = loadSubmissions();
    // Generate a pseudonym if the user chose to remain anonymous. This ensures
    // anonymous submissions are still identifiable to the admin without
    // revealing personal details.
    const pseudonym = anonymousVal === 'yes' ? generateRandomUsername() : '';
    submissions.push({
      email,
      name,
      pseudonym,
      anonymous: anonymousVal === 'yes',
      display: displayVal === 'yes',
      type,
      content,
      timestamp: Date.now(),
    });
    saveSubmissions(submissions);

    // If an endpoint is configured, send the submission to the server.
    if (SUBMIT_ENDPOINT) {
      const payload = {
        email,
        name,
        pseudonym,
        anonymous: anonymousVal === 'yes',
        display: displayVal === 'yes',
        type,
        content,
        timestamp: Date.now(),
      };
      // Fire and forget; we do not await the response to avoid blocking the UI.
      fetch(SUBMIT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        // Use no‑cors mode to suppress CORS errors if the endpoint does not
        // return proper CORS headers. The server will still receive the data.
        mode: 'no-cors',
      }).catch((err) => console.error('Error sending submission to server', err));
    }
    renderSubmissions();
    // Reset form fields after submission
    form.reset();
    // Reset editor & canvas
    textEditor.innerHTML = '';
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    updateType();
    alert('Thank you for your submission!');
  });

  // Check if canvas is blank by comparing pixel data
  function isCanvasBlank(c) {
    const bctx = c.getContext('2d');
    const pixelBuffer = new Uint32Array(
      bctx.getImageData(0, 0, c.width, c.height).data.buffer
    );
    return !pixelBuffer.some((color) => color !== 0);
  }

  // Render existing submissions on page load
  document.addEventListener('DOMContentLoaded', () => {
    renderSubmissions();
    updateType();
  });
})();
