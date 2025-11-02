/// <reference types="vitest" />
/** @vitest-environment happy-dom */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render } from "@motor/micro-viewer";

let host: HTMLElement | null = null;

describe("micro-viewer render()", () => {
  beforeEach(() => {
    host = document.createElement("div");
    host.id = "test-mv";
    document.body.appendChild(host);
  });

  afterEach(() => {
    host?.remove();
    host = null;
  });

  it("renders KaTeX markup and anchor wrappers", async () => {
    render("#test-mv", "\\htmlId{anchor}{x}");

    await vi.waitFor(() => {
      const katex = host?.querySelector(".katex");
      expect(katex).toBeTruthy();
    });

    const anchors = host?.querySelectorAll(".motor-mv-anchor");
    expect(anchors && anchors.length > 0).toBe(true);
    expect(anchors?.[0].getAttribute("data-anchor-id")).toBe("anchor");
  });
});