'use strict';
// Micro Viewer S6.3 -- hover(engine) + click action
// fixG: Robust left/right paren click using elementFromPoint;
//       Do NOT re-render on pointerup when selection is zero-length;
//       ASCII-only. Build marker:
window.S63_BUILD = 's6.3-hover-fixG';
console.log('[S6.3] build:', window.S63_BUILD);

import { debounce } from './util.debounce.js';
import { engineStub } from './engine.stub.s63.js';

const container = document.getElementById('mv-container');
const fmtSel = document.getElementById('mv-format');
const inputEl = document.getElementById('mv-input');
const menu = document.getElementById('mv-menu');

if (container) container.style.userSelect = 'none';

let expr = '(1 + (2 * 3)) / ((4 + 5) * (6 - 2/3))';
let sel = null; // {start, end}
let pairs = [];
let dragging = false;
let dragStart = null;
let lastPid = null;

function escapeHtml(s){
  return s.replace(/[&<>]/g, function(c){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]);
  });
}

function computePairs(text){
  const st = [], out = [];
  for (let i=0;i<text.length;i++){
    const ch = text[i];
    if (ch === '(') st.push(i);
    else if (ch === ')'){
      const open = st.pop();
      if (open !== undefined) out.push({ open: open, close: i, id: out.length });
    }
  }
  out.sort(function(a,b){ return a.open - b.open; });
  return out;
}

function render(){
  pairs = computePairs(expr);
  let html = '';
  for (let i=0;i<expr.length;i++){
    const ch = expr[i];
    const pair = (ch==='(' || ch===')') ? pairs.find(function(p){ return (p.open===i || p.close===i); }) : null;
    const classes = ['ch'];
    if (pair) classes.push('paren');
    const attrs = ['data-idx="'+i+'"'];
    if (pair) attrs.push('data-pid="'+pair.id+'"');
    html += '<span class="'+classes.join(' ')+'" '+attrs.join(' ')+'>'+escapeHtml(ch)+'</span>';
  }
  container.innerHTML = html;

  // Paint selection
  if (sel && sel.start < sel.end){
    for (let j=sel.start; j<sel.end; j++){
      const n = container.querySelector('.ch[data-idx="'+j+'"]');
      if (n) n.classList.add('sel');
    }
  }
}

function clearMenu(){ if (menu) menu.hidden = true; }
function openMenuXY(x,y){ if (!menu) return; menu.style.left = x + 'px'; menu.style.top = y + 'px'; menu.hidden = false; }
function idxFromEvent(e){
  const node = e.target.closest('.ch');
  if (!node) return null;
  const i = Number(node.dataset.idx);
  return Number.isFinite(i) ? i : null;
}
function normalizeSel(a,b){
  if (a==null || b==null) return null;
  if (a===b) return null;
  return a<b ? {start:a, end:b} : {start:b, end:a};
}
function applySelectionPreview(a,b){
  container.querySelectorAll('.sel').forEach(function(n){ n.classList.remove('sel'); });
  const s = normalizeSel(a,b);
  if (!s) return;
  for (let i=s.start; i<s.end; i++){
    const n = container.querySelector('.ch[data-idx="'+i+'"]');
    if (n) n.classList.add('sel');
  }
}

// Toolbar
['undo','redo','reset','help'].forEach(function(name){
  const btn = document.getElementById('mv-'+name);
  if (!btn) return;
  btn.addEventListener('click', function(){
    if (name === 'reset'){ expr = inputEl.value = '(1 + (2 * 3)) / ((4 + 5) * (6 - 2/3))'; sel = null; render(); }
    console.log(name+' clicked');
  });
});

// Input
inputEl.value = expr;
fmtSel.addEventListener('change', function(){ console.log('Intent ->', {type:'input-format', format: fmtSel.value}); });
inputEl.addEventListener('input', debounce(function(){
  const payload = { type:'input-changed', format: fmtSel.value, text: inputEl.value };
  console.log('Intent ->', payload);
  expr = inputEl.value; sel = null; render();
}, 200));

