/**
 * Worker entry that receives MVIntent and returns MVResponse.
 * You should replace 'handleIntent' with real Engine logic.
 */
import type { MVIntent, MVResponse } from "@motor/protocol";

declare const self: DedicatedWorkerGlobalScope;

self.onmessage = async (ev: MessageEvent) => {
  const intent = ev.data as MVIntent;
  const resp = await handleIntent(intent);
  self.postMessage(resp);
};

async function handleIntent(i: MVIntent): Promise<MVResponse> {
  // Placeholder: echo response with noop
  return { id: i.id, ok: true, decision: "noop" };
}
