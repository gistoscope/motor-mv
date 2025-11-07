/**
 * Motor Protocol — v1.0
 * Viewer ↔ Engine: Intent / Response / Patch
 */

export type ProtocolVersion = "1.0";

/** User intentions coming from the Viewer */
export type MVIntentType =
  | "hover-op" | "click-op" | "click-paren"
  | "select-range" | "contextmenu"
  | "drag-start" | "drag-end"
  | "keyboard" | "input-changed";

export interface MVIntentBase {
  v: ProtocolVersion;       // protocol version
  id: string;               // request id
  ts: number;               // timestamp (ms)
  format: "ascii" | "latex";
  text: string;             // current expression string
  localVersion?: number;    // optional client-side version
}

export type MVIntent =
  | (MVIntentBase & { type: "click-paren", pid: number })
  | (MVIntentBase & { type: "click-op", idx: number })
  | (MVIntentBase & { type: "hover-op", idx: number })
  | (MVIntentBase & { type: "select-range", from: number, to: number })
  | (MVIntentBase & { type: "keyboard", key: "Tab"|"Shift+Tab"|"Enter"|"Esc" })
  | (MVIntentBase & { type: "contextmenu", at: { x: number, y: number } })
  | (MVIntentBase & { type: "drag-start", at: { x: number, y: number } })
  | (MVIntentBase & { type: "drag-end", at: { x: number, y: number } })
  | (MVIntentBase & { type: "input-changed" });

export type Decision = "transform" | "blocked" | "noop" | "explain";

export type Patch =
  | { op: "replaceRange", from: number, to: number, text: string }
  | { op: "wrap", from: number, to: number, left: "("|"[", right: ")"|"]" }
  | { op: "unwrap", open: number, close: number }
  | { op: "cursor", at: number };

export interface MVHint {
  from: number;
  to: number;
  class: "ok" | "blocked" | "pending";
}

export interface MVResponse {
  id: string;                      // echoes MVIntent.id
  ok: boolean;
  decision: Decision;
  patches?: Patch[];
  hints?: MVHint[];
  explain?: string;
  baseVersion?: number;
}
