// @vitest-environment jsdom
import { describe, it, expect } from "vitest";
import { createEventsController } from "../src/runtime/controller.events";

function makeRoot() {
  const root = document.createElement("div");
  root.innerHTML = `
    <span class="tok" data-tok="tok:1">1</span>
    <span class="tok" data-tok="tok:plus">+</span>
    <span class="tok" data-tok="tok:2">2</span>
  `;
  document.body.appendChild(root);
  return root;
}

describe("events controller lifecycle", () => {
  it("fires hover/select and stops after destroy()", () => {
    const root = makeRoot();
    const ctrl = createEventsController(root);

    let hovered: string | null = null;
    let selected: string | null = null;

    ctrl.on("hover", (p) => (hovered = p.tokenId));
    ctrl.on("select", (p) => (selected = p.id));

    const plus = root.querySelector('[data-tok="tok:plus"]') as HTMLElement;

    plus.dispatchEvent(new MouseEvent("mouseover", { bubbles: true }));
    expect(hovered).toBe("tok:plus");

    plus.click();
    expect(selected).toBe("tok:plus");

    // now destroy and verify no more events
    ctrl.destroy();
    hovered = null;
    selected = null;

    plus.dispatchEvent(new MouseEvent("mouseover", { bubbles: true }));
    plus.click();
    expect(hovered).toBeNull();
    expect(selected).toBeNull();

    root.remove();
  });
});
