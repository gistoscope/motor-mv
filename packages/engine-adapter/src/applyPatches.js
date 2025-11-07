// Minimal patch applier for demo purposes
// Supported ops: replaceRange, wrap, unwrap, cursor (no-op for text)
export function applyPatches(text, patches = []) {
  if (!patches || patches.length === 0) return text
  // Apply in a stable order: for mutations on indices, process right-to-left
  const arr = Array.from(patches)
  // For range-like ops, sort by descending positions to avoid index drift
  arr.sort((a, b) => rightEdge(b) - rightEdge(a))
  let out = text
  for (const p of arr) {
    if (p.op === 'replaceRange') {
      out = out.slice(0, p.from) + (p.text ?? '') + out.slice(p.to)
    } else if (p.op === 'wrap') {
      out = out.slice(0, p.from) + (p.left ?? '(') + out.slice(p.from, p.to) + (p.right ?? ')') + out.slice(p.to)
    } else if (p.op === 'unwrap') {
      const lo = Math.min(p.open, p.close)
      const hi = Math.max(p.open, p.close)
      out = out.slice(0, lo) + out.slice(lo + 1, hi) + out.slice(hi + 1)
    } else if (p.op === 'cursor') {
      // no text change
    }
  }
  return out
}

function rightEdge(p) {
  if (p.op === 'replaceRange') return p.to
  if (p.op === 'wrap') return p.to + 1 // will insert right bracket
  if (p.op === 'unwrap') return Math.max(p.open, p.close)
  return 0
}