// Engine-Stub for S6.2 — purely syntactic gating for wrap/unwrap.
function isBalancedOuter(selected){
  // Work on trimmed string
  const leftSpaces = selected.length - selected.trimStart().length;
  const rightSpaces = selected.length - selected.trimEnd().length;
  const trimmed = selected.trim();
  if (!(trimmed.startsWith('(') && trimmed.endsWith(')'))) return { ok:false, reason:'no-outer-parens' };
  let depth = 0;
  for (let i=0;i<trimmed.length;i++){
    const ch = trimmed[i];
    if (ch === '(') depth++;
    else if (ch === ')'){
      depth--;
      if (depth < 0) return { ok:false, reason:'unbalanced' };
    }
  }
  if (depth !== 0) return { ok:false, reason:'unbalanced' };
  return { ok:true, leftSpaces, rightSpaces };
}

export const engineStub = {
  request(msg){
    // msg: { type, range:{start,end}, text }
    if (msg.type === 'wrap'){
      return { ok:true, action:'patch', patches:[{ type:'wrap', range: msg.range }] };
    }
    if (msg.type === 'unwrap'){
      const a = Math.min(msg.range.start, msg.range.end);
      const b = Math.max(msg.range.start, msg.range.end);
      const selected = msg.text.slice(a,b);
      const check = isBalancedOuter(selected);
      if (!check.ok) return { ok:false, error: check.reason };
      // compute cut positions (one pair just inside trim)
      const cutLeft = a + check.leftSpaces;
      const cutRight = b - check.rightSpaces - 1; // index of ')'
      return { ok:true, action:'patch', patches:[{ type:'unwrap', cutLeft, cutRight }] };
    }
    // pass-through for other intents
    return { ok:true, action:'noop' };
  }
};
