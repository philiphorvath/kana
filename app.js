/* Kana — Japanese learning PWA. SRS (SM-2 style with learning steps), kana recognition + writing, sentence patterns. */
(() => {
const D = window.DATA;
let deferredPrompt = null;
const $ = (s, r = document) => r.querySelector(s);
const main = $('#main');
const MIN = 60000, DAY = 86400000;
const now = () => Date.now();
const todayKey = () => { const d = new Date(); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); };
const rnd = a => a[Math.floor(Math.random() * a.length)];
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]]; } return a; };
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
function h(tag, attrs = {}, ...kids) {
  const e = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v == null || v === false) continue;
    if (k === 'class') e.className = v; else if (k === 'html') e.innerHTML = v; else if (k.startsWith('on')) e.addEventListener(k.slice(2), v); else e.setAttribute(k, v);
  }
  for (const k of kids.flat()) if (k != null) e.append(k.nodeType ? k : document.createTextNode(k));
  return e;
}
let toastT; function toast(m) { const t = $('#toast'); t.textContent = m; t.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 1800); }

// ---------- Strokes ----------
let STROKES = {};
fetch('strokes.json').then(r => r.json()).then(j => { STROKES = j; }).catch(() => toast('Stroke data missing'));

// ---------- Cards & units ----------
const UNITS = []; const CARDS = {}; const UNIT_OF = {};
function addCard(c, unit) { CARDS[c.id] = c; c.unit = unit.id; unit.cards.push(c.id); UNIT_OF[c.id] = unit; }
for (const [script, lessons] of [['h', D.H], ['k', D.K]]) {
  for (const L of lessons) {
    const u = { id: L.id, kind: 'kana', script, name: (script === 'h' ? 'Hiragana · ' : 'Katakana · ') + L.name, cards: [], kana: L.kana, combo: !!L.combo };
    UNITS.push(u);
    for (const [k, r, m] of L.kana) {
      addCard({ id: 'kr:' + k, kind: 'kr', k, r, m, script }, u);
      if (!L.combo && k !== 'ー') addCard({ id: 'kw:' + k, kind: 'kw', k, r, m, script }, u);
    }
  }
}
const VOCAB = D.VOCAB.map(([id, jp, ro, en, type, tier]) => ({ id, jp, ro, en, type, tier }));
const VBY = Object.fromEntries(VOCAB.map(v => [v.id, v]));
for (let t = 1; t <= 6; t++) {
  const u = { id: 's' + t, kind: 'sent', name: 'Sentences · Level ' + t, cards: [], tier: t };
  UNITS.push(u);
  for (const p of D.PHRASES.filter(p => p[1] === t)) addCard({ id: 'ph:' + p[0], kind: 'ph', jp: p[2], ro: p[3], en: p[4] }, u);
  for (const v of VOCAB.filter(v => v.tier === t)) addCard({ ...v, id: 'v:' + v.id, kind: 'v' }, u);
  for (const p of D.PATTERNS.filter(p => p.tier === t)) addCard({ ...p, id: 'p:' + p.id, kind: 'p' }, u);
}
const UNIT_IDX = Object.fromEntries(UNITS.map((u, i) => [u.id, i]));

// ---------- State ----------
const KEY = 'kana.v1';
const defaults = () => ({ cards: {}, settings: { newPerDay: 10, romaji: true, tts: true, strict: false }, day: { date: todayKey(), n: 0, rev: 0 }, unlocked: { h1: true }, streak: { last: '', n: 0 }, log: {} });
let S = defaults();
try { const j = JSON.parse(localStorage.getItem(KEY)); if (j) S = Object.assign(defaults(), j, { settings: Object.assign(defaults().settings, j.settings || {}) }); } catch (e) { }
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { toast('Could not save progress'); } }
function rollDay() { const t = todayKey(); if (S.day.date !== t) { S.day = { date: t, n: 0, rev: 0 }; save(); } }
function cs(id) { return S.cards[id] || (S.cards[id] = { s: 'new', due: 0, ivl: 0, ease: 2.5, reps: 0, lapses: 0, step: 0 }); }
function touchStreak() {
  const t = todayKey(); if (S.streak.last === t) return;
  const y = new Date(); y.setDate(y.getDate() - 1); const yk = y.getFullYear() + '-' + (y.getMonth() + 1) + '-' + y.getDate();
  S.streak.n = S.streak.last === yk ? S.streak.n + 1 : 1; S.streak.last = t;
  S.log[t] = (S.log[t] || 0);
}

// ---------- SRS (SM-2 + learning steps, Anki-like) ----------
const LEARN = [1 * MIN, 10 * MIN], RELEARN = [10 * MIN], GRAD = 1, EASY = 4;
function fuzz(d) { return d < 3 ? d : Math.round(d * (0.95 + Math.random() * 0.1)); }
function grade(id, g) { // g: 0 again, 1 hard, 2 good, 3 easy
  const c = cs(id), t = now(); c.reps++;
  if (c.s === 'new' || c.s === 'learn' || c.s === 'relearn') {
    const steps = c.s === 'relearn' ? RELEARN : LEARN;
    if (g === 0) { c.step = 0; c.s = c.s === 'relearn' ? 'relearn' : 'learn'; c.due = t + steps[0]; }
    else if (g === 1) { c.s = c.s === 'relearn' ? 'relearn' : 'learn'; c.due = t + Math.round(steps[Math.min(c.step, steps.length - 1)] * 1.5); }
    else if (g === 3) { c.s = 'rev'; c.ivl = EASY; c.due = t + c.ivl * DAY; c.step = 0; }
    else { c.step++; if (c.step >= steps.length) { c.s = 'rev'; c.ivl = c.ivl && c.s === 'relearn' ? c.ivl : GRAD; c.due = t + c.ivl * DAY; c.step = 0; } else { c.s = c.s === 'new' ? 'learn' : c.s; c.due = t + steps[c.step]; } }
  } else { // review
    if (g === 0) { c.lapses++; c.ease = Math.max(1.3, c.ease - 0.2); c.ivl = Math.max(1, Math.round(c.ivl * 0.3)); c.s = 'relearn'; c.step = 0; c.due = t + RELEARN[0]; }
    else if (g === 1) { c.ease = Math.max(1.3, c.ease - 0.15); c.ivl = fuzz(Math.max(c.ivl + 1, Math.round(c.ivl * 1.2))); c.due = t + c.ivl * DAY; }
    else if (g === 2) { c.ivl = fuzz(Math.max(c.ivl + 1, Math.round(c.ivl * c.ease))); c.due = t + c.ivl * DAY; }
    else { c.ease += 0.15; c.ivl = fuzz(Math.max(c.ivl + 2, Math.round(c.ivl * c.ease * 1.3))); c.due = t + c.ivl * DAY; }
  }
  S.day.rev++; S.log[todayKey()] = (S.log[todayKey()] || 0) + 1; save();
}
const mastery = id => { const c = S.cards[id]; if (!c || c.s === 'new') return 0; if (c.s !== 'rev') return 1; return c.ivl >= 21 ? 3 : 2; };

