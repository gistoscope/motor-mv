// Engine-Stub for S6.3 — hover classification + click-paren gating.
// Policy:
// - classify 'paren': ok if removing outer pair does not expose + or - at top level inside;
//   else 'noop' (viewer may show purple).
// - classify 'num': 'noop' (no action yet).
// - click-paren: if allowed by same rule → patch:{unwrap}.

function unwrapAllowed(text, open, close){
  let depth = 0;
  for (let i=open+1; i<close; i++){
    const ch = text[i];
    if (ch === '(') depth++;
    else if (ch === ')') depth--;
    else if (depth === 0 && (ch === '+' || ch === '-' || ch === '−')){
      return false;
    }
  }
  return true;
}

export const engineStub = {
  classify(msg){
    // msg: { role:'paren'|'num', text, pair? }
    if (msg.role === 'num') return { ok:true, status:'noop' };
    if (msg.role === 'paren'){
      const { open, close } = msg.pair;
      const ok = unwrapAllowed(msg.text, open, close);
      return { ok:true, status: ok ? 'ok' : 'noop' };
    }
    return { ok:true, status:'noop' };
  },
  request(msg){
    if (msg.type === 'click-paren'){
      const { open, close } = msg.pair;
      if (unwrapAllowed(msg.text, open, close)){
        return { ok:true, action:'patch', patches:[{ type:'unwrap', open, close }] };
      }
      return { ok:false, error:'unwrap-denied' };
    }
    if (msg.type === 'wrap'){
      const { start, end } = msg.range;
      return { ok:true, action:'patch', patches:[{ type:'wrap', start, end }] };
    }
    return { ok:true, action:'noop' };
  }
};
