import type { MVIntent, MVResponse } from "@motor/protocol";
import type { EnginePort } from "./index.js";

/**
 * In-process adapter utility. You provide an EnginePort whose `request()`
 * calls your current in-page Engine (or stub). No worker/network involved.
 */
export function makeInprocPort(requestFn: (i: MVIntent) => Promise<MVResponse>,
                               classifyFn?: (i: MVIntent) => { status: "ok" | "blocked" | "noop", hints?: MVResponse["hints"] }
): EnginePort {
  return {
    request: requestFn,
    classify: classifyFn
  };
}
