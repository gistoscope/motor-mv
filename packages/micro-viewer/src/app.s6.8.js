// packages/micro-viewer/src/app.s6.8.js
const $ = (s, r=document) => r.querySelector(s);

let expr = '(1+(2*3))/((4+5)*(6-2/3))';

function computePairs(e){
  const stack=[]; const out=[];
  for (let i=0;i<e.length;i++){
    const ch=e[i];
    if (ch==='(') stack.push(i);
    else if (ch===')'){ const open=stack.pop(); if (open!=null) out.push({open, close:i, pid:out.length}); }
  }
  return out;
}
function spanParen(info, role){
  const sp = document.createElement('span');
  sp.className = 'paren';
  sp.dataset.pid = String(info.pid);
  sp.dataset.role = role;
  sp.dataset.open = String(info.open);
  sp.dataset.close = String(info.close);
  sp.textContent = role==='open'?'(' : ')';
  return sp;
}
function rerender(){
  const display = $('#display');
  if (!display) return;
  display.textContent = '';
  const pairs = computePairs(expr);
  const map = new Map();
  for (const p of pairs){ map.set(p.open,p); map.set(p.close,p); }
  const frag = document.createDocumentFragment();
  for (let i=0;i<expr.length;i++){
    const ch = expr[i];
    const info = map.get(i);
    if (ch==='(' && info) frag.appendChild(spanParen(info,'open'));
    else if (ch===')' && info) frag.appendChild(spanParen(info,'close'));
    else frag.appendChild(document.createTextNode(ch));
  }
  display.appendChild(frag);
}

function applyOptions(opts){
  const root = document && document.documentElement;
  if (!root) return;
  root.setAttribute('data-theme', opts.theme);
  root.setAttribute('data-density', opts.density); // density via attribute
  root.style.setProperty('--mv-font-scale', String(opts.scale));
  const scaleVal = $('#opt-scale-val'); if (scaleVal) scaleVal.textContent = opts.scale.toFixed(2);
}

function mount(){
  const input = $('#input'); const display = $('#display');
  if (input){ input.value = expr; let t=0; input.addEventListener('input', ()=>{ clearTimeout(t); t=setTimeout(()=>{ expr=String(input.value||''); rerender(); }, 200); }); }
  // Options
  const theme = $('#opt-theme'); const density = $('#opt-density'); const scale = $('#opt-scale');
  const opts = { theme: (theme&&theme.value)||'light', density: (density&&density.value)||'comfortable', scale: Number((scale&&scale.value)||1) };
  applyOptions(opts);
  theme && theme.addEventListener('change', ()=>{ opts.theme = theme.value; applyOptions(opts); });
  density && density.addEventListener('change', ()=>{ opts.density = density.value; applyOptions(opts); });
  scale && scale.addEventListener('input', ()=>{ const v=Number(scale.value||1); opts.scale=v; applyOptions(opts); });

  rerender();
}

document.addEventListener('DOMContentLoaded', mount);
