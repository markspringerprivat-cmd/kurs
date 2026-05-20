
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
function reflectionSourceLabels(){return {
  'reflexion-verlauf':'Was ist im Gespräch passiert?',
  'reflexion-foerdernd':'Welche Aussagen oder Verhaltensweisen haben die Beziehung gefördert?',
  'reflexion-belastend':'Welche Aussagen oder Verhaltensweisen haben den Konflikt verschärft?',
  'reflexion-wirkung':'Wie haben Tonfall, Wortwahl und Körpersprache gewirkt?',
  'reflexion-verbesserung':'Was könnte beim nächsten Gespräch anders gemacht werden?'
}}
function reflectionEntries(){const labels=reflectionSourceLabels(); const keys=Object.keys(labels); let arr=[]; keys.forEach(k=>listGet(k).forEach((text,i)=>arr.push({id:k+'-'+i,text,source:k,sourceLabel:labels[k]}))); return arr}
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
  const grouped={};
  entries.forEach(e=>{const label=e.sourceLabel||'Reflexionsbogen'; (grouped[label] ||= []).push(e)});
  const labels=Object.values(reflectionSourceLabels());
  const groupHtml=labels.filter(label=>grouped[label]?.length).map(label=>`<li class="result-question-group"><span class="result-source result-question">${esc(label)}</span><ul>${grouped[label].map(e=>`<li><span class="result-statement-text">${esc(e.text)}</span></li>`).join('')}</ul></li>`).join('');
  left.innerHTML=groupHtml || '<li class="muted-row">Noch keine Reflexionssätze eingetragen.</li>';
  right.innerHTML=mappingCategories().map(([id,title])=>{
    const items=(map[id]||[]).map(x=>byId[x]).filter(Boolean);
    return `<section class="result-category"><h3>${esc(title)}</h3><ul>${items.length?items.map(i=>`<li>${esc(i.text)}</li>`).join(''):'<li class="muted-row">Noch keine Sätze zugeordnet.</li>'}</ul></section>`;
  }).join('');
}

function fmtTime(ms){ms=Math.max(0,Math.round(ms/1000));const m=Math.floor(ms/60),s=ms%60;return `${m}:${String(s).padStart(2,'0')}`}
function setupStepTimer(){
  const keyName=document.body.dataset.stepKey;
  if(keyName==='rollenverteilung' && !load('global-timer-start','')) save('global-timer-start',String(Date.now()));
  const start=Number(load('global-timer-start',''));
  if(!start) return;
  const box=document.createElement('div');
  box.className='step-timer elapsed-timer';
  box.innerHTML='<span class="timer-dot"></span><span class="timer-label">Arbeitszeit</span><strong data-timer-left>0:00</strong>';
  document.body.appendChild(box);
  const out=$('[data-timer-left]',box);
  const tick=()=>{out.textContent=fmtTime(Date.now()-start)};
  tick(); setInterval(tick,1000);
}
function setupTotalTime(){
  const el=document.querySelector('[data-total-time]'); if(!el) return;
  const start=Number(load('global-timer-start',''));
  const render=()=>{el.textContent=start?`Bisher benötigte Arbeitszeit: ca. ${fmtTime(Date.now()-start)}`:'Bisher wurde noch keine Arbeitszeit erfasst.'};
  render(); if(start) setInterval(render,1000);
}

