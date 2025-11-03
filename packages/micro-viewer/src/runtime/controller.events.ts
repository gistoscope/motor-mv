import { Emitter, EventMap } from "./events/emitter";
import { attachDelegatedListeners } from "./events/dom";

/**
 * Thin event-controller that can be composed with your existing viewer controller.
 * No DOM access at module top-level. Call createEventsController(...) from render().
 */
export type EventsController = {
  on<K extends keyof EventMap>(ev: K, h: (p: EventMap[K]) => void): void;
  off<K extends keyof EventMap>(ev: K, h: (p: EventMap[K]) => void): void;
  once<K extends keyof EventMap>(ev: K, h: (p: EventMap[K]) => void): void;

  /** Programmatic triggers (as requested in S2) */
  onHover(tokenId: string | null): void;
  onSelect(id: string | null): void;

  /** Detach listeners and clear runtime classes */
  destroy(): void;
};

export function createEventsController(root: HTMLElement): EventsController {
  const emitter = new Emitter();
  const detach = attachDelegatedListeners(root, emitter);

  return {
    on: (ev, h) => emitter.on(ev, h as any),
    off: (ev, h) => emitter.off(ev, h as any),
    once: (ev, h) => emitter.once(ev, h as any),

    onHover: (tokenId) => emitter.emit("hover", { tokenId }),
    onSelect: (id) => emitter.emit("select", { id }),

    destroy: () => detach(),
  };
}
