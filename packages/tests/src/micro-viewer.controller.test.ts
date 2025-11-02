/// <reference types="vitest" />
/** @vitest-environment happy-dom */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render } from "@motor/micro-viewer";

const SCRIPT_SELECTOR = "script#motor-mv-katex-script";
const STYLE_SELECTOR = "link#motor-mv-katex-style";

function waitForKatex(host: HTMLElement) {
  return vi.waitFor(() => {
    expect(host.querySelector(".katex")).toBeTruthy();
  });
}

describe("micro-viewer controller", () => {
  let host: HTMLElement;

  beforeEach(() => {
    host = document.createElement("div");
    document.body.appendChild(host);
  });

  afterEach(() => {
    host.remove();
    document.body.querySelectorAll("#test-cleanup").forEach((node) => node.remove());
  });

  it("updates, destroys, and keeps KaTeX assets idempotent", async () => {
    const controller = render(host, "a+b", { displayMode: false });
    await waitForKatex(host);
    expect(host.innerHTML).toContain("katex");

    controller.update("x^2");
    await vi.waitFor(() => {
      expect(host.innerHTML).toContain("x^2");
    });

    const scriptCount = document.querySelectorAll(SCRIPT_SELECTOR).length;
    const styleCount = document.querySelectorAll(STYLE_SELECTOR).length;
    expect(scriptCount).toBe(1);
    expect(styleCount).toBe(1);

    controller.destroy();
    expect(host.innerHTML).toBe("");

    const secondHost = document.createElement("div");
    secondHost.id = "test-cleanup";
    document.body.appendChild(secondHost);

    const second = render(secondHost, "c+d");
    await waitForKatex(secondHost);
    expect(document.querySelectorAll(SCRIPT_SELECTOR).length).toBe(1);
    expect(document.querySelectorAll(STYLE_SELECTOR).length).toBe(1);

    second.destroy();
    secondHost.remove();
  });

  it("only warns once in quirks mode", async () => {
    const compatDescriptor = Object.getOwnPropertyDescriptor(document, "compatMode");
    Object.defineProperty(document, "compatMode", {
      configurable: true,
      get: () => "BackCompat",
    });

    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const info = vi.spyOn(console, "info").mockImplementation(() => {});

    try {
      render(host, "m+n");
      await waitForKatex(host);
      expect(warn.mock.calls.length).toBeLessThanOrEqual(1);
      if (warn.mock.calls.length === 1) {
        expect(warn.mock.calls[0]?.[0]).toMatch(/KaTeX/);
      }
      expect(host.classList.contains("mv-quirks")).toBe(true);

      const nextHost = document.createElement("div");
      document.body.appendChild(nextHost);
      render(nextHost, "x");
      await waitForKatex(nextHost);
      expect(warn.mock.calls.length).toBeLessThanOrEqual(1);
      nextHost.remove();
    } finally {
      warn.mockRestore();
      info.mockRestore();
      if (compatDescriptor) {
        Object.defineProperty(document, "compatMode", compatDescriptor);
      }
    }
  });
});
