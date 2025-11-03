import { Emitter } from "./emitter";

/**
 * Delegated DOM listeners for hover/select over token spans.
 * - reads anchors: [data-tok], [data-role="bracket-pair"] (we don't rename them)
 * - toggles mv-* runtime classes
 * - cleans up on dispose()
 */
export function attachDelegatedListeners(
  root: HTMLElement,
  emitter: Emitter
): () => void {
  let currentHover: HTMLElement | null = null;
  let currentSelect: HTMLElement | null = null;

  const getTokEl = (el: Element | null): HTMLElement | null => {
    return (el && (el as HTMLElement).closest?.("[data-tok]")) as HTMLElement | null;
  };

  const hover = (el: HTMLElement | null) => {
    if (currentHover === el) return;
    if (currentHover) currentHover.classList.remove("mv-hovered");
    currentHover = el;
    if (currentHover) currentHover.classList.add("mv-hovered");
    const tokenId = currentHover?.getAttribute("data-tok") ?? null;
    emitter.emit("hover", { tokenId });
  };

  const select = (el: HTMLElement | null) => {
    if (currentSelect === el) return;
    if (currentSelect) currentSelect.classList.remove("mv-selected");
    currentSelect = el;
    if (currentSelect) currentSelect.classList.add("mv-selected");
    const id = currentSelect?.getAttribute("data-tok") ?? null;
    emitter.emit("select", { id });
  };

  const onMouseOver = (e: Event) => hover(getTokEl(e.target as Element));
  const onMouseOut = (e: Event) => {
    const to = (e as MouseEvent).relatedTarget as Element | null;
    // only clear if truly leaving token region
    if (!getTokEl(to)) hover(null);
  };
  const onClick = (e: MouseEvent) => select(getTokEl(e.target as Element));

  root.addEventListener("mouseover", onMouseOver);
  root.addEventListener("mouseout", onMouseOut);
  root.addEventListener("click", onClick);

  return () => {
    root.removeEventListener("mouseover", onMouseOver);
    root.removeEventListener("mouseout", onMouseOut);
    root.removeEventListener("click", onClick);
    // clear classes
    if (currentHover) currentHover.classList.remove("mv-hovered");
    if (currentSelect) currentSelect.classList.remove("mv-selected");
    currentHover = null;
    currentSelect = null;
  };
}
