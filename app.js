/* ===================== PODACI (Firebase Firestore) ===================== */
let POSTCARDS = [];

async function fetchPostcardsFromFirestore(){
  const snap = await db.collection(POSTCARDS_COLLECTION).orderBy('id').get();
  return snap.docs.map(d=>d.data());
}
async function saveOnePostcard(pc){
  await db.collection(POSTCARDS_COLLECTION).doc(pc.id).set(pc);
}
async function deleteOnePostcard(id){
  await db.collection(POSTCARDS_COLLECTION).doc(id).delete();
}

function periods(){
  const set = [...new Set(POSTCARDS.map(p=>p.period).filter(Boolean))];
  return set.sort((a,b)=>{
    const na = parseInt(a)||9999, nb = parseInt(b)||9999;
    return na-nb;
  });
}
function publicList(){ return POSTCARDS.filter(p=>p.public!==false); }
function nextId(){
  const nums = POSTCARDS.map(p=>parseInt((p.id||'BL-0000').split('-')[1])||0);
  const max = nums.length?Math.max(...nums):0;
  return 'BL-'+String(max+1).padStart(4,'0');
}

/* ===================== KARTICE / RENDER ===================== */
function pcCardHtml(pc){
  const c = catInfo(pc.cat);
  return `<div class="pc-card" onclick="openDetail('${pc.id}')">
    <div class="pc-photo">${mediaFor(pc,'before')}<span class="badge">${c.name}</span>${pc.nd?'<span class="badge nd">nekad/danas</span>':''}</div>
    <div class="pc-body"><div class="pc-title">${pc.title}</div><div class="pc-meta"><span>${pc.loc||''}</span><span>${pc.year||''}</span></div><div class="pc-id">${pc.id}</div></div>
  </div>`;
}

function renderHome(){
  const list = publicList();
  document.getElementById('statTotal').textContent = list.length;
  document.getElementById('statCats').textContent = CATS.length;

  const ndList = list.filter(p=>p.nd);
  const heroPc = ndList[0] || list[0];

  if(heroPc){
    document.getElementById('heroBefore').innerHTML = mediaFor(heroPc,'before');
    document.getElementById('heroAfter').innerHTML = mediaFor(heroPc,'after');
    document.getElementById('heroTagBefore').textContent = 'Nekad, '+(heroPc.year||'');
  } else {
    document.getElementById('heroSlider').innerHTML = '<div class="empty-state">Dodajte prvu razglednicu u admin panelu.</div>';
  }

  document.getElementById('categoryGrid').innerHTML = CATS.map(c=>{
    const n = list.filter(p=>p.cat===c.id).length;
    return `<div class="cat-tile" onclick="filterByCategory('${c.id}')">${iconSvg(c.icon)}<span class="name">${c.name} <span class="count">(${n})</span></span></div>`;
  }).join('');
}

/* ===================== GALERIJA ===================== */
function refreshGalleryFilters(){
  const catSel = document.getElementById('fCategory');
  const perSel = document.getElementById('fPeriod');
  const locSel = document.getElementById('fLocation');
  const prevCat = catSel.value, prevPer = perSel.value, prevLoc = locSel.value;
  catSel.innerHTML = '<option value="">Sve kategorije</option>' + CATS.map(c=>`<option value="${c.id}">${c.name}</option>`).join('');
  perSel.innerHTML = '<option value="">Svi periodi</option>' + periods().map(p=>`<option value="${p}">${p}</option>`).join('');
  const locs = [...new Set(publicList().map(p=>p.loc).filter(Boolean))].sort();
  locSel.innerHTML = '<option value="">Sve lokacije</option>' + locs.map(l=>`<option value="${l}">${l}</option>`).join('');
  catSel.value = prevCat; perSel.value = prevPer; locSel.value = prevLoc;
}
function applyFilters(){
  const cat = document.getElementById('fCategory').value;
  const per = document.getElementById('fPeriod').value;
  const loc = document.getElementById('fLocation').value;
  const q = document.getElementById('fSearch').value.trim().toLowerCase();
  const results = publicList().filter(p=>{
    if(cat && p.cat!==cat) return false;
    if(per && p.period!==per) return false;
    if(loc && p.loc!==loc) return false;
    if(q){
      const hay = (p.title+' '+(p.loc||'')+' '+(p.year||'')+' '+(p.tags||[]).join(' ')).toLowerCase();
      if(!hay.includes(q)) return false;
    }
    return true;
  });
  document.getElementById('galleryGrid').innerHTML = results.map(pcCardHtml).join('');
  document.getElementById('galleryCount').textContent = results.length+' od '+publicList().length+' razglednica';
  document.getElementById('galleryEmpty').style.display = results.length===0?'block':'none';
}
function filterByCategory(catId){ showView('gallery'); document.getElementById('fCategory').value = catId; applyFilters(); }
function onGlobalSearch(val){ showView('gallery'); document.getElementById('fSearch').value = val; applyFilters(); }

