import type { MVIntent, MVResponse } from "./types";

export function isObject(x: unknown): x is Record<string, unknown> {
  return typeof x === "object" && x !== null;
}

export function isMVIntent(x: unknown): x is MVIntent {
  if (!isObject(x)) return false;
  if (typeof x["v"] !== "string") return false;
  if (typeof x["id"] !== "string") return false;
  if (typeof x["ts"] !== "number") return false;
  if (typeof x["text"] !== "string") return false;
  if (typeof x["type"] !== "string") return false;
  return true;
}

export function isMVResponse(x: unknown): x is MVResponse {
  if (!isObject(x)) return false;
  if (typeof x["id"] !== "string") return false;
  if (typeof x["ok"] !== "boolean") return false;
  if (typeof x["decision"] !== "string") return false;
  return true;
}
