import type { MVIntent, MVResponse } from "@motor/protocol";

/**
 * Minimal HTTP client for Engine service.
 * Replace '/intent' with your endpoint; attach auth if needed.
 */
export function makeHttpPort(baseUrl: string) {
  return {
    async request(i: MVIntent): Promise<MVResponse> {
      const r = await fetch(baseUrl + "/intent", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(i)
      });
      if (!r.ok) throw new Error("HTTP " + r.status);
      return await r.json() as MVResponse;
    }
  };
}