// Selection (left button only)
container.addEventListener('pointerdown', function(e){
  clearMenu();
  if (e.button !== 0) return;
  const idx = idxFromEvent(e);
  if (idx == null) { dragging = false; return; }
  dragging = true;
  dragStart = idx;
  sel = null;
  applySelectionPreview(dragStart, dragStart);
});
container.addEventListener('pointermove', function(e){
  if (!dragging) return;
  const node = e.target.closest('.ch');
  if (!node) return;
  const idx = Number(node.dataset.idx);
  if (!Number.isFinite(idx)) return;
  applySelectionPreview(dragStart, idx);
});
container.addEventListener('pointerup', function(e){
  if (e.button !== 0) return;
  if (!dragging) return;
  const node = e.target.closest('.ch');
  const idx = node ? Number(node.dataset.idx) : null;
  dragging = false;
  const committed = normalizeSel(dragStart, idx);
  sel = committed;
  if (sel) { render(); console.log('Intent ->', { type:'select-range', from: sel.start, to: sel.end }); }
});

// Outside click clears selection/menu
document.addEventListener('pointerdown', function(e){
  if (!container.contains(e.target) && (!menu || !menu.contains(e.target))){
    sel = null; clearMenu(); render();
  }
});

// Context menu only when selection exists
function openMenuFromEvent(e){
  if (!sel || sel.start === sel.end) return;
  render();
  openMenuXY(e.clientX, e.clientY);
  console.log('Intent ->', {type:'contextmenu', at:{x:e.clientX,y:e.clientY}, range: sel});
}
container.addEventListener('pointerup', function(e){ if (e.button===2){ e.preventDefault(); openMenuFromEvent(e);} });
container.addEventListener('contextmenu', function(e){ e.preventDefault(); openMenuFromEvent(e); });
document.addEventListener('contextmenu', function(e){
  if (!container.contains(e.target)) return;
  e.preventDefault(); openMenuFromEvent(e);
});
document.addEventListener('click', function(e){ if (!menu.contains(e.target)) clearMenu(); });

// Hover -> classification
let hoverTimer = 0;
function classifyAndPaint(pid){
  container.querySelectorAll('.mark-ok,.mark-blocked,.mark-noop')
    .forEach(function(n){ n.classList.remove('mark-ok','mark-blocked','mark-noop'); });
  lastPid = pid;
  if (pid == null) return;
  const pair = pairs.find(function(p){ return p.id===pid; }); if (!pair) return;
  const res = engineStub.classify({ role:'paren', pair: pair, text: expr });
  const nodes = container.querySelectorAll('.paren[data-pid="'+pid+'"]');
  const cls = res.status === 'ok' ? 'mark-ok' : (res.status === 'blocked' ? 'mark-blocked' : 'mark-noop');
  nodes.forEach(function(n){ n.classList.add(cls); });
}
container.addEventListener('mousemove', function(e){
  const node = e.target.closest('.paren');
  const pid = node ? Number(node.dataset.pid) : null;
  clearTimeout(hoverTimer);
  hoverTimer = setTimeout(function(){ classifyAndPaint(pid); }, 40);
});

// Click unwrap using elementFromPoint + lastPid fallback
container.addEventListener('click', function(e){
  if (e.button !== 0) return;
  let el = document.elementFromPoint(e.clientX, e.clientY);
  el = el ? el.closest('.paren') : null;
  let pid = el ? Number(el.dataset.pid) : null;
  if (pid == null && lastPid != null) pid = lastPid;
  if (pid == null) return;

  const pair = pairs.find(function(p){ return p.id===pid; }); if (!pair) return;
  const res = engineStub.classify({ role:'paren', pair: pair, text: expr });
  if (res.status === 'ok'){
    const resp = engineStub.request({ type:'click-paren', pair: pair, text: expr });
    if (resp.ok && resp.patches && resp.patches[0] && resp.patches[0].type==='unwrap'){
      const open = resp.patches[0].open;
      const close = resp.patches[0].close;
      expr = expr.slice(0,close) + expr.slice(close+1);
      expr = expr.slice(0,open) + expr.slice(open+1);
      sel = null; render(); inputEl.value = expr;
      setTimeout(function(){
        let el2 = document.elementFromPoint(e.clientX, e.clientY);
        el2 = el2 ? el2.closest('.paren') : null;
        const pid2 = el2 ? Number(el2.dataset.pid) : null;
        classifyAndPaint(pid2!=null ? pid2 : null);
      }, 0);
    } else {
      console.log('Engine denied unwrap or no patch', resp);
    }
  } else {
    const nodes = container.querySelectorAll('.paren[data-pid="'+pid+'"]');
    nodes.forEach(function(n){
      n.style.transition='outline-width .15s ease';
      n.style.outlineWidth='4px';
      setTimeout(function(){ n.style.outlineWidth='3px'; }, 160);
    });
  }
});

render();
