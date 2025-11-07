import { makeId, type MVIntent, type ProtocolVersion } from "@motor/protocol";

const V: ProtocolVersion = "1.0";

/** Build a base intent object */
function base(text: string, format: "ascii"|"latex", localVersion?: number) {
  return { v: V, id: makeId(), ts: Date.now(), text, format, localVersion };
}

export function buildClickParen(text: string, pid: number, format: "ascii"|"latex" = "ascii", localVersion?: number): MVIntent {
  return { ...base(text, format, localVersion), type: "click-paren", pid };
}

export function buildClickOp(text: string, idx: number, format: "ascii"|"latex" = "ascii", localVersion?: number): MVIntent {
  return { ...base(text, format, localVersion), type: "click-op", idx };
}

export function buildHoverOp(text: string, idx: number, format: "ascii"|"latex" = "ascii", localVersion?: number): MVIntent {
  return { ...base(text, format, localVersion), type: "hover-op", idx };
}

export function buildSelectRange(text: string, from: number, to: number, format: "ascii"|"latex" = "ascii", localVersion?: number): MVIntent {
  return { ...base(text, format, localVersion), type: "select-range", from, to };
}

export function buildContextMenu(text: string, at:{x:number,y:number}, format: "ascii"|"latex" = "ascii", localVersion?: number): MVIntent {
  return { ...base(text, format, localVersion), type: "contextmenu", at };
}
