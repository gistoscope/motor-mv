// Micro Viewer S6.2 — robust context menu (fix3).
// - Preserves last selection
// - Opens menu on right-click via 'contextmenu' on both container and document (inside container)
// - Also opens on pointerup(button===2)
// - Never clears selection on simple clicks
// - Build marker for verification
window.S62_BUILD = 's6.2-fix3';
console.log('[S6.2] build:', window.S62_BUILD);

import { debounce } from './util.debounce.js';
import { engineStub } from './engine.stub.s62.js';

const container = document.getElementById('mv-container');
const fmtSel = document.getElementById('mv-format');
const inputEl = document.getElementById('mv-input');
const menu = document.getElementById('mv-menu');

let expr = '(1 + (2 × 3)) ÷ ((4 + 5) × (6 − 2/3))';
let sel = null; // {start, end}

function escapeHtml(s){ return s.replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c])); }
function render(){
  if (!sel) {
    container.innerHTML = escapeHtml(expr);
  } else {
    const a = Math.min(sel.start, sel.end);
    const b = Math.max(sel.start, sel.end);
    container.innerHTML = escapeHtml(expr.slice(0,a)) + '<span class="sel">' + escapeHtml(expr.slice(a,b)) + '</span>' + escapeHtml(expr.slice(b));
  }
}
function clearMenu(){ menu.hidden = true; }
function openMenuXY(x,y){ menu.style.left = x + 'px'; menu.style.top = y + 'px'; menu.hidden = false; }

function getOffsetsFromSelection(){
  const winSel = window.getSelection();
  if (!winSel || winSel.rangeCount === 0) return null;
  const range = winSel.getRangeAt(0);
  if (!container.contains(range.startContainer) || !container.contains(range.endContainer)) return null;
  let acc = 0, start = null, end = null;
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const node = walker.currentNode;
    const len = node.nodeValue.length;
    if (node === range.startContainer) start = acc + range.startOffset;
    if (node === range.endContainer) end = acc + range.endOffset;
    acc += len;
  }
  if (start === null || end === null || start === end) return null;
  return { start, end };
}

// Toolbar
['undo','redo','reset','help'].forEach(name => {
  const btn = document.getElementById(`mv-${name}`);
  if (!btn) return;
  btn.addEventListener('click', () => {
    if (name === 'reset'){ expr = inputEl.value = '(1 + (2 × 3)) ÷ ((4 + 5) × (6 − 2/3))'; sel = null; render(); }
    console.log(`${name} clicked`);
  });
});

// Input window
inputEl.value = expr;
fmtSel.addEventListener('change', ()=>console.log('Intent →', {type:'input-format', format: fmtSel.value}));
inputEl.addEventListener('input', debounce(()=>{
  const payload = { type:'input-changed', format: fmtSel.value, text: inputEl.value };
  console.log('Intent →', payload);
  expr = inputEl.value; sel = null; render();
}, 200));

// Mouse interactions
container.addEventListener('mousedown', ()=>{ clearMenu(); /* keep selection */ });
container.addEventListener('mouseup', (e)=>{
  const off = getOffsetsFromSelection();
  if (off) {
    sel = off; render();
    console.log('Intent →', {type:'select-range', from: off.start, to: off.end, button: e.button===2?'right':'left'});
  } else {
    render();
  }
});

function openMenuFromEvent(e){
  const off = getOffsetsFromSelection();
  if (off) sel = off;
  if (!sel) return;
  openMenuXY(e.clientX, e.clientY);
  console.log('Intent →', {type:'contextmenu', at:{x:e.clientX,y:e.clientY}, range: sel});
}

// Pointer-based fallback
container.addEventListener('pointerup', (e)=>{
  if (e.button === 2) { e.preventDefault(); openMenuFromEvent(e); }
});

// Primary handler on container
container.addEventListener('contextmenu', (e)=>{
  e.preventDefault();
  openMenuFromEvent(e);
});

// Global fallback (only inside container)
document.addEventListener('contextmenu', (e)=>{
  if (!container.contains(e.target)) return;
  e.preventDefault();
  openMenuFromEvent(e);
});

// Global close menu / clear selection
document.addEventListener('click', (e)=>{ if (!menu.contains(e.target)) clearMenu(); });
document.addEventListener('keydown', (e)=>{ if (e.key === 'Escape'){ clearMenu(); sel = null; render(); } });

menu.addEventListener('click', (e)=>{
  const btn = e.target.closest('button'); if (!btn) return;
  const action = btn.dataset.action; clearMenu();
  if (!sel) return;
  const a = Math.min(sel.start, sel.end), b = Math.max(sel.start, sel.end);
  if (action === 'wrap') {
    const msg = { type:'wrap', range:{start:a,end:b}, text: expr };
    const resp = engineStub.request(msg);
    console.log('EngineStub →', resp);
    if (resp.ok) {
      expr = expr.slice(0,a) + '(' + expr.slice(a,b) + ')' + expr.slice(b);
      sel = null; render(); inputEl.value = expr;
    }
    return;
  }
  if (action === 'unwrap') {
    const msg = { type:'unwrap', range:{start:a,end:b}, text: expr };
    const resp = engineStub.request(msg);
    console.log('EngineStub →', resp);
    if (resp.ok && resp.patches && resp.patches[0] && resp.patches[0].type === 'unwrap') {
      const { cutLeft, cutRight } = resp.patches[0];
      expr = expr.slice(0,cutLeft) + expr.slice(cutLeft+1, cutRight) + expr.slice(cutRight+1);
      sel = null; render(); inputEl.value = expr;
    } else {
      console.log('Unwrap denied', resp && resp.error);
    }
    return;
  }
  if (action === 'explain') {
    console.log('Explain: Viewer defers legality to Engine; S6.2 Stub uses balanced-outer-parens check.');
  }
});

render();
