
const STORAGE_PREFIX='rollenkarten-v12-';
const LEGACY=['rollenkarten-v11-','rollenkarten-v10-','rollenkarten-v9-','rollenkarten-v8-','rollenkarten-v7-','rollenkarten-v6-','rollenkarten-v5-','rollenkarten-v4-','rollenkarten-v3-','rollenkarten-v2-','rollenkarten-'];
let names=[],assignments=[],isResetting=false;
const $=(s,r=document)=>r.querySelector(s);const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
function key(k){return STORAGE_PREFIX+k}function save(k,v){try{localStorage.setItem(key(k),typeof v==='string'?v:JSON.stringify(v))}catch(e){} status('Gespeichert')}
function load(k,f=''){try{let v=localStorage.getItem(key(k)); if(v!==null)return v; for(const p of LEGACY){v=localStorage.getItem(p+k); if(v!==null)return v}}catch(e){} return f}
function json(k,f){try{return JSON.parse(load(k,JSON.stringify(f)))||f}catch(e){return f}}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))}
function status(t){const el=$('[data-save-status]'); if(!el)return; el.textContent=t; el.classList.add('visible'); clearTimeout(status.t); status.t=setTimeout(()=>el.classList.remove('visible'),1600)}
function shuffle(a){a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function setupDistribution(){const form=$('#nameForm'); if(!form)return; names=json('names',[]); assignments=json('assignments',[]); const renderNames=()=>{const ul=$('#nameList'); ul.innerHTML=names.length?'':'<li class="muted-row">Noch keine Namen eingetragen.</li>'; names.forEach((n,i)=>{const li=document.createElement('li');li.innerHTML=`<span>${esc(n)}</span><button type="button">×</button>`;li.querySelector('button').onclick=()=>{names.splice(i,1);assignments=[];save('names',names);save('assignments',assignments);renderNames();renderAssign()};ul.appendChild(li)})}; const renderAssign=()=>{const res=$('#results'), next=$('#nextToCards'); if(!assignments.length){res.innerHTML='<p class="empty-state">Noch keine Verteilung. Trage Namen ein und starte die Zufallsauswahl.</p>';next?.classList.add('hidden');return} next?.classList.remove('hidden');res.innerHTML=assignments.map(x=>`<article class="assignment ${x.className}"><span>${esc(x.role)}</span><strong>${esc(x.name)}</strong></article>`).join('')}; form.onsubmit=e=>{e.preventDefault();const inp=$('#nameInput');const v=inp.value.trim();if(v&&!names.some(n=>n.toLowerCase()===v.toLowerCase())){names.push(v);assignments=[];save('names',names);save('assignments',assignments);renderNames();renderAssign()}inp.value='';inp.focus()}; $('#assignButton')?.addEventListener('click',()=>{if(names.length<2){$('#results').innerHTML='<p class="empty-state">Bitte mindestens zwei Namen eintragen.</p>';return}assignments=shuffle(names).map((name,i)=>i===0?{name,role:'Lehrkraft',className:'teacher'}:i===1?{name,role:'Schüler/in',className:'student'}:{name,role:'Beobachter/in',className:'observer'});save('assignments',assignments);renderAssign()}); $('#clearButton')?.addEventListener('click',()=>{names=[];assignments=[];save('names',names);save('assignments',assignments);renderNames();renderAssign()}); renderNames();renderAssign()}
function setupFields(){$$('[data-save-key]').forEach(el=>{el.value=load(el.dataset.saveKey,''); el.addEventListener('input',()=>save(el.dataset.saveKey,el.value)); el.addEventListener('change',()=>save(el.dataset.saveKey,el.value))}); $$('[data-preview-key]').forEach(el=>{const v=load(el.dataset.previewKey,'').trim(); el.textContent=v||'Noch keine Eingabe gespeichert.'})}
function listGet(k){return json('list-'+k,[])}function listSave(k,items){save('list-'+k,items)}
function setupListEditors(){$$('.list-editor').forEach(ed=>{const k=ed.dataset.listKey,input=$('[data-list-input]',ed),outEl=$('[data-list-output]',ed);let items=listGet(k); const render=()=>{outEl.innerHTML=items.length?'':'<li class="muted-row">Noch keine Einträge.</li>'; items.forEach((txt,i)=>{const li=document.createElement('li');li.innerHTML=`<span>${esc(txt)}</span><button type="button" aria-label="Eintrag löschen">×</button>`;li.querySelector('button').onclick=()=>{items.splice(i,1);listSave(k,items);render()};outEl.appendChild(li)})}; const add=()=>{const v=input.value.trim(); if(!v)return; items.push(v); input.value=''; listSave(k,items); render(); input.focus()}; $('[data-list-add]',ed)?.addEventListener('click',add); input?.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();add()}}); render()})}
function setupListPreviews(){$$('[data-list-preview]').forEach(ul=>{const arr=listGet(ul.dataset.listPreview); ul.innerHTML=arr.length?arr.map(x=>`<li>${esc(x)}</li>`).join(''):'<li class="muted-row">Noch keine Einträge gespeichert.</li>'})}
function clearAll(){isResetting=true;try{Object.keys(localStorage).filter(k=>[STORAGE_PREFIX,...LEGACY].some(p=>k.startsWith(p))).forEach(k=>localStorage.removeItem(k))}catch(e){} location.replace('index.html')}
function setupControls(){$$('[data-save-now]').forEach(b=>b.onclick=()=>{saveVisible();status('Alles gespeichert')}); $$('[data-reset]').forEach(b=>b.onclick=()=>{if(confirm('Alle Eingaben, Reflexionen und Zuordnungen löschen?')) clearAll()})}
function saveVisible(){$$('[data-save-key]').forEach(el=>save(el.dataset.saveKey,el.value||'')); try{save('names',names);save('assignments',assignments)}catch(e){}}
function reflectionEntries(){const keys=['reflexion-verlauf','reflexion-foerdernd','reflexion-belastend','reflexion-wirkung','reflexion-verbesserung']; let arr=[]; keys.forEach(k=>listGet(k).forEach((text,i)=>arr.push({id:k+'-'+i,text,source:k}))); return arr}
function setupMapping(){const pool=$('#statementPool'); if(!pool)return; const cats=['sicherheit','naehe-distanz','kommunikation','kontext','kooperation']; let map=json('theorie-map',{}); cats.forEach(c=>{if(!map[c])map[c]=[]}); const assigned=new Set(Object.values(map).flat()); function itemHtml(item){const div=document.createElement('div');div.className='drag-item';div.draggable=true;div.dataset.id=item.id;div.textContent=item.text;div.addEventListener('dragstart',e=>e.dataTransfer.setData('text/plain',item.id));return div} const all=reflectionEntries(); function render(){pool.innerHTML=''; all.filter(i=>!assigned.has(i.id)).forEach(i=>pool.appendChild(itemHtml(i))); if(!pool.children.length)pool.innerHTML='<p class="muted">Keine freien Reflexionssätze. Ergänze im Reflexionsbogen einzelne Sätze oder entferne Zuordnungen.</p>'; $$('.drop-card').forEach(card=>{const zone=$('.drop-zone',card),c=card.dataset.drop;zone.innerHTML='';(map[c]||[]).forEach(id=>{const it=all.find(x=>x.id===id);if(!it)return;const div=itemHtml(it);div.title='Doppelklick zum Entfernen';div.ondblclick=()=>{map[c]=map[c].filter(x=>x!==id);assigned.delete(id);save('theorie-map',map);render()};zone.appendChild(div)}); if(!zone.children.length)zone.innerHTML='<p class="muted">Hier ablegen.</p>'})} $$('.drop-card').forEach(card=>{card.addEventListener('dragover',e=>{e.preventDefault();card.classList.add('drag-over')});card.addEventListener('dragleave',()=>card.classList.remove('drag-over'));card.addEventListener('drop',e=>{e.preventDefault();card.classList.remove('drag-over');const id=e.dataTransfer.getData('text/plain');if(!id)return;cats.forEach(c=>map[c]=map[c].filter(x=>x!==id));map[card.dataset.drop].push(id);assigned.add(id);save('theorie-map',map);render()})}); const resultBtn=$('[data-show-mapping-result]')||$('[data-save-mapping]'); resultBtn?.addEventListener('click',()=>{save('theorie-map',map); location.href='theorie-ergebnis.html'}); render()}