// ---------- Unit gating ----------
function unitStats(u) { let intro = 0, rev = 0; for (const id of u.cards) { const c = S.cards[id]; if (c && c.s !== 'new') intro++; if (c && c.s === 'rev') rev++; } return { intro, rev, total: u.cards.length }; }
function unitState(u) { const st = unitStats(u); if (st.rev === st.total) return 'done'; if (S.unlocked[u.id]) return 'active'; return 'locked'; }
function refreshUnlocks() {
  for (let i = 1; i < UNITS.length; i++) {
    if (S.unlocked[UNITS[i].id]) continue;
    const p = UNITS[i - 1], st = unitStats(p);
    if (st.intro === st.total && st.rev >= Math.ceil(st.total * 0.6)) { S.unlocked[UNITS[i].id] = true; save(); toast('Unlocked: ' + UNITS[i].name); }
    break;
  }
}
const currentUnit = () => UNITS.find(u => S.unlocked[u.id] && unitStats(u).intro < u.cards.length) || null;
const maxTier = () => { let t = 0; for (const u of UNITS) if (u.kind === 'sent' && S.unlocked[u.id]) t = u.tier; return t; };

// ---------- Queue ----------
function dueCards(ahead = 0) { const t = now() + ahead; return Object.keys(S.cards).filter(id => CARDS[id] && S.cards[id].s !== 'new' && S.cards[id].due <= t).sort((a, b) => S.cards[a].due - S.cards[b].due); }
function newCards(limit) {
  const out = []; for (const u of UNITS) { if (!S.unlocked[u.id]) continue; for (const id of u.cards) { if (out.length >= limit) return out; if (cs(id).s === 'new') out.push(id); } }
  return out;
}
function newBudget() { rollDay(); return Math.max(0, S.settings.newPerDay - S.day.n); }

// ---------- TTS ----------
let jaVoice = null;
function pickVoice() { const vs = speechSynthesis.getVoices(); jaVoice = vs.find(v => /^ja/i.test(v.lang)) || null; }
if ('speechSynthesis' in window) { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; }
function speak(text) {
  if (!S.settings.tts || !('speechSynthesis' in window)) return;
  const u = new SpeechSynthesisUtterance(text.replace(/[{}]/g, '')); u.lang = 'ja-JP'; if (jaVoice) u.voice = jaVoice; u.rate = 0.85;
  speechSynthesis.cancel(); speechSynthesis.speak(u);
}
const speakBtn = t => h('button', { class: 'speak', title: 'Listen', onclick: e => { e.stopPropagation(); speak(t); } }, '🔊');

// ---------- Navigation ----------
let view = 'home';
function go(v, arg) { view = v; if (session && session.timer) clearInterval(session.timer); document.querySelectorAll('nav button').forEach(b => b.classList.toggle('on', b.dataset.v === v)); window.scrollTo(0, 0); ({ home, kana, sent, settings, study, practice, unit }[v])(arg); }
document.querySelectorAll('nav button').forEach(b => b.onclick = () => go(b.dataset.v));
function setTitle(t, right) { $('#title').textContent = t; const r = $('#hdr-right'); r.innerHTML = ''; if (right) r.append(right); if (deferredPrompt) r.append(h('button', { class: 'btn sm primary', onclick: () => { deferredPrompt.prompt(); deferredPrompt = null; setTitle(t, right); } }, 'Install')); }

// ---------- Home ----------
function home() {
  rollDay(); refreshUnlocks(); setTitle('Kana');
  const due = dueCards().length, nb = Math.min(newBudget(), newCards(999).length), cu = currentUnit();
  const learned = Object.values(S.cards).filter(c => c.s !== 'new').length;
  main.innerHTML = '';
  main.append(
    h('div', { class: 'stat' },
      h('div', {}, h('b', {}, String(due)), h('span', {}, 'due now')),
      h('div', {}, h('b', {}, String(nb)), h('span', {}, 'new today')),
      h('div', {}, h('b', {}, String(S.streak.n)), h('span', {}, 'day streak'))),
    h('div', { class: 'card', style: 'margin-top:12px' },
      h('div', { class: 'tag' }, 'Now'),
      h('div', { style: 'font-size:18px;font-weight:600;margin:4px 0 10px' }, cu ? cu.name : 'All units introduced — keep reviewing'),
      h('button', { class: 'btn primary wide', onclick: () => go('study'), disabled: !(due || nb) ? '' : null }, due + nb ? `Study ${due + nb} cards` : 'Nothing due — come back later'),
      due + nb === 0 && cu ? h('button', { class: 'btn wide', style: 'margin-top:8px', onclick: () => { S.settings.newPerDay += 5; save(); home(); } }, '+5 new cards today') : null),
    h('h2', {}, 'Path'),
    h('div', { class: 'lesson-list' }, UNITS.map(u => {
      const st = unitStats(u), state = unitState(u);
      return h('button', { class: state, onclick: () => go('unit', u) },
        h('span', {}, state === 'done' ? '✓' : state === 'active' ? '●' : '○'), h('span', {}, u.name),
        h('span', { class: 'st' }, state === 'locked' ? 'locked' : `${st.rev}/${st.total}`));
    })),
    h('p', { class: 'small muted' }, `${learned} cards learned · ${Object.keys(CARDS).length} total. ` + D.CREDITS));
}

