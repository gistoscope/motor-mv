// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from "vitest";
import { ensureKatexAssetsOnce } from "../src/runtime/assets/katex";

describe("KaTeX assets loader (idempotent)", () => {
  beforeEach(() => {
    // clean head between tests
    const head = document.head;
    [...head.querySelectorAll("[data-mv-katex]")].forEach((n) => n.remove());
  });

  it("adds stylesheet once", () => {
    ensureKatexAssetsOnce(document);
    ensureKatexAssetsOnce(document);
    const links = document.head.querySelectorAll('link[rel="stylesheet"][data-mv-katex]');
    expect(links.length).toBe(1);
  });
});
