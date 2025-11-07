import type { Patch } from "@motor/protocol";

/**
 * Apply patches to a string safely. If multiple range-changing patches exist,
 * we apply them right-to-left to keep indexes stable.
 */
export function applyPatches(text: string, patches: Patch[] = []): string {
  if (!patches || patches.length === 0) return text;

  // Split into index-affecting and non-index-affecting ops
  const nonIndex: Patch[] = [];
  const indexChanging: Patch[] = [];
  for (const p of patches) {
    if (p.op === "cursor") nonIndex.push(p);
    else indexChanging.push(p);
  }

  // Right-to-left by 'from/open' index if present
  indexChanging.sort((a, b) => {
    const ai = (a.op === "unwrap") ? a.open : ("from" in a ? a.from : 0);
    const bi = (b.op === "unwrap") ? b.open : ("from" in b ? b.from : 0);
    return bi - ai;
  });

  let out = text;
  for (const p of indexChanging) {
    switch (p.op) {
      case "replaceRange": {
        out = out.slice(0, p.from) + p.text + out.slice(p.to);
        break;
      }
      case "wrap": {
        out = out.slice(0, p.from) + p.left + out.slice(p.from, p.to) + p.right + out.slice(p.to);
        break;
      }
      case "unwrap": {
        // remove closing first if greater index
        const i1 = Math.min(p.open, p.close);
        const i2 = Math.max(p.open, p.close);
        out = out.slice(0, i2) + out.slice(i2 + 1);
        out = out.slice(0, i1) + out.slice(i1 + 1);
        break;
      }
    }
  }

  // Cursor is UI-level; we treat it as no-op for string text here.
  return out;
}