// ---------- Unit detail ----------
function unit(u) {
  setTitle(u.name, h('button', { class: 'btn sm', onclick: () => go('home') }, 'Back'));
  main.innerHTML = '';
  const st = unitStats(u), state = unitState(u);
  const wrap = h('div', {});
  if (state === 'locked') wrap.append(h('div', { class: 'card' }, h('p', {}, 'Locked. Finish the previous unit first (all cards introduced, most graduated).'),
    h('button', { class: 'btn', onclick: () => { S.unlocked[u.id] = true; save(); go('unit', u); } }, 'Unlock anyway')));
  else wrap.append(h('div', { class: 'card' }, h('div', {}, `${st.intro}/${st.total} introduced · ${st.rev}/${st.total} graduated`)));
  if (u.kind === 'kana') {
    wrap.append(h('div', { class: 'kgrid' }, u.kana.map(([k, r]) => {
      const m = Math.min(mastery('kr:' + k), CARDS['kw:' + k] ? mastery('kw:' + k) : 3);
      return h('button', { class: 'jp m' + m, onclick: () => go('practice', { k, r, m: CARDS['kr:' + k].m }) }, k, h('small', {}, r));
    })));
    wrap.append(h('p', { class: 'small muted' }, 'Tap any character to practise writing it. Colour bar = mastery (learning → young → mature).'));
  } else {
    const ps = u.cards.filter(id => CARDS[id].kind === 'p').map(id => CARDS[id]);
    const vs = u.cards.filter(id => CARDS[id].kind === 'v').map(id => CARDS[id]);
    const phs = u.cards.filter(id => CARDS[id].kind === 'ph').map(id => CARDS[id]);
    if (phs.length) wrap.append(h('h2', {}, 'Set phrases'), h('div', { class: 'card' }, phs.map(p => h('div', { class: 'pat row' }, h('div', { class: 'grow' }, h('div', { class: 'jp' }, p.jp), h('div', { class: 'small muted' }, (S.settings.romaji ? p.ro + ' · ' : '') + p.en)), speakBtn(p.jp)))));
    wrap.append(h('h2', {}, 'Patterns'), h('div', { class: 'card' }, ps.map(p => h('div', { class: 'pat row' }, h('div', { class: 'grow' }, h('div', { class: 'jp' }, fill(p, p.ex, p.ex2)), h('div', { class: 'small' }, fillEn(p, p.ex, p.ex2)), h('div', { class: 'small muted' }, p.note)), speakBtn(fill(p, p.ex, p.ex2))))));
    wrap.append(h('h2', {}, 'Vocabulary'), h('div', { class: 'card' }, vs.map(v => h('div', { class: 'pat row' }, h('div', { class: 'grow' }, h('span', { class: 'jp', style: 'font-size:20px' }, v.jp), ' ', h('span', { class: 'muted small' }, (S.settings.romaji ? v.ro + ' · ' : '')), v.en), speakBtn(v.jp)))));
    wrap.append(h('button', { class: 'btn wide', style: 'margin-top:8px', onclick: () => go('study', { builder: u.tier }) }, 'Practise sentence building'));
  }
  main.append(wrap);
}
function fill(p, x, y) { let s = p.jp; if (x) s = s.replace('{X}', VBY[x].jp); if (y) s = s.replace('{Y}', VBY[y].jp); return s; }
function fillRo(p, x, y) { let s = p.ro; if (x) s = s.replace('{X}', VBY[x].ro); if (y) s = s.replace('{Y}', VBY[y].ro); return s; }
function fillEn(p, x, y) { let s = p.en; if (x) s = s.replace('{X}', VBY[x].en); if (y) s = s.replace('{Y}', VBY[y].en); return s; }

// ---------- Kana chart ----------
function kana() {
  setTitle('Kana chart'); main.innerHTML = '';
  for (const [name, lessons] of [['Hiragana', D.H], ['Katakana', D.K]]) {
    main.append(h('h2', {}, name));
    const all = lessons.flatMap(L => L.kana.map(([k, r]) => ({ k, r, u: L.id })));
    main.append(h('div', { class: 'kgrid' }, all.map(({ k, r, u }) => {
      const m = Math.min(mastery('kr:' + k), CARDS['kw:' + k] ? mastery('kw:' + k) : 3);
      return h('button', { class: 'jp m' + m + (S.unlocked[u] ? '' : ' locked'), onclick: () => go('practice', { k, r, m: CARDS['kr:' + k].m }) }, k, h('small', {}, r));
    })));
  }
}

// ---------- Sentences library ----------
function sent() {
  setTitle('Sentences'); main.innerHTML = '';
  const mt = maxTier();
  if (!mt) { main.append(h('div', { class: 'card' }, 'Sentences unlock after katakana. Finish the kana path first — or unlock a sentence level from the Home path.')); return; }
  main.append(h('div', { class: 'row', style: 'margin-bottom:8px' }, h('button', { class: 'btn primary grow', onclick: () => go('study', { builder: mt }) }, 'Sentence builder drill')));
  for (const u of UNITS.filter(u => u.kind === 'sent' && S.unlocked[u.id])) {
    main.append(h('h2', {}, u.name));
    main.append(h('div', { class: 'card' }, u.cards.filter(id => CARDS[id].kind === 'p').map(id => { const p = CARDS[id]; return h('div', { class: 'pat row', onclick: () => go('unit', u) }, h('div', { class: 'grow' }, h('div', { class: 'jp' }, p.jp), h('div', { class: 'small muted' }, p.en)), speakBtn(fill(p, p.ex, p.ex2))); })));
  }
}

