/**
 * S5 compatibility shim for hover/select delegated handlers.
 * No-op implementations to satisfy legacy imports.
 * Real logic lives in runtime/controller in newer code paths.
 */
export type HoverSelectOptions = {
  throttleMs?: number;
};

export function mountHoverSelect(root: HTMLElement, _opts: HoverSelectOptions = {}): void {
  // Intentionally blank for S5 shim; real mounting happens elsewhere in S6.
}

export function unmountHoverSelect(root: HTMLElement): void {
  // Intentionally blank; paired with mountHoverSelect.
}
