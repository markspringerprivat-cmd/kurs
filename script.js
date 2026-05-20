const input = document.querySelector('#nameInput');
const form = document.querySelector('#nameForm');
const nameList = document.querySelector('#nameList');
const results = document.querySelector('#results');
const assignButton = document.querySelector('#assignButton');
const clearButton = document.querySelector('#clearButton');

let names = [];

function saveNames() {
  localStorage.setItem('rollenkarten-names', JSON.stringify(names));
}

function loadNames() {
  try {
    names = JSON.parse(localStorage.getItem('rollenkarten-names')) || [];
  } catch {
    names = [];
  }
}

function renderNames() {
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
      saveNames();
      renderNames();
    });
    nameList.appendChild(li);
  });
}

function escapeHtml(value) {
  return value.replace(/[&<>'"]/g, char => ({
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

function assignRoles() {
  if (names.length < 2) {
    results.innerHTML = '<p class="empty-state warning">Bitte mindestens zwei Namen eintragen.</p>';
    return;
  }

  const shuffled = shuffle(names);
  const assignments = shuffled.map((name, index) => {
    if (index === 0) return { name, role: 'Lehrkraft', className: 'teacher' };
    if (index === 1) return { name, role: 'Schüler/in', className: 'student' };
    return { name, role: 'Beobachter/in', className: 'observer' };
  });

  results.innerHTML = assignments.map(item => `
    <article class="assignment ${item.className}">
      <span>${escapeHtml(item.role)}</span>
      <strong>${escapeHtml(item.name)}</strong>
    </article>
  `).join('');
}

form?.addEventListener('submit', event => {
  event.preventDefault();
  const value = input.value.trim();
  if (!value) return;
  if (!names.some(name => name.toLowerCase() === value.toLowerCase())) {
    names.push(value);
    saveNames();
    renderNames();
  }
  input.value = '';
  input.focus();
});

assignButton?.addEventListener('click', assignRoles);

clearButton?.addEventListener('click', () => {
  names = [];
  saveNames();
  renderNames();
  results.innerHTML = '<p class="empty-state">Noch keine Verteilung. Trage Namen ein und starte die Zufallsauswahl.</p>';
});

loadNames();
renderNames();
