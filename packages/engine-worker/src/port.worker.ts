import type { MVIntent, MVResponse } from "@motor/protocol";

/**
 * A thin request/response channel over postMessage.
 * You import this in the main thread to talk to the worker.
 */
export function makeWorkerPort(worker: Worker) {
  const inflight = new Map<string, (r: MVResponse) => void>();

  worker.addEventListener("message", (ev: MessageEvent) => {
    const r = ev.data as MVResponse;
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
        worker.postMessage(i);
      });
    }
  };
}
