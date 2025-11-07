import type { MVIntent, MVResponse } from "@motor/protocol";
export type { MVIntent, MVResponse } from "@motor/protocol";

export interface EnginePort {
  /** Fast pre-check for hover/preview; may be a no-op */
  classify?(intent: MVIntent): { status: "ok" | "blocked" | "noop", hints?: MVResponse["hints"] };
  /** Full request that may return patches */
  request(intent: MVIntent): Promise<MVResponse>;
}

export interface CreateAdapterOptions {
  port: EnginePort;                 // how to reach Engine (in-proc/worker/service-hidden)
  guardIdempotency?: boolean;       // ignore late/stale responses (default true)
}

export interface EngineAdapter {
  request(intent: MVIntent): Promise<MVResponse>;
  classify(intent: MVIntent): { status: "ok" | "blocked" | "noop", hints?: MVResponse["hints"] };
}

export function createEngineAdapter(opts: CreateAdapterOptions): EngineAdapter {
  const guard = opts.guardIdempotency !== false;
  let lastId: string | null = null;
  return {
    classify(intent) {
      if (opts.port.classify) return opts.port.classify(intent);
      return { status: "noop" };
    },
    async request(intent) {
      lastId = intent.id;
      const resp = await opts.port.request(intent);
      if (guard && lastId && resp.id !== lastId) {
        // Late/out-of-order response — return a safe noop wrapper
        return { id: intent.id, ok: false, decision: "noop" };
      }
      return resp;
    }
  };
}