function roleFromStepKey(){
  const keyName=document.body.dataset.stepKey||'';
  const m=keyName.match(/^(schueler|lehrkraft|beobachter)-/);
  if(m) return m[1];
  const file=(location.pathname.split('/').pop()||'').replace('.html','');
  if(file.startsWith('schueler')) return 'schueler';
  if(file.startsWith('lehrkraft')) return 'lehrkraft';
  if(file.startsWith('beobachter')) return 'beobachter';
  return '';
}
function situationData(){
  const situation='Im Unterricht der Klasse kommt es seit einigen Tagen wiederholt zu Spannungen zwischen einem Schüler und einer Lehrkraft. Während einer Arbeitsphase nutzt der Schüler wiederholt sein Handy. Die Lehrkraft hat ihn bereits mehrfach darauf hingewiesen, das Handy wegzulegen und sich wieder auf die Aufgabe zu konzentrieren. Der Schüler reagiert zunehmend genervt, fühlt sich vor der Gruppe kontrolliert und hat den Eindruck, häufiger kritisiert zu werden als andere. Die Lehrkraft erlebt die wiederholte Handynutzung als Störung des Unterrichts, fühlt sich in ihrer Rolle nicht ernst genommen und möchte die Situation klären, ohne den Kontakt zum Schüler zu verlieren. Im Gespräch soll sichtbar werden, welche Gefühle, Erwartungen, Grenzen und Belastungen auf beiden Seiten eine Rolle spielen und wie ein respektvoller Umgang wieder möglich werden kann.';
  return {
    schueler:{
      title:'Rollenkarte Schüler/in',
      intro:'Du klärst deine Sicht, deine Gefühle und deine Erwartungen, ohne aus dem Gespräch auszusteigen.',
      situation,
      background:'Du bist im Unterricht häufig angespannt, wenn du das Gefühl hast, beobachtet oder direkt kritisiert zu werden. Außerhalb der Schule ist gerade einiges los: Es gibt Streit in der Familie, und auch im Freundeskreis möchtest du erreichbar bleiben. Das Handy bedeutet für dich nicht nur Ablenkung, sondern auch Kontakt, Sicherheit und kurze Entlastung. Gleichzeitig möchtest du nicht als „Problemfall“ gesehen werden, sondern als Person, deren Sicht ernst genommen wird.',
      situationList:['Du fühlst dich unfair behandelt.','Zuhause gibt es momentan Stress.','Du bist schnell gereizt.','Du hast das Gefühl, dass die Lehrkraft dich ständig kritisiert.'],
      goal:['Erkläre deine Sichtweise.','Sage, warum du genervt reagierst.','Reagiere ehrlich auf die Aussagen der Lehrkraft.','Überlege, wann du dich verstanden fühlst.'],
      focus:['deine Reaktionen','deine Gefühle','deinen Umgangston','darauf, wie die Lehrkraft auf dich wirkt']
    },
    lehrkraft:{
      title:'Rollenkarte Lehrkraft',
      intro:'Du klärst die Situation professionell, setzt Grenzen und hältst gleichzeitig den Kontakt zum Schüler.',
      situation,
      background:'Du erlebst die wiederholte Handynutzung als Belastung, weil sie die Arbeitsruhe stört und andere Schülerinnen und Schüler ebenfalls ablenken kann. Gleichzeitig weißt du, dass hinter gereiztem Verhalten auch Unsicherheit, Stress oder der Wunsch nach Kontrolle stecken können. Du möchtest nicht nur eine Regel durchsetzen, sondern ein Gespräch führen, in dem klare Erwartungen und ein respektvoller Kontakt miteinander verbunden bleiben.',
      situationList:['Du bist heute gestresst und möchtest Ruhe im Unterricht.','Der Schüler reagiert auf Hinweise zunehmend genervt.','Du fühlst dich nicht ernst genommen.','Eigentlich möchtest du die Situation ruhig klären.'],
      goal:['Sprich den Konflikt an.','Versuche ruhig zu bleiben.','Höre dem Schüler zu.','Suche gemeinsam nach einer Lösung.'],
      focus:['deinen Tonfall','deine Wortwahl','deine Körpersprache','darauf, ob sich der Schüler verstanden fühlt']
    },
    beobachter:{
      title:'Rollenkarte Beobachter/in',
      intro:'Du beobachtest, wie Kommunikation, Beziehungsgestaltung und Konfliktverlauf im Gespräch wirken.',
      situation,
      background:'Du nimmst nicht aktiv am Konfliktgespräch teil, sondern beobachtest möglichst genau. Deine Aufgabe ist es, konkrete Aussagen, Reaktionen und Wendepunkte festzuhalten. Achte darauf, nicht vorschnell zu bewerten. Hilfreich ist, zwischen beobachtbarem Verhalten und eigener Deutung zu unterscheiden: Was wurde gesagt? Wie wurde es gesagt? Wie hat die andere Person darauf reagiert?',
      situationList:['Du beobachtest das Gespräch aus einer ruhigen Außenperspektive.','Du achtest auf konkrete Aussagen und Reaktionen.','Du unterscheidest Beobachtung und Bewertung.','Du bereitest Hinweise für die gemeinsame Reflexion vor.'],
      goal:['Achte auf respektvolle Sprache.','Beobachte, ob beide Seiten zuhören.','Notiere, wann Druck entsteht oder abgebaut wird.','Halte fest, welche Aussagen Beziehung fördern oder belasten.'],
      focus:['Kommunikation','Beziehungsgestaltung','Konfliktverlauf','konkrete Beispiele für die Reflexion']
    }
  };
}
function setupSituationPopup(){
  const keyName=document.body.dataset.stepKey||'';
  if(!/^(schueler|lehrkraft|beobachter)-[234]$/.test(keyName)) return;
  const hero=document.querySelector('.hero-panel'); if(!hero || hero.querySelector('[data-situation-open]')) return;
  const btn=document.createElement('button');
  btn.type='button';
  btn.className='button ghost small hero-reminder-button';
  btn.dataset.situationOpen='1';
  btn.textContent='Zur Erinnerung: Ausgangslage';
  hero.prepend(btn);
  const role=roleFromStepKey(); const data=situationData()[role];
  const ul=arr=>'<ul>'+arr.map(x=>`<li>${esc(x)}</li>`).join('')+'</ul>';
  const open=()=>{
    let modal=document.querySelector('[data-situation-modal]');
    if(!modal){modal=document.createElement('div'); modal.className='situation-modal hidden'; modal.dataset.situationModal='1'; document.body.appendChild(modal)}
    modal.innerHTML=`<section class="situation-dialog" role="dialog" aria-modal="true" aria-label="Zur Erinnerung: Ausgangslage"><p class="eyebrow">Schritt 1</p><h2>${esc(data.title)}</h2><p>${esc(data.intro)}</p><h3>Einführung in die Situation</h3><p>${esc(data.situation)}</p><h3>Hintergrund</h3><p>${esc(data.background)}</p><div class="role-info-grid"><article><h3>Situation</h3>${ul(data.situationList)}</article><article><h3>Ziel</h3>${ul(data.goal)}</article><article><h3>Achte auf</h3>${ul(data.focus)}</article></div><div class="situation-dialog-actions"><button type="button" class="button primary" data-situation-close>OK</button></div></section>`;
    modal.classList.remove('hidden');
    const close=()=>modal.classList.add('hidden');
    modal.querySelector('[data-situation-close]').onclick=close;
    modal.onclick=e=>{if(e.target===modal)close()};
  };
  btn.addEventListener('click',open);
}

window.addEventListener('beforeunload',()=>{if(!isResetting)saveVisible()});
document.addEventListener('DOMContentLoaded',()=>{setupWorkBanner();setupSituationPopup();setupStepTimer();setupControls();setupDistribution();setupFields();setupListEditors();setupListPreviews();setupMapping();setupMappingResult();setupTotalTime();setupExport();setupQrCodes()});
