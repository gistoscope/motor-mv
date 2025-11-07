import type { MVIntent, MVResponse } from "@motor/protocol";

/**
 * Minimal WebSocket client for Engine service.
 * Protocol: send MVIntent as JSON; server replies with MVResponse (same id).
 */
export function makeWsPort(url: string) {
  const ws = new WebSocket(url);
  const inflight = new Map<string, (r: MVResponse) => void>();

  ws.addEventListener("message", (ev) => {
    const r = JSON.parse(String(ev.data)) as MVResponse;
    const resolve = inflight.get(r.id);
    if (resolve) {
      inflight.delete(r.id);
      resolve(r);
    }
  });

  return {
    request(i: MVIntent): Promise<MVResponse> {
      return new Promise<MVResponse>((resolve) => {
        inflight.set(i.id, resolve);
        ws.send(JSON.stringify(i));
      });
    }
  };
}
