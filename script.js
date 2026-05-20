const STORAGE_PREFIX = 'rollenkarten-v6-';
const LEGACY_STORAGE_PREFIXES = ['rollenkarten-v5-', 'rollenkarten-v4-', 'rollenkarten-v3-', 'rollenkarten-v2-', 'rollenkarten-'];
let isResetting = false;
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
  const nextButton = document.querySelector('#nextToCards');
  if (!results) return;

  if (!assignments.length) {
    results.innerHTML = '<p class="empty-state">Noch keine Verteilung. Trage Namen ein und starte die Zufallsauswahl.</p>';
    nextButton?.classList.add('hidden');
    return;
  }

  nextButton?.classList.remove('hidden');

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
    document.querySelector('#nextToCards')?.classList.add('hidden');
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

function allStoragePrefixes() {
  return [STORAGE_PREFIX, ...LEGACY_STORAGE_PREFIXES];
}

function hasKnownPrefix(key) {
  return allStoragePrefixes().some(prefix => key.startsWith(prefix));
}

function clearCookies() {
  try {
    document.cookie.split(';').forEach(cookie => {
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.slice(0, eqPos).trim() : cookie.trim();
      if (hasKnownPrefix(name)) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; SameSite=Lax`;
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${location.pathname}; SameSite=Lax`;
      }
    });
  } catch {}
}