function setupExport(){const pdf=$('[data-export-pdf]'),doc=$('[data-export-doc]'); if(!pdf&&!doc)return; const cats=[['Verlauf','reflexion-verlauf'],['Beziehungsfördernd','reflexion-foerdernd'],['Konfliktverschärfend','reflexion-belastend'],['Wirkung von Sprache und Körper','reflexion-wirkung'],['Verbesserung','reflexion-verbesserung']]; const build=()=>{const ass=json('assignments',[]); return `<html><head><meta charset="utf-8"><title>Reflexionsbogen</title><style>body{font-family:Arial,sans-serif;padding:30px;line-height:1.5;color:#20272b}h1{font-size:30px}h2{margin-top:24px}table{border-collapse:collapse;width:100%;margin:12px 0}td,th{border:1px solid #ddd;padding:8px;text-align:left}li{margin:6px 0}</style></head><body><h1>Reflexionsbogen</h1><h2>Rollenverteilung</h2><table><tr><th>Rolle</th><th>Name</th></tr>${ass.map(a=>`<tr><td>${esc(a.role)}</td><td>${esc(a.name)}</td></tr>`).join('')}</table>${cats.map(([t,k])=>`<h2>${t}</h2><ul>${listGet(k).map(x=>`<li>${esc(x)}</li>`).join('')||'<li>—</li>'}</ul>`).join('')}</body></html>`}; pdf.onclick=()=>{const w=open('','_blank');w.document.write(build());w.document.close();setTimeout(()=>w.print(),250)}; doc.onclick=()=>{const blob=buildDocxBlob();const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='rollenspiel-reflexionsbogen.docx';a.click();URL.revokeObjectURL(a.href)}}
function xmlEsc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]))}
function docxP(text,style=''){return `<w:p>${style?`<w:pPr><w:pStyle w:val="${style}"/></w:pPr>`:''}<w:r><w:t xml:space="preserve">${xmlEsc(text)}</w:t></w:r></w:p>`}
function buildDocxBlob(){const ass=json('assignments',[]);const cats=[['Verlauf','reflexion-verlauf'],['Beziehungsfördernd','reflexion-foerdernd'],['Konfliktverschärfend','reflexion-belastend'],['Wirkung von Sprache und Körper','reflexion-wirkung'],['Verbesserung','reflexion-verbesserung']];let body=docxP('Reflexionsbogen','Title')+docxP('Rollenverteilung','Heading1'); if(ass.length){ass.forEach(a=>body+=docxP(`${a.role}: ${a.name}`))}else{body+=docxP('Noch keine Rollenverteilung gespeichert.')} cats.forEach(([t,k])=>{body+=docxP(t,'Heading1');const items=listGet(k); if(items.length)items.forEach(x=>body+=docxP('• '+x)); else body+=docxP('—')});const documentXml=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${body}<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440"/></w:sectPr></w:body></w:document>`;const styles=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:rPr><w:b/><w:sz w:val="44"/></w:rPr></w:style><w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:rPr><w:b/><w:sz w:val="30"/></w:rPr><w:pPr><w:spacing w:before="360" w:after="120"/></w:pPr></w:style></w:styles>`;return zipBlob({'[Content_Types].xml':'<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/></Types>','_rels/.rels':'<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>','word/_rels/document.xml.rels':'<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>','word/document.xml':documentXml,'word/styles.xml':styles},'application/vnd.openxmlformats-officedocument.wordprocessingml.document')}
function crc32(bytes){let c=~0;for(let b of bytes){c^=b;for(let k=0;k<8;k++)c=(c>>>1)^(0xEDB88320&-(c&1))}return ~c>>>0}
function u16(n){return [n&255,(n>>>8)&255]}function u32(n){return [n&255,(n>>>8)&255,(n>>>16)&255,(n>>>24)&255]}
function zipBlob(files,type){const enc=new TextEncoder();let chunks=[],central=[],offset=0;for(const [name,text] of Object.entries(files)){const nameBytes=enc.encode(name),data=enc.encode(text),crc=crc32(data);const local=[...u32(0x04034b50),...u16(20),...u16(0),...u16(0),...u16(0),...u16(0),...u32(crc),...u32(data.length),...u32(data.length),...u16(nameBytes.length),...u16(0),...nameBytes,...data];chunks.push(new Uint8Array(local));central.push(new Uint8Array([...u32(0x02014b50),...u16(20),...u16(20),...u16(0),...u16(0),...u16(0),...u16(0),...u32(crc),...u32(data.length),...u32(data.length),...u16(nameBytes.length),...u16(0),...u16(0),...u16(0),...u16(0),...u32(0),...u32(offset),...nameBytes]));offset+=local.length}const centralSize=central.reduce((s,a)=>s+a.length,0),centralOffset=offset;const end=new Uint8Array([...u32(0x06054b50),...u16(0),...u16(0),...u16(central.length),...u16(central.length),...u32(centralSize),...u32(centralOffset),...u16(0)]);return new Blob([...chunks,...central,end],{type})}


function setupQrCodes(){
  const modal=$('[data-qr-modal]');
  if(!modal)return;
  const img=$('[data-qr-image]',modal), heading=$('[data-qr-heading]',modal), link=$('[data-qr-link]',modal);
  const show=(target,title)=>{
    const url=new URL(target,window.location.href).href;
    heading.textContent=title||'QR-Code';
    img.src='https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=12&data='+encodeURIComponent(url);
    link.textContent=url;
    modal.classList.remove('hidden');
    modal.setAttribute('aria-hidden','false');
  };
  const close=()=>{modal.classList.add('hidden');modal.setAttribute('aria-hidden','true');img.removeAttribute('src')};
  $$('[data-qr-target]').forEach(btn=>btn.addEventListener('click',()=>show(btn.dataset.qrTarget,btn.dataset.qrTitle)));
  $$('[data-qr-close]').forEach(btn=>btn.addEventListener('click',close));
  modal.addEventListener('click',e=>{if(e.target===modal)close()});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!modal.classList.contains('hidden'))close()});
}


