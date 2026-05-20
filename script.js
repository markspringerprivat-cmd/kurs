const STORAGE_PREFIX = 'rollenkarten-v3-';
const COOKIE_DAYS = 60;

let names = [];
let assignments = [];

function storageKey(key) {
  return `${STORAGE_PREFIX}${key}`;
}

function setCookie(key, value) {
  try {
    const expires = new Date(Date.now() + COOKIE_DAYS * 24 * 60 * 60 * 1000).toUTCString();
    document.cookie = `${storageKey(key)}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
  } catch (error) {
    console.warn('Cookie konnte nicht gesetzt werden:', error);
  }
}

function getCookie(key) {
  try {
    const name = `${storageKey(key)}=`;
    const entry = document.cookie
      .split(';')
      .map(part => part.trim())
      .find(part => part.startsWith(name));
    return entry ? decodeURIComponent(entry.slice(name.length)) : null;
  } catch {
    return null;
  }
}

function saveValue(key, value) {
  const text = typeof value === 'string' ? value : JSON.stringify(value);
  try {
    localStorage.setItem(storageKey(key), text);
  } catch (error) {
    console.warn('localStorage konnte nicht beschrieben werden:', error);
  }
  if (text.length < 3500) setCookie(key, text);
  showSaveStatus('Gespeichert');
}

function loadValue(key, fallback = '') {
  try {
    const local = localStorage.getItem(storageKey(key));
    if (local !== null) return local;
  } catch {}
  const cookie = getCookie(key);
  return cookie !== null ? cookie : fallback;
}

function loadJson(key, fallback) {
  try {
    const raw = loadValue(key, JSON.stringify(fallback));
    return JSON.parse(raw) || fallback;
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

function showSaveStatus(text) {
  const status = document.querySelector('[data-save-status]');
  if (!status) return;
  status.textContent = text;
  status.classList.add('visible');
  window.clearTimeout(showSaveStatus.timer);
  showSaveStatus.timer = window.setTimeout(() => status.classList.remove('visible'), 1800);
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
  const nameList = document.querySelector('#nameList');
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
  const results = document.querySelector('#results');
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
  const results = document.querySelector('#results');
  if (names.length < 2) {
    if (results) results.innerHTML = '<p class="empty-state warning">Bitte mindestens zwei Namen eintragen.</p>';
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
  const form = document.querySelector('#nameForm');
  const input = document.querySelector('#nameInput');
  const assignButton = document.querySelector('#assignButton');
  const clearButton = document.querySelector('#clearButton');

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
    field.addEventListener('change', () => saveValue(key, field.value));
  });
}

function saveAllVisibleInputs() {
  document.querySelectorAll('[data-save-key]').forEach(field => {
    saveValue(field.dataset.saveKey, field.value || '');
  });
  saveNames();
  saveAssignments();
  showSaveStatus('Alles gespeichert');
}

function clearCookies() {
  try {
    document.cookie.split(';').forEach(cookie => {
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.slice(0, eqPos).trim() : cookie.trim();
      if (name.startsWith(STORAGE_PREFIX)) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
      }
    });
  } catch {}
}

function resetWebsite() {
  try {
    Object.keys(localStorage)
      .filter(key => key.startsWith(STORAGE_PREFIX))
      .forEach(key => localStorage.removeItem(key));
  } catch {}
  clearCookies();
  window.location.href = 'index.html';
}

function setupTopbarStorageControls() {
  const topbar = document.querySelector('.topbar');
  if (!topbar) return;

  let actions = topbar.querySelector('.top-actions');
  if (!actions) {
    actions = document.createElement('div');
    actions.className = 'top-actions';
    topbar.appendChild(actions);
  }

  if (!actions.querySelector('[data-save-now]')) {
    const saveButton = document.createElement('button');
    saveButton.className = 'save-button';
    saveButton.type = 'button';
    saveButton.dataset.saveNow = 'true';
    saveButton.textContent = 'Eingaben speichern';
    saveButton.addEventListener('click', saveAllVisibleInputs);
    actions.insertBefore(saveButton, actions.firstChild);
  }

  if (!actions.querySelector('[data-save-status]')) {
    const status = document.createElement('span');
    status.className = 'save-status';
    status.dataset.saveStatus = 'true';
    actions.insertBefore(status, actions.firstChild);
  }
}

function setupReset() {
  document.querySelectorAll('[data-reset]').forEach(button => {
    button.addEventListener('click', () => {
      const confirmed = window.confirm('Alle eingetragenen Namen, Verteilungen, Notizen und Reflexionen löschen?');
      if (confirmed) resetWebsite();
    });
  });
}

window.addEventListener('beforeunload', saveAllVisibleInputs);

document.addEventListener('DOMContentLoaded', () => {
  setupTopbarStorageControls();
  setupHome();
  setupAutosaveFields();
  setupReset();
});
