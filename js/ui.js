/* ===== Nibble: UI primitives (DOM helpers, sheet, toast, formatting) ===== */
'use strict';

/* ---------- tiny DOM helpers ---------- */
function $(sel, root) { return (root || document).querySelector(sel); }
function $all(sel, root) { return Array.from((root || document).querySelectorAll(sel)); }

function append(node, kids) {
  if (kids == null || kids === false || kids === true) return;
  if (Array.isArray(kids)) { kids.forEach(k => append(node, k)); return; }
  if (kids instanceof Node) { node.appendChild(kids); return; }
  node.appendChild(document.createTextNode(String(kids)));
}

/* el('div', {class:'x', onClick:fn, style:{...}, text:'hi'}, [children]) */
function el(tag, props, kids) {
  const n = document.createElement(tag);
  if (props) {
    for (const [k, v] of Object.entries(props)) {
      if (v == null || v === false) continue;
      if (k === 'class') n.className = v;
      else if (k === 'text') n.textContent = v;
      else if (k === 'html') n.innerHTML = v;
      else if (k === 'value') n.value = v;
      else if (k === 'checked') n.checked = !!v;
      else if (k === 'style' && typeof v === 'object') Object.assign(n.style, v);
      else if (k === 'dataset' && typeof v === 'object') Object.assign(n.dataset, v);
      else if (k.startsWith('on') && typeof v === 'function') n.addEventListener(k.slice(2).toLowerCase(), v);
      else n.setAttribute(k, v);
    }
  }
  if (kids != null) append(n, kids);
  return n;
}
function clear(node) { while (node && node.firstChild) node.removeChild(node.firstChild); }

/* ---------- number / nutrient formatting ---------- */
function nVal(key, value) {
  if (value == null || !isFinite(value)) return '0';
  if (key === 'kcal') return String(Math.round(value));
  const a = Math.abs(value);
  const d = a >= 10 ? 0 : a >= 1 ? 1 : 2;
  let s = value.toFixed(d);
  if (s.indexOf('.') >= 0) s = s.replace(/0+$/, '').replace(/\.$/, '');
  return s;
}
function unitOf(key) { return (NUTR_BY_KEY[key] || {}).unit || ''; }
function labelOf(key) { return (NUTR_BY_KEY[key] || {}).label || key; }

/* "240 kcal" or "3.2 g" */
function valWithUnit(key, value) {
  const u = unitOf(key);
  return nVal(key, value) + (u === 'kcal' ? ' kcal' : ' ' + u);
}

/* ---------- toast ---------- */
let _toastTimer = null;
function toast(msg, ms) {
  const t = $('#toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => t.classList.remove('show'), ms || 1900);
}

/* ---------- bottom sheet ---------- */
let _sheetOnClose = null;
let _sheetDismissable = true;

function openSheet(content, opts) {
  opts = opts || {};
  const c = $('#sheetContent');
  clear(c);
  let body = (typeof content === 'function') ? content() : content;
  append(c, body);
  $('#sheet').classList.add('show');
  $('#sheetBg').classList.add('show');
  _sheetOnClose = opts.onClose || null;
  _sheetDismissable = opts.dismissable !== false;
  c.scrollTop = 0;
}
function closeSheet() {
  $('#sheet').classList.remove('show');
  $('#sheetBg').classList.remove('show');
  const cb = _sheetOnClose;
  _sheetOnClose = null;
  if (typeof cb === 'function') cb();
}
/* wire backdrop tap (elements exist: this script runs at end of body) */
(function wireSheet() {
  const bg = $('#sheetBg');
  if (bg) bg.addEventListener('click', () => { if (_sheetDismissable) closeSheet(); });
})();

/* standard sheet header: emoji (optional) + title + close X */
function sheetHead(title, emoji) {
  return el('div', { class: 'sheet-head' }, [
    emoji ? el('div', { class: 'e' }, emoji) : null,
    el('div', { class: 'nm' }, title),
    el('button', { class: 'x', 'aria-label': 'Close', onClick: closeSheet }, '\u00d7'),
  ]);
}
/* wrap body content in the padded scroll region */
function sheetBody(kids) { return el('div', { class: 'sheet-body' }, kids); }

/* ---------- confirm dialog (as a sheet) ---------- */
function confirmSheet(opts) {
  opts = opts || {};
  const ok = () => { closeSheet(); if (opts.onOk) opts.onOk(); };
  openSheet([
    sheetHead(opts.title || 'Are you sure?'),
    sheetBody([
      opts.body ? el('p', { class: 'muted', style: { marginTop: '0' } }, opts.body) : null,
      el('button', { class: 'btn' + (opts.danger ? ' danger' : ''), onClick: ok }, opts.okLabel || 'Confirm'),
      el('button', { class: 'btn ghost', style: { marginTop: '8px' }, onClick: closeSheet }, opts.cancelLabel || 'Cancel'),
    ]),
  ]);
}

/* ---------- emoji picker widget ----------
   returns { node, get() }  — node is a grid; get() returns the chosen emoji. */
function emojiPicker(current) {
  let chosen = current || EMOJI_LIB[0];
  const grid = el('div', { class: 'emoji-pick' });
  const buttons = [];
  EMOJI_LIB.forEach(em => {
    const b = el('button', {
      type: 'button',
      class: em === chosen ? 'sel' : '',
      onClick: () => { chosen = em; buttons.forEach(x => x.classList.toggle('sel', x.textContent === chosen)); },
    }, em);
    buttons.push(b);
    grid.appendChild(b);
  });
  return { node: grid, get: () => chosen };
}

/* ---------- labelled field helpers ---------- */
function field(labelText, control, hint) {
  return el('div', { class: 'field' }, [
    labelText ? el('label', null, labelText) : null,
    control,
    hint ? el('div', { class: 'hint' }, hint) : null,
  ]);
}
function textInput(props) { return el('input', Object.assign({ type: 'text' }, props || {})); }
function numInput(props) { return el('input', Object.assign({ type: 'number', inputmode: 'decimal' }, props || {})); }

/* parse a user-entered number; returns fallback when blank/invalid */
function parseNum(str, fallback) {
  if (str == null) return fallback;
  const v = Number(String(str).trim().replace(',', '.'));
  return Number.isFinite(v) ? v : fallback;
}