function setupWorkBanner(){
  const main=document.querySelector('main');
  if(!main || !document.body.dataset.workLabel || document.querySelector('.work-banner')) return;
  const kind=document.body.dataset.work || '';
  const label=document.body.dataset.workLabel || '';
  const title=kind==='group'?'Gruppenarbeit':kind==='individual'?'Einzelarbeit':'Hinweis';
  const banner=document.createElement('section');
  banner.className='work-banner '+kind;
  banner.innerHTML=`<span class="work-icon">!</span><div class="work-text"><strong>${esc(title)}</strong><span>${esc(label.replace(/^Gruppenarbeit:\s*|^Einzelarbeit:\s*/,''))}</span></div>`;
  main.prepend(banner);
}
function mappingCategories(){return [
  ['sicherheit','Sicherheit und Vertrauen'],
  ['naehe-distanz','Nähe, Distanz und professionelle Rolle'],
  ['kommunikation','Kommunikation und Resonanz'],
  ['kontext','Verhalten im Kontext verstehen'],
  ['kooperation','Kooperation und Handlungsfähigkeit']
]}
function setupMappingResult(){
  const left=$('#resultStatements'), right=$('#resultMapping');
  if(!left || !right) return;
  const entries=reflectionEntries();
  const map=json('theorie-map',{});
  const byId=Object.fromEntries(entries.map(e=>[e.id,e]));
  left.innerHTML=entries.length?entries.map(e=>`<li>${esc(e.text)}</li>`).join(''):'<li class="muted-row">Noch keine Reflexionssätze eingetragen.</li>';
  right.innerHTML=mappingCategories().map(([id,title])=>{
    const items=(map[id]||[]).map(x=>byId[x]).filter(Boolean);
    return `<section class="result-category"><h3>${esc(title)}</h3><ul>${items.length?items.map(i=>`<li>${esc(i.text)}</li>`).join(''):'<li class="muted-row">Noch keine Sätze zugeordnet.</li>'}</ul></section>`;
  }).join('');
}

window.addEventListener('beforeunload',()=>{if(!isResetting)saveVisible()});
document.addEventListener('DOMContentLoaded',()=>{setupWorkBanner();setupControls();setupDistribution();setupFields();setupListEditors();setupListPreviews();setupMapping();setupMappingResult();setupExport();setupQrCodes()});
