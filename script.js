const STORAGE_PREFIX = 'rollenkarten-v2-';
const COOKIE_DAYS = 30;

const input = document.querySelector('#nameInput');
const form = document.querySelector('#nameForm');
const nameList = document.querySelector('#nameList');
const results = document.querySelector('#results');
const assignButton = document.querySelector('#assignButton');
const clearButton = document.querySelector('#clearButton');

let names = [];
let assignments = [];

function storageKey(key) {
  return `${STORAGE_PREFIX}${key}`;
}

function setCookie(key, value) {
  try {
    const expires = new Date(Date.now() + COOKIE_DAYS * 24 * 60 * 60 * 1000).toUTCString();
    document.cookie = `${storageKey(key)}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
  } catch {}
}

function getCookie(key) {
  const name = `${storageKey(key)}=`;
  return document.cookie
    .split(';')
    .map(part => part.trim())
    .find(part => part.startsWith(name))
    ?.slice(name.length);
}

function saveValue(key, value) {
  const text = typeof value === 'string' ? value : JSON.stringify(value);
  localStorage.setItem(storageKey(key), text);
  if (text.length < 3500) setCookie(key, text);
}

function loadValue(key, fallback = '') {
  const local = localStorage.getItem(storageKey(key));
  if (local !== null) return local;
  const cookie = getCookie(key);
  return cookie ? decodeURIComponent(cookie) : fallback;
}

function loadJson(key, fallback) {
  try {
    return JSON.parse(loadValue(key, JSON.stringify(fallback))) || fallback;
  } catch {
    return fallback;
  }
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#039;',
    '"': '&quot;'
  }[char]));
}

function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function saveNames() {
  saveValue('names', names);
}

function saveAssignments() {
  saveValue('assignments', assignments);
}

function loadHomeState() {
  names = loadJson('names', []);
  assignments = loadJson('assignments', []);
}

function renderNames() {
  if (!nameList) return;
  nameList.innerHTML = '';

  if (names.length === 0) {
    const li = document.createElement('li');
    li.className = 'muted-row';
    li.textContent = 'Noch keine Namen eingetragen.';
    nameList.appendChild(li);
    return;
  }

  names.forEach((name, index) => {
    const li = document.createElement('li');
    li.innerHTML = `<span>${escapeHtml(name)}</span><button type="button" aria-label="${escapeHtml(name)} entfernen">×</button>`;
    li.querySelector('button').addEventListener('click', () => {
      names.splice(index, 1);
      assignments = [];
      saveNames();
      saveAssignments();
      renderNames();
      renderAssignments();
    });
    nameList.appendChild(li);
  });
}

function renderAssignments() {
  if (!results) return;

  if (!assignments.length) {
    results.innerHTML = '<p class="empty-state">Noch keine Verteilung. Trage Namen ein und starte die Zufallsauswahl.</p>';
    return;
  }

  results.innerHTML = assignments.map(item => `
    <article class="assignment ${item.className}">
      <span>${escapeHtml(item.role)}</span>
      <strong>${escapeHtml(item.name)}</strong>
    </article>
  `).join('');
}

function assignRoles() {
  if (names.length < 2) {
    results.innerHTML = '<p class="empty-state warning">Bitte mindestens zwei Namen eintragen.</p>';
    return;
  }

  const shuffled = shuffle(names);
  assignments = shuffled.map((name, index) => {
    if (index === 0) return { name, role: 'Lehrkraft', className: 'teacher' };
    if (index === 1) return { name, role: 'Schüler/in', className: 'student' };
    return { name, role: 'Beobachter/in', className: 'observer' };
  });

  saveAssignments();
  renderAssignments();
}

function setupHome() {
  if (!form) return;
  loadHomeState();
  renderNames();
  renderAssignments();

  form.addEventListener('submit', event => {
    event.preventDefault();
    const value = input.value.trim();
    if (!value) return;

    if (!names.some(name => name.toLowerCase() === value.toLowerCase())) {
      names.push(value);
      assignments = [];
      saveNames();
      saveAssignments();
      renderNames();
      renderAssignments();
    }

    input.value = '';
    input.focus();
  });

  assignButton?.addEventListener('click', assignRoles);

  clearButton?.addEventListener('click', () => {
    names = [];
    assignments = [];
    saveNames();
    saveAssignments();
    renderNames();
    renderAssignments();
  });
}

function setupAutosaveFields() {
  document.querySelectorAll('[data-save-key]').forEach(field => {
    const key = field.dataset.saveKey;
    field.value = loadValue(key, '');
    field.addEventListener('input', () => saveValue(key, field.value));
  });
}

function clearCookies() {
  document.cookie.split(';').forEach(cookie => {
    const eqPos = cookie.indexOf('=');
    const name = eqPos > -1 ? cookie.slice(0, eqPos).trim() : cookie.trim();
    if (name.startsWith(STORAGE_PREFIX)) {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
    }
  });
}

function resetWebsite() {
  Object.keys(localStorage)
    .filter(key => key.startsWith(STORAGE_PREFIX))
    .forEach(key => localStorage.removeItem(key));
  clearCookies();
  window.location.href = 'index.html';
}

function setupReset() {
  document.querySelectorAll('[data-reset]').forEach(button => {
    button.addEventListener('click', () => {
      const confirmed = window.confirm('Alle eingetragenen Namen, Verteilungen, Notizen und Reflexionen löschen?');
      if (confirmed) resetWebsite();
    });
  });
}

setupHome();
setupAutosaveFields();
setupReset();