function resetWebsite() {
  isResetting = true;
  document.querySelectorAll('[data-save-key]').forEach(field => { field.value = ''; });
  try {
    Object.keys(localStorage)
      .filter(hasKnownPrefix)
      .forEach(key => localStorage.removeItem(key));
  } catch {}
  clearCookies();
  window.location.replace('index.html');
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

window.addEventListener('beforeunload', () => {
  if (!isResetting) saveAllVisibleInputs();
});


function getSaved(key, fallback = '') {
  return loadValue(key, fallback);
}

function getExportData() {
  return {
    assignments: loadJson('assignments', []),
    reflection: {
      'Was ist im Gespräch passiert?': getSaved('reflexion-verlauf'),
      'Welche Aussagen oder Verhaltensweisen haben die Beziehung gefördert?': getSaved('reflexion-foerdernd'),
      'Welche Aussagen oder Verhaltensweisen haben den Konflikt verschärft?': getSaved('reflexion-belastend'),
      'Wie haben Tonfall, Wortwahl und Körpersprache gewirkt?': getSaved('reflexion-wirkung'),
      'Was könnte beim nächsten Gespräch anders oder besser gemacht werden?': getSaved('reflexion-verbesserung')
    }
  };
}

function textOrDash(value) {
  return value && value.trim() ? value.trim() : '—';
}

function roleClass(role) {
  if (role.includes('Lehrkraft')) return 'teacher';
  if (role.includes('Schüler')) return 'student';
  return 'observer';
}

function buildExportHtml() {
  const data = getExportData();
  const date = new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const assignmentRows = data.assignments.length
    ? data.assignments.map(item => `
      <tr>
        <td><span class="role-pill ${roleClass(item.role)}">${escapeHtml(item.role)}</span></td>
        <td>${escapeHtml(item.name)}</td>
      </tr>
    `).join('')
    : '<tr><td colspan="2" class="empty">Noch keine Rollenverteilung gespeichert.</td></tr>';

  const reflection = Object.entries(data.reflection).map(([title, value], index) => `
    <section class="answer-card">
      <div class="answer-number">${index + 1}</div>
      <div>
        <h3>${escapeHtml(title)}</h3>
        <p>${escapeHtml(textOrDash(value)).replace(/\n/g, '<br>')}</p>
      </div>
    </section>
  `).join('');

  return `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<title>Reflexionsbogen Rollenspiel</title>
<style>
  @page { size: A4; margin: 16mm; }
  * { box-sizing: border-box; }
  body {
    font-family: Arial, Helvetica, sans-serif;
    color: #172126;
    line-height: 1.5;
    margin: 0;
    background: #f6f8f7;
  }
  .page {
    max-width: 840px;
    margin: 0 auto;
    background: #ffffff;
    border: 1px solid #d9e2dd;
    border-radius: 22px;
    overflow: hidden;
  }
  header {
    padding: 28px 34px;
    background: linear-gradient(135deg, #eef7f1 0%, #edf3fb 100%);
    border-bottom: 1px solid #d9e2dd;
  }
  .eyebrow {
    margin: 0 0 6px;
    font-size: 11px;
    letter-spacing: .12em;
    text-transform: uppercase;
    color: #5c6d73;
    font-weight: 700;
  }
  h1 {
    margin: 0;
    font-size: 30px;
    letter-spacing: -0.03em;
  }
  .date {
    margin: 8px 0 0;
    color: #5d6a70;
    font-size: 13px;
  }
  main { padding: 26px 34px 34px; }
  h2 {
    margin: 0 0 12px;
    font-size: 18px;
    letter-spacing: -0.02em;
  }
  .section { margin-top: 24px; }
  table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    overflow: hidden;
    border: 1px solid #dce5df;
    border-radius: 14px;
  }
  th, td {
    text-align: left;
    padding: 12px 14px;
    border-bottom: 1px solid #e5ece8;
    vertical-align: top;
  }
  th {
    background: #f4f7f6;
    color: #506168;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: .06em;
  }
  tr:last-child td { border-bottom: 0; }
  .role-pill {
    display: inline-block;
    padding: 5px 10px;
    border-radius: 999px;
    font-weight: 700;
    font-size: 12px;
  }
  .student { background: #e8f5ec; color: #1f6b3a; }
  .teacher { background: #fdeaea; color: #9d2c2c; }
  .observer { background: #eaf1fb; color: #285a92; }
  .answer-card {
    display: grid;
    grid-template-columns: 34px 1fr;
    gap: 12px;
    padding: 15px 16px;
    border: 1px solid #dce5df;
    border-radius: 16px;
    margin: 12px 0;
    break-inside: avoid;
    background: #ffffff;
  }
  .answer-number {
    width: 28px;
    height: 28px;
    border-radius: 10px;
    background: #eaf1fb;
    color: #285a92;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 800;
    font-size: 13px;
  }
  h3 {
    margin: 0 0 6px;
    font-size: 14px;
  }
  p { margin: 0; white-space: normal; }
  .empty { color: #728086; }
  @media print {
    body { background: #ffffff; }
    .page { border: 0; border-radius: 0; }
  }
</style>
</head>
<body>
  <div class="page">
    <header>
      <p class="eyebrow">Rollenspiel</p>
      <h1>Reflexionsbogen</h1>
      <p class="date">Exportiert am ${date}</p>
    </header>
    <main>
      <section class="section">
        <h2>Rollenverteilung</h2>
        <table>
          <thead><tr><th>Rolle</th><th>Name</th></tr></thead>
          <tbody>${assignmentRows}</tbody>
        </table>
      </section>
      <section class="section">
        <h2>Reflexion</h2>
        ${reflection}
      </section>
    </main>
  </div>
</body>
</html>`;
}

function exportPdf() {
  saveAllVisibleInputs();
  const popup = window.open('', '_blank');
  if (!popup) {
    alert('Der PDF-Export wurde vom Browser blockiert. Bitte Pop-ups für diese Seite erlauben.');
    return;
  }
  popup.document.open();
  popup.document.write(buildExportHtml());
  popup.document.close();
  popup.focus();
  setTimeout(() => popup.print(), 350);
}

function crc32Bytes(bytes) {
  const table = crc32Bytes.table || (crc32Bytes.table = Array.from({ length: 256 }, (_, n) => {
    let c = n;
    for (let k = 0; k < 8; k++) c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
    return c >>> 0;
  }));
  let crc = 0 ^ -1;
  for (let i = 0; i < bytes.length; i++) crc = (crc >>> 8) ^ table[(crc ^ bytes[i]) & 0xFF];
  return (crc ^ -1) >>> 0;
}

function toBytes(str) {
  return new TextEncoder().encode(str);
}

function zipStored(files) {
  const chunks = [];
  const central = [];
  let offset = 0;
  const u16 = n => [n & 255, (n >>> 8) & 255];
  const u32 = n => [n & 255, (n >>> 8) & 255, (n >>> 16) & 255, (n >>> 24) & 255];

  files.forEach(file => {
    const nameBytes = toBytes(file.name);
    const data = toBytes(file.content);
    const crc = crc32Bytes(data);
    const local = new Uint8Array([
      ...u32(0x04034b50), ...u16(20), ...u16(0), ...u16(0), ...u16(0), ...u16(0),
      ...u32(crc), ...u32(data.length), ...u32(data.length), ...u16(nameBytes.length), ...u16(0)
    ]);
    chunks.push(local, nameBytes, data);
    central.push({ nameBytes, crc, size: data.length, offset });
    offset += local.length + nameBytes.length + data.length;
  });

  const centralStart = offset;
  central.forEach(file => {
    const entry = new Uint8Array([
      ...u32(0x02014b50), ...u16(20), ...u16(20), ...u16(0), ...u16(0), ...u16(0), ...u16(0),
      ...u32(file.crc), ...u32(file.size), ...u32(file.size), ...u16(file.nameBytes.length), ...u16(0), ...u16(0),
      ...u16(0), ...u16(0), ...u32(0), ...u32(file.offset)
    ]);
    chunks.push(entry, file.nameBytes);
    offset += entry.length + file.nameBytes.length;
  });
  const centralSize = offset - centralStart;
  chunks.push(new Uint8Array([
    ...u32(0x06054b50), ...u16(0), ...u16(0), ...u16(central.length), ...u16(central.length),
    ...u32(centralSize), ...u32(centralStart), ...u16(0)
  ]));
  return new Blob(chunks, { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
}

function escapeXml(value) {
  return String(value).replace(/[<>&"']/g, char => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' }[char]));
}

function xmlText(value) {
  return escapeXml(textOrDash(value));
}

function wParagraph(text, style = 'Normal') {
  const lines = String(textOrDash(text)).split(/\n/);
  const runs = lines.map((line, index) => `${index ? '<w:br/>' : ''}<w:t xml:space="preserve">${escapeXml(line)}</w:t>`).join('');
  return `<w:p><w:pPr><w:pStyle w:val="${style}"/></w:pPr><w:r>${runs}</w:r></w:p>`;
}

function wTable(rows) {
  const tableRows = rows.map(row => `<w:tr>${row.map(cell => `<w:tc><w:tcPr><w:tcW w:w="4500" w:type="dxa"/></w:tcPr>${wParagraph(cell)}</w:tc>`).join('')}</w:tr>`).join('');
  return `<w:tbl><w:tblPr><w:tblStyle w:val="TableGrid"/><w:tblW w:w="0" w:type="auto"/><w:tblBorders><w:top w:val="single" w:sz="6" w:space="0" w:color="D7E1DC"/><w:left w:val="single" w:sz="6" w:space="0" w:color="D7E1DC"/><w:bottom w:val="single" w:sz="6" w:space="0" w:color="D7E1DC"/><w:right w:val="single" w:sz="6" w:space="0" w:color="D7E1DC"/><w:insideH w:val="single" w:sz="6" w:space="0" w:color="D7E1DC"/><w:insideV w:val="single" w:sz="6" w:space="0" w:color="D7E1DC"/></w:tblBorders></w:tblPr>${tableRows}</w:tbl>`;
}

function wordXml() {
  const data = getExportData();
  const date = new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const assignmentRows = data.assignments.length
    ? [['Rolle', 'Name'], ...data.assignments.map(item => [item.role, item.name])]
    : [['Rolle', 'Name'], ['—', 'Noch keine Rollenverteilung gespeichert.']];

  const reflectionBlocks = Object.entries(data.reflection).map(([title, value], index) =>
    `${wParagraph(`${index + 1}. ${title}`, 'Heading2')}${wParagraph(value || '—')}`
  ).join('');

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    ${wParagraph('Reflexionsbogen', 'Title')}
    ${wParagraph(`Rollenspiel · Exportiert am ${date}`, 'Subtitle')}
    ${wParagraph('Rollenverteilung', 'Heading1')}
    ${wTable(assignmentRows)}
    ${wParagraph('Reflexion', 'Heading1')}
    ${reflectionBlocks}
    <w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1200" w:right="1200" w:bottom="1200" w:left="1200"/></w:sectPr>
  </w:body>
</w:document>`;
}

function stylesXml() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:rPr><w:rFonts w:ascii="Aptos" w:hAnsi="Aptos"/><w:sz w:val="22"/></w:rPr><w:pPr><w:spacing w:after="160" w:line="276" w:lineRule="auto"/></w:pPr></w:style>
  <w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:basedOn w:val="Normal"/><w:rPr><w:b/><w:sz w:val="44"/><w:color w:val="172126"/></w:rPr><w:pPr><w:spacing w:after="100"/></w:pPr></w:style>
  <w:style w:type="paragraph" w:styleId="Subtitle"><w:name w:val="Subtitle"/><w:basedOn w:val="Normal"/><w:rPr><w:sz w:val="20"/><w:color w:val="617079"/></w:rPr><w:pPr><w:spacing w:after="360"/></w:pPr></w:style>
  <w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:rPr><w:b/><w:sz w:val="30"/><w:color w:val="172126"/></w:rPr><w:pPr><w:spacing w:before="260" w:after="120"/></w:pPr></w:style>
  <w:style w:type="paragraph" w:styleId="Heading2"><w:name w:val="heading 2"/><w:basedOn w:val="Normal"/><w:rPr><w:b/><w:sz w:val="24"/><w:color w:val="285A92"/></w:rPr><w:pPr><w:spacing w:before="220" w:after="80"/></w:pPr></w:style>
</w:styles>`;
}

function exportDocx() {
  saveAllVisibleInputs();
  const blob = zipStored([
    { name: '[Content_Types].xml', content: '<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/></Types>' },
    { name: '_rels/.rels', content: '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>' },
    { name: 'word/_rels/document.xml.rels', content: '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rIdStyles" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>' },
    { name: 'word/document.xml', content: wordXml() },
    { name: 'word/styles.xml', content: stylesXml() }
  ]);
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'rollenspiel-reflexionsbogen.docx';
  document.body.appendChild(link);
  link.click();
  const href = link.href;
  link.remove();
  setTimeout(() => URL.revokeObjectURL(href), 1000);
}

function setupExports() {
  document.querySelector('[data-export-pdf]')?.addEventListener('click', exportPdf);
  document.querySelector('[data-export-docx]')?.addEventListener('click', exportDocx);
}

document.addEventListener('DOMContentLoaded', () => {
  setupTopbarStorageControls();
  setupHome();
  setupAutosaveFields();
  setupReset();
  setupExports();
});