// ---------- Settings ----------
function settings() {
  setTitle('Settings'); main.innerHTML = '';
  const set = (k, v) => { S.settings[k] = v; save(); };
  const chk = (k, label, hint) => h('label', { class: 'set' }, h('div', {}, label, hint ? h('div', { class: 'small muted' }, hint) : null), h('input', { type: 'checkbox', ...(S.settings[k] ? { checked: '' } : {}), onchange: e => set(k, e.target.checked) }));
  main.append(h('div', { class: 'card' },
    h('label', { class: 'set' }, h('div', {}, 'New cards per day'), h('input', { type: 'number', min: 0, max: 50, value: S.settings.newPerDay, onchange: e => set('newPerDay', +e.target.value || 0) })),
    chk('romaji', 'Show romaji', 'Turn off once kana feel comfortable — reading kana directly is the goal.'),
    chk('tts', 'Speak Japanese (device voice)', jaVoice ? 'Japanese voice found: ' + jaVoice.name : 'No Japanese voice found. Android: Settings → System → Languages → Text-to-speech → Google → Install voice data → Japanese.'),
    chk('strict', 'Strict drawing', 'Tighter tolerance when scoring your strokes.')));
  main.append(h('h2', {}, 'Backup'), h('div', { class: 'card' },
    h('p', { class: 'small muted' }, 'Progress lives only on this device. Export occasionally and keep the text somewhere safe.'),
    h('div', { class: 'row' },
      h('button', { class: 'btn grow', onclick: () => { const t = JSON.stringify(S); navigator.clipboard?.writeText(t).then(() => toast('Copied to clipboard')).catch(() => { $('#bk').value = t; }); $('#bk').value = t; } }, 'Export'),
      h('button', { class: 'btn grow', onclick: () => { try { const j = JSON.parse($('#bk').value); if (!j.cards) throw 0; S = Object.assign(defaults(), j); save(); toast('Imported'); go('home'); } catch (e) { toast('Invalid backup'); } } }, 'Import')),
    h('textarea', { id: 'bk', placeholder: 'Backup JSON appears here / paste here to import', style: 'margin-top:8px' })));
  main.append(h('h2', {}, 'Danger'), h('div', { class: 'card' }, h('button', { class: 'btn', onclick: () => { if (confirm('Reset all progress?')) { S = defaults(); save(); go('home'); } } }, 'Reset progress')));
  main.append(h('p', { class: 'small muted' }, 'Kana v' + APP_VERSION + ' · ' + D.CREDITS));
}