/* ===================== DETALJI ===================== */
let currentPc = null;
let backRotation = 0;
function openDetail(id){
  const pc = POSTCARDS.find(p=>p.id===id);
  if(!pc) return;
  currentPc = pc;
  backRotation = 0;
  const c = catInfo(pc.cat);
  document.getElementById('crumbCat').textContent = c.name;
  document.getElementById('crumbTitle').textContent = pc.title;
  document.getElementById('detailTitle').textContent = pc.title;
  document.getElementById('detailLoc').textContent = pc.loc || 'Lokacija nepoznata';
  document.getElementById('detailDesc').textContent = pc.opis || '';
  document.getElementById('detailTags').innerHTML = `<span class="pill cat">${c.name}</span>` + (pc.tags||[]).map(t=>`<span class="pill">#${t}</span>`).join('');
  document.getElementById('detailSpec').innerHTML = `
    <dt>ID</dt><dd>${pc.id}</dd>
    <dt>Godina</dt><dd>${pc.year||'—'}</dd>
    <dt>Period</dt><dd>${pc.period||'—'}</dd>
    <dt>Izdavač</dt><dd>${pc.izdavac||'—'}</dd>
    ${pc.postmark?`<dt>Poštanski žig</dt><dd>${pc.postmark}</dd>`:''}
    <dt>Status prava</dt><dd>${pc.prava||'nepoznato'}</dd>
    ${pc.gps && pc.gps.lat ? `<dt>GPS</dt><dd>${pc.gps.lat}, ${pc.gps.lng}</dd>` : ''}
  `;
  document.getElementById('detailTranscriptWrap').innerHTML = pc.transcript ? `<div class="transcript-box">${pc.transcript}</div>` : '';
  renderDetailMedia('front');
  showView('detail', true);
  const newHash = '#/r/'+id;
  if(location.hash !== newHash) history.pushState(null,'',newHash);
}
function detailUrlFor(id){
  return location.origin + location.pathname + '#/r/' + id;
}
function syncFromHash(){
  const m = location.hash.match(/^#\/r\/(.+)$/);
  if(m && POSTCARDS.find(p=>p.id===m[1])){ openDetail(m[1]); }
}
function renderDetailMedia(mode){
  const pc = currentPc;
  if(!pc) return;
  const box = document.getElementById('detailMediaBox');
  if(mode==='nd'){
    box.innerHTML = `<div class="nd-slider" id="detailSlider" style="aspect-ratio:4/3;">
      <div class="layer before" id="dBefore">${mediaFor(pc,'before')}</div>
      <div class="layer after" id="dAfter">${mediaFor(pc,'after')}</div>
      <span class="nd-tag before">Nekad, ${pc.year||''}</span>
      <span class="nd-tag after">Danas</span>
      <div class="handle"></div>
      <input type="range" min="0" max="100" value="50" oninput="dragSlider(this,'dBefore','dAfter')">
    </div>`;
  } else if(mode==='back'){
    box.innerHTML = `<div class="nd-slider rotatable" style="aspect-ratio:4/3;">
      <div class="rotate-stage" id="backRotateStage" style="transform:translate(-50%,-50%) rotate(${backRotation}deg);">${mediaFor(pc, mode)}</div>
      <button class="rotate-btn" onclick="rotateBack()" title="Rotiraj poleđinu" aria-label="Rotiraj poleđinu">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3.5 12a8.5 8.5 0 1 1 2.9 6.4"/><path d="M3.5 21v-6h6"/></svg>
      </button>
    </div>`;
  } else {
    box.innerHTML = `<div class="nd-slider" style="aspect-ratio:4/3;">${mediaFor(pc, mode)}</div>`;
  }
  const toggles = [['front','Prednja strana'],['back','Poleđina']];
  if(pc.nd) toggles.push(['nd','Nekad / danas']);
  document.getElementById('detailToggles').innerHTML = toggles.map(([m,label])=>
    `<button class="toggle-btn ${m===mode?'active':''}" onclick="renderDetailMedia('${m}')">${label}</button>`).join('');
}
function rotateBack(){
  backRotation = (backRotation + 90) % 360;
  const stage = document.getElementById('backRotateStage');
  if(stage) stage.style.transform = `translate(-50%,-50%) rotate(${backRotation}deg)`;
}
function openMap(){
  const pc = currentPc;
  if(pc && pc.gps && pc.gps.lat && pc.gps.lng){
    window.open('https://www.google.com/maps?q='+encodeURIComponent(pc.gps.lat)+','+encodeURIComponent(pc.gps.lng), '_blank');
  } else {
    alert('GPS koordinate još nisu unesene za ovu razglednicu. Dodajte ih u admin panelu.');
  }
}

/* ===================== VREMENSKA LINIJA ===================== */
let activePeriod = null;
function renderTimeline(){
  const list = publicList();
  const rail = document.getElementById('timelineRailFull');
  rail.innerHTML = periods().map(p=>{
    const n = list.filter(x=>x.period===p).length;
    return `<div class="tl-full-node ${p===activePeriod?'active':''}" onclick="goTimelinePeriod('${p}')"><div class="tl-full-dot"></div><div class="yr">${p}</div><div class="ct">${n} razgl.</div></div>`;
  }).join('') + `<div class="tl-full-node ${activePeriod===null?'active':''}" onclick="goTimelinePeriod(null)"><div class="tl-full-dot"></div><div class="yr">Sve</div><div class="ct">${list.length} razgl.</div></div>`;
  const shown = activePeriod ? list.filter(p=>p.period===activePeriod) : list;
  document.getElementById('timelineGrid').innerHTML = shown.map(pcCardHtml).join('');
}
function goTimelinePeriod(p){ activePeriod = p; showView('timeline'); }

/* ===================== SLIDER ===================== */
function dragSlider(input,beforeId,afterId){
  const val = input.value;
  document.getElementById(afterId).style.clipPath = `inset(0 0 0 ${val}%)`;
  input.parentElement.querySelector('.handle').style.left = val+'%';
}

/* ===================== AUTH ===================== */
function handleLogin(e){
  e.preventDefault();
  const email = document.getElementById('login_email').value.trim();
  const pass = document.getElementById('login_pass').value;
  const err = document.getElementById('loginError');
  const btn = e.target.querySelector('button[type=submit]');
  err.style.display = 'none';
  btn.disabled = true; btn.textContent = 'Prijavljivanje…';
  auth.signInWithEmailAndPassword(email, pass)
    .catch(function(error){
      console.error(error);
      err.textContent = 'Pogrešan email ili lozinka.';
      err.style.display = 'block';
    })
    .finally(function(){
      btn.disabled = false; btn.textContent = 'Prijavi se';
    });
  return false;
}
function handleLogout(){
  auth.signOut();
}
auth.onAuthStateChanged(function(){
  if(document.getElementById('view-admin').classList.contains('active')){
    showView('admin', true);
  }
});

/* ===================== ADMIN PANEL ===================== */
let editingId = null;
let currentImages = {front:null, back:null, today:null};

function resizeImage(file, maxDim, quality){
  maxDim = maxDim || 1100; quality = quality || 0.82;
  return new Promise((resolve,reject)=>{
    if(!file){ resolve(null); return; }
    const reader = new FileReader();
    reader.onload = function(e){
      const img = new Image();
      img.onload = function(){
        let w = img.width, h = img.height;
        if(w>h && w>maxDim){ h = Math.round(h*maxDim/w); w = maxDim; }
        else if(h>=w && h>maxDim){ w = Math.round(w*maxDim/h); h = maxDim; }
        const canvas = document.createElement('canvas');
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d').drawImage(img,0,0,w,h);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/* ===================== SLIKE (ImgBB) ===================== */
const IMGBB_API_KEY = '601149311b1536ee89b01d92e3a22611';
async function uploadToImgbb(dataUrl){
  const base64 = dataUrl.split(',')[1] || dataUrl;
  const form = new FormData();
  form.append('image', base64);
  const res = await fetch('https://api.imgbb.com/1/upload?key='+IMGBB_API_KEY, {method:'POST', body: form});
  const json = await res.json();
  if(json && json.success && json.data && json.data.url) return json.data.url;
  throw new Error((json && json.error && json.error.message) || 'ImgBB otpremanje nije uspjelo');
}

function refreshAdminCategorySelect(){
  document.getElementById('f_cat').innerHTML = CATS.map(c=>`<option value="${c.id}">${c.name}</option>`).join('');
}
function updateUploadPreview(kind){
  const map = {front:'prevFront',back:'prevBack',today:'prevToday'};
  const el = document.getElementById(map[kind]);
  const src = currentImages[kind];
  el.innerHTML = src ? `<img src="${src}" alt="">` : 'nema slike';
}
document.getElementById('f_front_file').addEventListener('change', e=>handleFileSelect(e,'front'));
document.getElementById('f_back_file').addEventListener('change', e=>handleFileSelect(e,'back'));
document.getElementById('f_today_file').addEventListener('change', e=>handleFileSelect(e,'today'));
async function handleFileSelect(e,kind){
  const file = e.target.files[0];
  if(!file) return;
  const map = {front:'prevFront',back:'prevBack',today:'prevToday'};
  const el = document.getElementById(map[kind]);
  el.innerHTML = 'Otpremanje na ImgBB…';
  try{
    const resized = await resizeImage(file);
    const url = await uploadToImgbb(resized);
    currentImages[kind] = url;
    updateUploadPreview(kind);
  }catch(err){
    console.error(err);
    alert('Greška pri otpremanju slike na ImgBB. Provjerite internet konekciju i probajte ponovo.');
    updateUploadPreview(kind);
  }
}

function openAdminForm(id){
  editingId = id || null;
  document.getElementById('formError').style.display = 'none';
  document.getElementById('formHeading').textContent = id ? 'Izmjena razglednice' : 'Nova razglednica';
  refreshAdminCategorySelect();
  document.getElementById('pcForm').reset();
  if(id){
    const pc = POSTCARDS.find(p=>p.id===id);
    document.getElementById('f_title').value = pc.title||'';
    document.getElementById('f_cat').value = pc.cat||'';
    document.getElementById('f_loc').value = pc.loc||'';
    document.getElementById('f_year').value = pc.year||'';
    document.getElementById('f_period').value = pc.period||'';
    document.getElementById('f_izdavac').value = pc.izdavac||'';
    document.getElementById('f_postmark').value = pc.postmark||'';
    document.getElementById('f_prava').value = pc.prava||'nepoznato';
    document.getElementById('f_lat').value = (pc.gps && pc.gps.lat) || '';
    document.getElementById('f_lng').value = (pc.gps && pc.gps.lng) || '';
    document.getElementById('f_tags').value = (pc.tags||[]).join(', ');
    document.getElementById('f_desc').value = pc.opis||'';
    document.getElementById('f_transcript').value = pc.transcript||'';
    document.getElementById('f_public').checked = pc.public!==false;
    currentImages = {front:pc.frontImg||null, back:pc.backImg||null, today:pc.todayImg||null};
    document.getElementById('deleteBtn').style.display = 'inline-flex';
  } else {
    document.getElementById('f_public').checked = true;
    currentImages = {front:null, back:null, today:null};
    document.getElementById('deleteBtn').style.display = 'none';
  }
  updateUploadPreview('front'); updateUploadPreview('back'); updateUploadPreview('today');
  document.getElementById('adminListSection').style.display = 'none';
  document.getElementById('adminFormSection').style.display = 'block';
  window.scrollTo({top:0,behavior:'instant'});
}
function closeAdminForm(){
  document.getElementById('adminFormSection').style.display = 'none';
  document.getElementById('adminListSection').style.display = 'block';
  renderAdminTable();
}
async function submitAdminForm(event){
  event.preventDefault();
  const title = document.getElementById('f_title').value.trim();
  const cat = document.getElementById('f_cat').value;
  const err = document.getElementById('formError');
  if(!title || !cat){
    err.textContent = 'Unesite bar naslov i kategoriju.';
    err.style.display = 'block';
    return false;
  }
  err.style.display = 'none';
  const data = {
    id: editingId || nextId(),
    title: title,
    cat: cat,
    loc: document.getElementById('f_loc').value.trim(),
    year: document.getElementById('f_year').value.trim(),
    period: document.getElementById('f_period').value.trim() || 'Nepoznat period',
    izdavac: document.getElementById('f_izdavac').value.trim(),
    postmark: document.getElementById('f_postmark').value.trim(),
    prava: document.getElementById('f_prava').value,
    gps: {lat:document.getElementById('f_lat').value.trim(), lng:document.getElementById('f_lng').value.trim()},
    tags: document.getElementById('f_tags').value.split(',').map(t=>t.trim()).filter(Boolean),
    opis: document.getElementById('f_desc').value.trim(),
    transcript: document.getElementById('f_transcript').value.trim(),
    public: document.getElementById('f_public').checked,
    frontImg: currentImages.front,
    backImg: currentImages.back,
    todayImg: currentImages.today,
    nd: !!currentImages.today || (editingId ? !!(POSTCARDS.find(p=>p.id===editingId)||{}).nd : false),
    palette: editingId ? ((POSTCARDS.find(p=>p.id===editingId)||{}).palette||0) : Math.floor(Math.random()*3),
  };
  const saveBtn = document.getElementById('saveBtn');
  if(saveBtn){ saveBtn.disabled = true; saveBtn.textContent = 'Čuvanje…'; }
  try{
    await saveOnePostcard(data);
  }catch(e){
    console.error(e);
    alert('Snimanje u Firebase nije uspjelo. Provjerite internet konekciju i probajte ponovo.');
    if(saveBtn){ saveBtn.disabled = false; saveBtn.textContent = 'Sačuvaj'; }
    return false;
  }
  if(saveBtn){ saveBtn.disabled = false; saveBtn.textContent = 'Sačuvaj'; }
  if(editingId){
    const idx = POSTCARDS.findIndex(p=>p.id===editingId);
    POSTCARDS[idx] = data;
  } else {
    POSTCARDS.push(data);
  }
  closeAdminForm();
  return false;
}
async function deleteFromForm(){
  if(!editingId) return;
  if(!confirm('Obrisati ovu razglednicu?')) return;
  try{
    await deleteOnePostcard(editingId);
  }catch(e){
    console.error(e);
    alert('Brisanje nije uspjelo. Provjerite internet konekciju.');
    return;
  }
  POSTCARDS = POSTCARDS.filter(p=>p.id!==editingId);
  closeAdminForm();
}
async function deleteFromTable(id){
  if(!confirm('Obrisati ovu razglednicu?')) return;
  try{
    await deleteOnePostcard(id);
  }catch(e){
    console.error(e);
    alert('Brisanje nije uspjelo. Provjerite internet konekciju.');
    return;
  }
  POSTCARDS = POSTCARDS.filter(p=>p.id!==id);
  renderAdminTable();
}
async function toggleField(id, field){
  const pc = POSTCARDS.find(p=>p.id===id);
  if(!pc) return;
  const prev = pc[field];
  pc[field] = !prev;
  renderAdminTable();
  try{
    await db.collection(POSTCARDS_COLLECTION).doc(id).update({[field]: pc[field]});
  }catch(e){
    console.error(e);
    pc[field] = prev;
    renderAdminTable();
    alert('Izmjena nije sačuvana u Firebase-u. Provjerite internet konekciju.');
  }
}
async function resetAllData(){
  if(!confirm('Ovo briše sve trenutne razglednice u Firebase bazi i vraća početnih 12 razglednica. Nastaviti?')) return;
  try{
    for(const pc of POSTCARDS){ await deleteOnePostcard(pc.id); }
    const defaults = JSON.parse(JSON.stringify(DEFAULT_POSTCARDS));
    for(const pc of defaults){ await saveOnePostcard(pc); }
    POSTCARDS = defaults;
  }catch(e){
    console.error(e);
    alert('Vraćanje na početne podatke nije uspjelo. Provjerite internet konekciju.');
  }
  renderAdminTable();
}
async function duplicatePostcard(id){
  const pc = POSTCARDS.find(p=>p.id===id);
  if(!pc) return;
  const copy = JSON.parse(JSON.stringify(pc));
  copy.id = nextId();
  copy.title = copy.title ? copy.title + ' (kopija)' : 'Nova razglednica (kopija)';
  try{
    await saveOnePostcard(copy);
  }catch(e){
    console.error(e);
    alert('Dupliciranje nije uspjelo. Provjerite internet konekciju.');
    return;
  }
  POSTCARDS.push(copy);
  openAdminForm(copy.id);
}
function exportLocalData(){
  const raw = localStorage.getItem('bl_nekad_i_danas_v1');
  if(!raw){ alert('Nema lokalno sačuvanih podataka u ovom browseru za izvoz.'); return; }
  const blob = new Blob([raw], {type:'application/json'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'razglednice-export.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(a.href);
}
async function migrateList(list){
  if(!Array.isArray(list) || !list.length){ alert('Fajl ne sadrži nijednu razglednicu.'); return; }
  if(!confirm('Ovo će '+list.length+' razglednica (uključujući slike) prebaciti u Firebase i ImgBB. Slike koje već imaju http link se preskaču. Može potrajati — ne zatvarajte stranicu. Nastaviti?')) return;
  let ok = 0, failed = 0;
  for(const pc of list){
    try{
      for(const key of ['frontImg','backImg','todayImg']){
        if(pc[key] && typeof pc[key]==='string' && pc[key].startsWith('data:')){
          pc[key] = await uploadToImgbb(pc[key]);
        }
      }
      await saveOnePostcard(pc);
      ok++;
    }catch(e){
      console.error('Migracija nije uspjela za', pc.id, e);
      failed++;
    }
  }
  alert('Migracija završena: '+ok+' uspješno'+(failed?(', '+failed+' neuspješno (provjerite konzolu).'):'.'));
  try{
    POSTCARDS = await fetchPostcardsFromFirestore();
  }catch(e){ console.error(e); }
  renderAdminTable();
}
async function migrateLocalToFirebase(){
  const raw = localStorage.getItem('bl_nekad_i_danas_v1');
  if(!raw){
    alert('Nema lokalno sačuvanih podataka u OVOM browseru/sajtu za migraciju.\n\nAko ste razglednice unosili otvaranjem fajla direktno sa računara (dupli klik na index.html) ili na drugom uređaju, to su odvojeni "browser" prostori — ovo dugme ih ne vidi.\n\nUmjesto toga: tamo gdje ste unosili podatke kliknite "Izvezi lokalne podatke (JSON)", pa se taj fajl prenesite ovdje i kliknite "Uvezi iz JSON fajla".');
    return;
  }
  let list;
  try{ list = JSON.parse(raw); }catch(e){ alert('Lokalni podaci nisu čitljivi.'); return; }
  await migrateList(list);
}
function importJsonFile(e){
  const file = e.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = async function(ev){
    let list;
    try{ list = JSON.parse(ev.target.result); }catch(err){ alert('Izabrani fajl nije validan JSON.'); e.target.value=''; return; }
    await migrateList(list);
    e.target.value = '';
  };
  reader.onerror = function(){ alert('Čitanje fajla nije uspjelo.'); e.target.value=''; };
  reader.readAsText(file);
}
function renderAdminTable(){
  document.getElementById('adminCount').textContent = POSTCARDS.length+' razglednica ukupno';
  const rows = POSTCARDS.map(pc=>{
    const c = catInfo(pc.cat);
    return `<tr>
      <td><div class="admin-thumb">${mediaFor(pc,'before')}</div></td>
      <td>${pc.id}</td>
      <td>${pc.title}</td>
      <td>${c.name}</td>
      <td>${pc.year||''}</td>
      <td><button class="status-toggle ${pc.public!==false?'on':''}" onclick="toggleField('${pc.id}','public')">${pc.public!==false?'javna':'skrivena'}</button></td>
      <td class="row-actions"><button onclick="openAdminForm('${pc.id}')">Izmijeni</button><button onclick="duplicatePostcard('${pc.id}')">Dupliciraj</button><button onclick="openQrModal('${pc.id}')">QR kod</button><button class="danger" onclick="deleteFromTable('${pc.id}')">Obriši</button></td>
    </tr>`;
  }).join('');
  document.getElementById('adminTable').innerHTML = `<thead><tr><th>Slika</th><th>ID</th><th>Naslov</th><th>Kategorija</th><th>Godina</th><th>Javna</th><th>Akcije</th></tr></thead><tbody>${rows}</tbody>`;
}

/* ===================== QR KOD ===================== */
let currentQrPc = null;
function openQrModal(id){
  const pc = POSTCARDS.find(p=>p.id===id);
  if(!pc) return;
  currentQrPc = pc;
  const url = detailUrlFor(id);
  const qr = qrcode(0,'M');
  qr.addData(url);
  qr.make();
  document.getElementById('qrBox').innerHTML = qr.createSvgTag({cellSize:6,margin:8,scalable:true});
  document.getElementById('qrId').textContent = pc.id;
  document.getElementById('qrTitle').textContent = pc.title;
  document.getElementById('qrModal').classList.add('open');
}
function closeQrModal(){
  document.getElementById('qrModal').classList.remove('open');
  currentQrPc = null;
}
function printQr(){
  window.print();
}
function downloadQrSvg(){
  if(!currentQrPc) return;
  const svg = document.getElementById('qrBox').innerHTML;
  const blob = new Blob([svg], {type:'image/svg+xml'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = currentQrPc.id + '-qr.svg';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(a.href);
}

/* ===================== PRIKAZ / NAVIGACIJA ===================== */
function toggleMobileNav(){
  const nav = document.getElementById('mainNav');
  const btn = document.getElementById('menuToggle');
  const open = nav.classList.toggle('open');
  btn.setAttribute('aria-expanded', open ? 'true' : 'false');
}
function closeMobileNav(){
  document.getElementById('mainNav').classList.remove('open');
  document.getElementById('menuToggle').setAttribute('aria-expanded','false');
}
function showView(name,skipScroll){
  if(name!=='detail' && location.hash.indexOf('#/r/')===0){ history.replaceState(null,'',location.pathname+location.search); }
  document.querySelectorAll('.view').forEach(v=>v.classList.remove('active'));
  document.getElementById('view-'+name).classList.add('active');
  document.querySelectorAll('nav.main-nav button').forEach(b=>b.classList.toggle('active', b.dataset.view===name));
  if(name==='gallery'){ refreshGalleryFilters(); applyFilters(); }
  if(name==='timeline'){ renderTimeline(); }
  if(name==='admin'){
    if(auth.currentUser){
      document.getElementById('adminLoginSection').style.display = 'none';
      document.getElementById('adminFormSection').style.display = 'none';
      document.getElementById('adminListSection').style.display = 'block';
      renderAdminTable();
    } else {
      document.getElementById('adminLoginSection').style.display = 'block';
      document.getElementById('adminListSection').style.display = 'none';
      document.getElementById('adminFormSection').style.display = 'none';
    }
  }
  if(name==='home'){ renderHome(); }
  if(!skipScroll) window.scrollTo({top:0,behavior:'instant'});
}
function goHome(){ showView('home'); }

/* ===================== INIT ===================== */
async function initApp(){
  try{
    POSTCARDS = await fetchPostcardsFromFirestore();
  }catch(e){
    console.error('Greška pri učitavanju iz Firebase-a', e);
    const el = document.getElementById('appLoading');
    if(el) el.innerHTML = '<div class="app-loading-error">Greška pri povezivanju sa bazom podataka.<br>Provjerite internet konekciju i osvježite stranicu.</div>';
    return;
  }
  const el = document.getElementById('appLoading');
  if(el) el.style.display = 'none';
  renderHome();
  syncFromHash();
}
window.addEventListener('popstate', syncFromHash);
initApp();