// ---------- Drawing pad ----------
const PADSZ = 109;
function resample(pts, n = 24) {
  if (pts.length < 2) return Array(n).fill(pts[0] || [0, 0]);
  const L = []; let tot = 0; for (let i = 1; i < pts.length; i++) { tot += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); L.push(tot); }
  const out = [pts[0]]; let j = 0;
  for (let k = 1; k < n; k++) { const d = tot * k / (n - 1); while (j < L.length - 1 && L[j] < d) j++; const a = pts[j], b = pts[j + 1], d0 = j ? L[j - 1] : 0, seg = L[j] - d0 || 1, t = Math.max(0, Math.min(1, (d - d0) / seg)); out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]); }
  return out;
}
function strokeScore(user, tmpl, strict) {
  const a = resample(user), b = resample(tmpl);
  let d = 0; for (let i = 0; i < a.length; i++) d += Math.hypot(a[i][0] - b[i][0], a[i][1] - b[i][1]); d /= a.length;
  const rev = Math.hypot(a[0][0] - b[b.length - 1][0], a[0][1] - b[b.length - 1][1]) < Math.hypot(a[0][0] - b[0][0], a[0][1] - b[0][1]) - 8;
  const thr = strict ? 14 : 20;
  const s = Math.max(0, 1 - d / thr); return { score: rev ? s * 0.4 : s, dist: d, reversed: rev };
}
function makePad(opts) { // opts: {char, mode:'trace'|'guided'|'free', onDone(result), onStroke}
  const tmpl = STROKES[opts.char] || [];
  const pad = h('div', { class: 'pad' }); const grid = h('div', { class: 'grid' }); const cv = h('canvas'); pad.append(grid, cv);
  const ctx = cv.getContext('2d'); let W = 300, dpr = 1;
  const user = []; let cur = null, tries = 0, anim = null, done = false;
  function size() { const r = pad.getBoundingClientRect(); W = r.width || 300; dpr = devicePixelRatio || 1; cv.width = W * dpr; cv.height = W * dpr; draw(); }
  const sc = p => [p[0] / PADSZ * W * dpr, p[1] / PADSZ * W * dpr];
  function line(pts, color, width, dash) { if (pts.length < 1) return; ctx.beginPath(); ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.strokeStyle = color; ctx.lineWidth = width * dpr; ctx.setLineDash(dash || []); const [x0, y0] = sc(pts[0]); ctx.moveTo(x0, y0); if (pts.length === 1) ctx.lineTo(x0 + .1, y0); for (const p of pts.slice(1)) { const [x, y] = sc(p); ctx.lineTo(x, y); } ctx.stroke(); ctx.setLineDash([]); }
  function dot(p, color, r) { const [x, y] = sc(p); ctx.beginPath(); ctx.fillStyle = color; ctx.arc(x, y, r * dpr, 0, 7); ctx.fill(); }
  const ink = getComputedStyle(document.documentElement).getPropertyValue('--ink').trim() || '#222';
  let animT = 0;
  function draw() {
    ctx.clearRect(0, 0, cv.width, cv.height);
    const idx = user.length;
    if (opts.mode === 'trace') { tmpl.forEach((s, i) => line(s, i < idx ? 'rgba(46,139,87,.25)' : 'rgba(128,128,128,.28)', 14)); if (tmpl[idx] && !done) { const s = tmpl[idx]; line(s, 'rgba(201,67,43,.35)', 14); const rs = resample(s, 40); const k = Math.floor(animT * 40) % 40; dot(rs[k], '#c9432b', 8); dot(s[0], 'rgba(201,67,43,.9)', 5); } }
    else if (opts.mode === 'guided') { tmpl.forEach(s => line(s, 'rgba(128,128,128,.16)', 14)); if (tmpl[idx] && !done && tries > 0) dot(tmpl[idx][0], 'rgba(201,67,43,.9)', 6); }
    if (opts.showAll) tmpl.forEach(s => line(s, 'rgba(46,139,87,.5)', 10));
    user.forEach((s, i) => line(s.pts, s.ok === false ? '#c9432b' : s.ok ? ink : ink, 9));
    if (cur) line(cur, ink, 9);
  }
  function tick(t) { animT = t / 1500; if (opts.mode === 'trace' && !done) draw(); anim = requestAnimationFrame(tick); }
  const pos = e => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) / r.width * PADSZ, (e.clientY - r.top) / r.height * PADSZ]; };
  cv.addEventListener('pointerdown', e => { if (done) return; e.preventDefault(); cv.setPointerCapture(e.pointerId); cur = [pos(e)]; draw(); });
  cv.addEventListener('pointermove', e => { if (!cur) return; e.preventDefault(); const p = pos(e); const q = cur[cur.length - 1]; if (Math.hypot(p[0] - q[0], p[1] - q[1]) > 0.8) { cur.push(p); draw(); } });
  const up = e => { if (!cur) return; e.preventDefault(); const pts = cur; cur = null; if (pts.length < 2) { draw(); return; } finishStroke(pts); };
  cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
  function finishStroke(pts) {
    const i = user.length; const t = tmpl[i];
    if (opts.mode === 'free') { user.push({ pts }); draw(); opts.onStroke?.(user.length, tmpl.length); if (user.length >= tmpl.length) setTimeout(evaluateFree, 150); return; }
    if (!t) { user.push({ pts, ok: false }); draw(); return; }
    const r = strokeScore(pts, t, S.settings.strict);
    const pass = r.score >= (opts.mode === 'trace' ? 0.45 : 0.4);
    if (pass) { user.push({ pts, ok: true, score: r.score }); tries = 0; opts.onStroke?.(user.length, tmpl.length, true, r); if (user.length === tmpl.length) finish(); }
    else { tries++; user.push({ pts, ok: false }); draw(); opts.onStroke?.(user.length - 1, tmpl.length, false, r, tries); setTimeout(() => { user.pop(); draw(); }, 450); }
    draw();
  }
  let triesTotal = 0;
  function evaluateFree() {
    if (done) return;
    if (user.length !== tmpl.length) { finish(0, 'Stroke count: ' + user.length + ' (expected ' + tmpl.length + ')'); return; }
    let s = 0; user.forEach((u, i) => { const r = strokeScore(u.pts, tmpl[i], S.settings.strict); u.ok = r.score >= 0.4; s += r.score; }); finish(s / tmpl.length);
  }
  function finish(score, msg) {
    done = true; cancelAnimationFrame(anim);
    if (score == null) { score = user.reduce((a, u) => a + (u.score || 0), 0) / Math.max(1, tmpl.length); }
    opts.showAll = true; draw(); opts.onDone?.({ score, msg, retries: triesTotal });
  }
  const api = { el: pad, reset() { user.length = 0; cur = null; done = false; opts.showAll = false; tries = 0; draw(); if (opts.mode === 'trace') { cancelAnimationFrame(anim); anim = requestAnimationFrame(tick); } }, check: evaluateFree, undo() { if (!done && user.length) { user.pop(); draw(); } }, reveal() { opts.showAll = true; draw(); }, get strokes() { return user.length; }, destroy() { cancelAnimationFrame(anim); ro.disconnect(); } };
  const ro = new ResizeObserver(size); ro.observe(pad);
  setTimeout(size, 0); if (opts.mode === 'trace') anim = requestAnimationFrame(tick);
  return api;
}
function animateChar(char, ms = 1600) { // returns element that plays stroke order once
  const tmpl = STROKES[char] || []; const pad = h('div', { class: 'pad', style: 'max-width:200px' }); const cv = h('canvas'); pad.append(h('div', { class: 'grid' }), cv);
  const ctx = cv.getContext('2d'); let W = 200, dpr = devicePixelRatio || 1; const ink = getComputedStyle(document.documentElement).getPropertyValue('--ink').trim() || '#222';
  const total = tmpl.reduce((a, s) => a + s.length, 0); let start = null, raf;
  function frame(t) {
    if (!start) start = t; const k = Math.min(1, (t - start) / ms) * total; ctx.clearRect(0, 0, cv.width, cv.height);
    let acc = 0; for (const s of tmpl) { const n = Math.max(0, Math.min(s.length, Math.ceil(k - acc))); if (n > 1) { ctx.beginPath(); ctx.lineCap = ctx.lineJoin = 'round'; ctx.strokeStyle = ink; ctx.lineWidth = 8 * dpr; s.slice(0, n).forEach((p, i) => { const x = p[0] / PADSZ * W * dpr, y = p[1] / PADSZ * W * dpr; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.stroke(); } acc += s.length; }
    tmpl.forEach((s, i) => { const x = s[0][0] / PADSZ * W * dpr, y = s[0][1] / PADSZ * W * dpr; ctx.fillStyle = '#c9432b'; ctx.beginPath(); ctx.arc(x, y, 4 * dpr, 0, 7); ctx.fill(); ctx.fillStyle = '#fff'; ctx.font = `${8 * dpr}px sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(i + 1, x, y); });
    if (k < total) raf = requestAnimationFrame(frame);
  }
  const play = () => { start = null; cancelAnimationFrame(raf); raf = requestAnimationFrame(frame); };
  setTimeout(() => { const r = pad.getBoundingClientRect(); W = r.width || 200; cv.width = cv.height = W * dpr; play(); }, 0);
  pad.onclick = play; pad.style.cursor = 'pointer';
  return pad;
}

// ---------- Practice (free-standing writing) ----------
function practice({ k, r, m }) {
  setTitle('Practise ' + k, h('button', { class: 'btn sm', onclick: () => go('kana') }, 'Back'));
  let mode = mastery('kw:' + k) >= 2 ? 'free' : 'trace';
  const render = () => {
    main.innerHTML = '';
    const fb = h('div', { class: 'feedback' });
    const modes = h('div', { class: 'row', style: 'justify-content:center;margin-bottom:8px' }, ['trace', 'guided', 'free'].map(mm => h('span', { class: 'pill' + (mm === mode ? ' on' : ''), onclick: () => { mode = mm; render(); } }, mm)));
    const pad = makePad({ char: k, mode, onStroke: (n, tot, ok, res, tries) => { fb.className = 'feedback ' + (ok === false ? 'bad' : 'ok'); fb.textContent = ok === false ? (res.reversed ? 'Wrong direction — start at the red dot' : 'Not quite — try that stroke again') : `Stroke ${n} of ${tot}`; }, onDone: res => { fb.className = 'feedback ' + (res.score >= 0.6 ? 'ok' : 'bad'); fb.textContent = res.msg || `Score ${Math.round(res.score * 100)}%`; } });
    main.append(h('div', { class: 'prompt' }, h('div', { class: 'mid jp' }, k, ' ', h('span', { class: 'muted' }, r)), m ? h('div', { class: 'sub small' }, m) : null), modes, pad.el, fb,
      h('div', { class: 'padbar', style: 'margin-top:8px' }, h('button', { class: 'btn sm', onclick: () => pad.undo() }, 'Undo'), h('button', { class: 'btn sm', onclick: () => pad.reveal() }, 'Show'), mode === 'free' ? h('button', { class: 'btn sm', onclick: () => pad.check() }, 'Check') : null, h('button', { class: 'btn sm primary', onclick: () => pad.reset() }, 'Again')),
      h('h2', {}, 'Stroke order'), animateChar(k));
  };
  render();
}

// ---------- Study session ----------
let session = null;
function study(arg) {
  rollDay(); touchStreak();
  if (arg && arg.builder) { session = { queue: [], builderTier: arg.builder, i: 0, done: 0 }; setTitle('Sentence builder', h('button', { class: 'btn sm', onclick: () => go('sent') }, 'Exit')); return builderDrill(arg.builder); }
  const due = dueCards(); const nb = newCards(newBudget());
  session = { queue: [...due, ...nb], done: 0, total: due.length + nb.length, reintro: new Set() };
  setTitle('Study', h('button', { class: 'btn sm', onclick: () => go('home') }, 'Exit'));
  nextCard();
}
function nextCard() {
  rollDay();
  // learning cards that came due during the session
  const learnDue = dueCards().filter(id => !session.queue.includes(id));
  session.queue.push(...learnDue);
  if (!session.queue.length) { // learning cards due within 20 min: wait for them (spacing matters), or skip ahead
    const soon = dueCards(20 * MIN);
    if (soon.length) { if (!session.skipWait) return waitScreen(soon); session.queue.push(...soon); }
  }
  if (!session.queue.length) { refreshUnlocks(); return sessionDone(); }
  const id = session.queue.shift(); const c = CARDS[id]; const st = cs(id);
  main.innerHTML = '';
  const bar = h('div', { class: 'progress' }, h('i', { style: `width:${Math.min(100, 100 * session.done / Math.max(1, session.done + session.queue.length + 1))}%` }));
  main.append(bar);
  const isNew = st.s === 'new';
  if (isNew && st.reps === 0) { S.day.n++; save(); }
  const finish = g => { grade(id, g); session.done++; nextCard(); };
  const box = h('div', { class: 'card' }); main.append(box);
  if (c.kind === 'kr') isNew ? introKana(box, c, () => quizKana(box, c, finish)) : quizKana(box, c, finish);
  else if (c.kind === 'kw') writeKana(box, c, finish, isNew);
  else if (c.kind === 'v' || c.kind === 'ph') flipCard(box, c, finish, isNew);
  else if (c.kind === 'p') (isNew ? introPattern : (st.reps >= 2 && Math.random() < 0.7 ? builderCard : flipPattern))(box, c, finish);
}
function waitScreen(soon) {
  main.innerHTML = ''; const t = h('div', { class: 'mid' }); let timer;
  const tick = () => { const d = S.cards[soon[0]].due - now(); if (d <= 0) { clearInterval(timer); session.queue.push(...dueCards()); return nextCard(); } const sec = Math.ceil(d / 1000); t.textContent = Math.floor(sec / 60) + ':' + String(sec % 60).padStart(2, '0'); };
  timer = setInterval(tick, 500); session.timer = timer; tick();
  main.append(h('div', { class: 'card prompt' }, h('div', { class: 'tag' }, `${soon.length} card${soon.length > 1 ? 's' : ''} still in learning`), h('p', { class: 'muted small' }, 'Short gaps before re-testing make the memory stick. Next card in'), t,
    h('button', { class: 'btn primary wide', style: 'margin-top:12px', onclick: () => { clearInterval(timer); session.skipWait = true; session.queue.push(...dueCards(20 * MIN)); nextCard(); } }, 'Show now'),
    h('button', { class: 'btn wide', style: 'margin-top:8px', onclick: () => { clearInterval(timer); refreshUnlocks(); sessionDone(); } }, 'End session')));
}
function sessionDone() {
  main.innerHTML = ''; const cu = currentUnit();
  main.append(h('div', { class: 'card prompt' }, h('div', { class: 'mid' }, 'Done'), h('p', {}, `This session: ${session.done} cards. Today: ${S.day.rev}.`),
    cu ? h('p', { class: 'muted small' }, 'Next up: ' + cu.name) : null,
    h('button', { class: 'btn primary wide', onclick: () => go('home') }, 'Home'),
    newCards(999).length ? h('button', { class: 'btn wide', style: 'margin-top:8px', onclick: () => { S.settings.newPerDay += 5; save(); go('study'); } }, 'Learn 5 more new cards') : null));
}
const gradeBar = (finish, ivls) => h('div', { class: 'grades' }, [['Again', 'g0'], ['Hard', 'g1'], ['Good', 'g2'], ['Easy', 'g3']].map(([t, cls], i) => h('button', { class: cls, onclick: () => finish(i) }, t, h('small', {}, ivls ? ivls[i] : ''))));
function previewIvls(id) { const c = cs(id); const f = i => { const cp = JSON.parse(JSON.stringify(c)); const save0 = S.cards[id]; S.cards[id] = cp; const day0 = S.day.rev, log0 = S.log[todayKey()]; const ls = localStorage.setItem; localStorage.setItem = () => { }; grade(id, i); localStorage.setItem = ls; const d = cp.due - now(); S.cards[id] = save0; S.day.rev = day0; S.log[todayKey()] = log0; return d < MIN * 59 ? Math.round(d / MIN) + 'm' : d < DAY ? Math.round(d / 3600000) + 'h' : Math.round(d / DAY) + 'd'; }; return [0, 1, 2, 3].map(f); }

// -- kana intro
function introKana(box, c, next) {
  const hasStrokes = !!STROKES[c.k];
  box.append(h('div', { class: 'tag' }, 'New ' + (c.script === 'h' ? 'hiragana' : 'katakana')),
    h('div', { class: 'prompt' }, h('div', { class: 'big jp' }, c.k), h('div', { class: 'mid' }, c.r), speakBtn(c.k)),
    c.m ? h('div', { class: 'mnem' }, c.m) : null,
    hasStrokes ? h('div', { style: 'margin-top:10px' }, h('div', { class: 'tag' }, 'Stroke order (tap to replay)'), animateChar(c.k)) : null,
    h('button', { class: 'btn primary wide', style: 'margin-top:12px', onclick: () => { box.innerHTML = ''; next(); } }, 'Got it'));
  setTimeout(() => speak(c.k), 300);
}
function kanaPool(c) { return (c.script === 'h' ? D.H : D.K).flatMap(L => L.kana).filter(([k]) => k !== c.k && k !== 'ー'); }
function quizKana(box, c, finish) {
  const st = cs(c.id); const reverse = st.reps % 2 === 1; // show romaji, pick kana
  const pool = kanaPool(c);
  // prefer confusable distractors: same row/vowel or visually similar
  const sim = pool.filter(([k, r]) => r[0] === c.r[0] || r.slice(-1) === c.r.slice(-1));
  const opts = shuffle([...shuffle(sim).slice(0, 3), ...shuffle(pool.filter(x => !sim.includes(x))).slice(0, 5)].slice(0, 5).concat([[c.k, c.r]]));
  let answered = false;
  const choices = h('div', { class: 'choices' + (reverse ? ' jp' : '') }, opts.map(([k, r]) => h('button', { class: reverse ? 'jp' : '', onclick: e => {
    if (answered) return; answered = true; const ok = k === c.k;
    e.currentTarget.classList.add(ok ? 'ok' : 'bad'); if (!ok) [...choices.children].find(b => b.dataset.k === c.k).classList.add('ok');
    speak(c.k);
    box.append(h('div', { class: 'answer' }, h('div', { class: 'mid jp' }, c.k, ' ', h('span', { class: 'muted', style: 'font-size:20px' }, c.r)), c.m && !ok ? h('div', { class: 'mnem' }, c.m) : null,
      ok ? h('button', { class: 'btn primary wide', style: 'margin-top:10px', onclick: () => finish(st.s === 'rev' ? 2 : 2) }, 'Next') : h('button', { class: 'btn wide', style: 'margin-top:10px', onclick: () => finish(0) }, 'Next (again)')));
    if (ok && st.s === 'rev') { box.lastChild.replaceChildren(h('div', { class: 'mid jp' }, c.k, ' ', h('span', { class: 'muted', style: 'font-size:20px' }, c.r)), h('div', { class: 'small muted', style: 'margin-top:6px' }, 'How hard was that?'), gradeBar(finish, previewIvls(c.id))); }
  }, 'data-k': k }, reverse ? k : r)));
  box.append(h('div', { class: 'tag' }, reverse ? 'Which kana?' : 'How is it read?'), h('div', { class: 'prompt' }, reverse ? h('div', { class: 'mid' }, c.r) : h('div', { class: 'big jp' }, c.k)), choices);
}
// -- kana writing
function writeKana(box, c, finish, isNew) {
  const st = cs(c.id); const mode = isNew || st.reps < 2 ? 'trace' : (st.s !== 'rev' || st.ivl < 4) ? 'guided' : 'free';
  const fb = h('div', { class: 'feedback' }); let retries = 0;
  const pad = makePad({ char: c.k, mode,
    onStroke: (n, tot, ok, res, tries) => { if (ok === false) { retries++; fb.className = 'feedback bad'; fb.textContent = res.reversed ? 'Wrong direction — start at the red dot' : 'Not quite — try that stroke again'; if (tries >= 3) pad.reveal(); } else { fb.className = 'feedback ok'; fb.textContent = `Stroke ${n} of ${tot}`; } },
    onDone: res => {
      const s = res.score * (retries ? Math.max(0.5, 1 - retries * 0.12) : 1);
      const g = res.msg ? 0 : s >= 0.75 ? 2 : s >= 0.5 ? 1 : 0;
      fb.className = 'feedback ' + (g ? 'ok' : 'bad'); fb.textContent = res.msg || `Score ${Math.round(res.score * 100)}%` + (retries ? ` · ${retries} retries` : '');
      speak(c.k);
      bar.replaceChildren(h('div', { class: 'small muted', style: 'text-align:center;margin-top:4px' }, 'Auto-graded as ' + ['Again', 'Hard', 'Good', 'Easy'][g] + ' — adjust if needed'), gradeBar(finish, previewIvls(c.id)));
    } });
  const bar = h('div', { class: 'padbar', style: 'margin-top:8px' }, h('button', { class: 'btn sm', onclick: () => pad.undo() }, 'Undo'), h('button', { class: 'btn sm', onclick: () => { pad.reveal(); retries += 2; } }, 'Hint'), mode === 'free' ? h('button', { class: 'btn sm primary', onclick: () => pad.check() }, 'Check') : null, h('button', { class: 'btn sm', onclick: () => { retries++; pad.reset(); } }, 'Clear'));
  box.append(h('div', { class: 'tag' }, { trace: 'Trace the character', guided: 'Write it — faint guide', free: 'Write it from memory' }[mode]),
    h('div', { class: 'prompt', style: 'padding:4px 0' }, h('div', { class: 'mid' }, c.r, ' ', speakBtn(c.k)), c.m && mode !== 'free' ? h('div', { class: 'sub small' }, c.m) : null),
    pad.el, fb, bar);
}
// -- flip cards (vocab / phrases)
function flipCard(box, c, finish, isNew) {
  const st = cs(c.id); const toJp = !isNew && st.reps % 2 === 1; // en → jp
  const front = toJp ? h('div', { class: 'mid' }, c.en) : h('div', { class: 'mid jp' }, c.jp);
  const back = h('div', { class: 'answer' }, h('div', { class: 'mid jp' }, c.jp), S.settings.romaji ? h('div', { class: 'muted' }, c.ro) : null, h('div', {}, c.en), c.type ? h('div', { class: 'small muted' }, c.type) : null, speakBtn(c.jp));
  const reveal = h('button', { class: 'btn primary wide', style: 'margin-top:12px', onclick: () => { reveal.replaceWith(back, gradeBar(finish, previewIvls(c.id))); speak(c.jp); } }, 'Show answer');
  box.append(h('div', { class: 'tag' }, isNew ? 'New ' + (c.kind === 'ph' ? 'phrase' : 'word') : c.kind === 'ph' ? 'Phrase' : 'Word'), h('div', { class: 'prompt' }, front, !toJp ? speakBtn(c.jp) : null), reveal);
  if (!toJp) setTimeout(() => speak(c.jp), 200);
}
// -- patterns
function introPattern(box, c, finish) {
  box.append(h('div', { class: 'tag' }, 'New pattern'), h('div', { class: 'prompt' }, h('div', { class: 'mid jp' }, c.jp), S.settings.romaji ? h('div', { class: 'muted' }, c.ro) : null, h('div', {}, c.en)),
    h('div', { class: 'mnem' }, c.note),
    c.ex ? h('div', { class: 'answer' }, h('div', { class: 'tag' }, 'Example'), h('div', { class: 'jp', style: 'font-size:24px' }, fill(c, c.ex, c.ex2)), S.settings.romaji ? h('div', { class: 'muted small' }, fillRo(c, c.ex, c.ex2)) : null, h('div', {}, fillEn(c, c.ex, c.ex2)), speakBtn(fill(c, c.ex, c.ex2))) : null,
    h('button', { class: 'btn primary wide', style: 'margin-top:12px', onclick: () => finish(2) }, 'Got it'));
  setTimeout(() => speak(fill(c, c.ex, c.ex2)), 300);
}
function pickFill(c) { const mt = maxTier(); const ok = t => VOCAB.filter(v => t.includes(v.type) && v.tier <= mt); const xs = ok(c.slot), ys = c.slot2 ? ok(c.slot2) : []; const x = xs.length ? rnd(xs).id : c.ex; let y = null; if (c.slot2) { const yy = ys.filter(v => v.id !== x); y = yy.length ? rnd(yy).id : c.ex2; } return { x, y }; }
function flipPattern(box, c, finish) {
  const { x, y } = c.slot.length ? pickFill(c) : {};
  const jp = fill(c, x, y), en = fillEn(c, x, y);
  const back = h('div', { class: 'answer' }, h('div', { class: 'mid jp' }, jp), S.settings.romaji ? h('div', { class: 'muted' }, fillRo(c, x, y)) : null, h('div', { class: 'small muted' }, c.note), speakBtn(jp));
  const reveal = h('button', { class: 'btn primary wide', style: 'margin-top:12px', onclick: () => { reveal.replaceWith(back, gradeBar(finish, previewIvls(c.id))); speak(jp); } }, 'Show answer');
  box.append(h('div', { class: 'tag' }, 'Say it in Japanese'), h('div', { class: 'prompt' }, h('div', { class: 'mid' }, en)), reveal);
}
const DISTRACT = ['は', 'が', 'を', 'に', 'で', 'と', 'の', 'も', 'か', 'です', 'ます', 'ません', 'でした', 'ください', 'これ', 'それ', 'わたし', 'なに', 'いつ'];
function builderCard(box, c, finish, standalone) {
  const { x, y } = c.slot.length ? pickFill(c) : {};
  const jp = fill(c, x, y), en = fillEn(c, x, y);
  const target = jp.replace(/[。？]/g, '').split(/\s+/).filter(Boolean);
  const pool = shuffle([...target, ...shuffle(DISTRACT.filter(d => !target.includes(d))).slice(0, 2)]);
  const chosen = [];
  const ans = h('div', { class: 'tiles' }), poolEl = h('div', { class: 'tiles pool' }), fb = h('div', { class: 'feedback' });
  const render = () => {
    ans.replaceChildren(...chosen.map((t, i) => h('span', { class: 'tile jp', onclick: () => { chosen.splice(i, 1); render(); } }, t.w)));
    poolEl.replaceChildren(...pool.map((w, i) => chosen.some(t => t.i === i) ? h('span', { class: 'tile jp', style: 'opacity:.25' }, w) : h('span', { class: 'tile jp', onclick: () => { chosen.push({ w, i }); render(); } }, w)));
  };
  render();
  const check = h('button', { class: 'btn primary wide', onclick: () => {
    const got = chosen.map(t => t.w); const ok = got.join(' ') === target.join(' ');
    [...ans.children].forEach((el, i) => el.classList.add(got[i] === target[i] ? 'ok' : 'bad'));
    fb.className = 'feedback ' + (ok ? 'ok' : 'bad'); fb.textContent = ok ? 'Correct' : 'Not quite';
    speak(jp);
    check.replaceWith(h('div', { class: 'answer' }, h('div', { class: 'mid jp' }, jp), S.settings.romaji ? h('div', { class: 'muted' }, fillRo(c, x, y)) : null, h('div', { class: 'small muted' }, c.note),
      standalone ? h('button', { class: 'btn primary wide', style: 'margin-top:10px', onclick: () => finish(ok ? 2 : 0) }, 'Next')
        : ok ? h('div', {}, h('div', { class: 'small muted', style: 'text-align:center;margin-top:6px' }, 'How hard was that?'), gradeBar(finish, previewIvls(c.id))) : h('button', { class: 'btn wide', style: 'margin-top:10px', onclick: () => finish(0) }, 'Next (again)')));
  } }, 'Check');
  box.append(h('div', { class: 'tag' }, 'Build the sentence'), h('div', { class: 'prompt', style: 'padding:6px 0' }, h('div', { class: 'mid', style: 'font-size:24px' }, en)), ans, poolEl, fb, check);
}
function builderDrill(tier) {
  const ps = D.PATTERNS.filter(p => p.tier <= tier && p.slot.length).map(p => CARDS['p:' + p.id]);
  const step = () => { main.innerHTML = ''; const box = h('div', { class: 'card' }); main.append(h('div', { class: 'small muted', style: 'margin-bottom:6px' }, 'Drill · no effect on schedule'), box); builderCard(box, rnd(ps), () => step(), true); };
  step();
}

// ---------- Service worker ----------
const APP_VERSION = '1.0.0';
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').then(reg => {
    reg.addEventListener('updatefound', () => { const w = reg.installing; w && w.addEventListener('statechange', () => { if (w.state === 'installed' && navigator.serviceWorker.controller) toast('Update ready — reopen the app'); }); });
  }).catch(() => { });
}
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferredPrompt = e; go(view); });

go('home');
})();
