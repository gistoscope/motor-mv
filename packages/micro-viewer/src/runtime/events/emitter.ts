/* Tiny typed event emitter with on/off/once */
export type HoverPayload = { tokenId: string | null };
export type SelectPayload = { id: string | null };

export type EventMap = {
  hover: HoverPayload;
  select: SelectPayload;
};

type Handler<K extends keyof EventMap> = (p: EventMap[K]) => void;

export class Emitter {
  private listeners: { [K in keyof EventMap]?: Set<Handler<K>> } = {};

  on<K extends keyof EventMap>(event: K, handler: Handler<K>): void {
    const set = (this.listeners[event] ??= new Set());
    // @ts-expect-error generic set
    set.add(handler);
  }

  off<K extends keyof EventMap>(event: K, handler: Handler<K>): void {
    this.listeners[event]?.delete(handler as any);
  }

  once<K extends keyof EventMap>(event: K, handler: Handler<K>): void {
    const wrap: Handler<K> = (p) => {
      this.off(event, wrap);
      handler(p);
    };
    this.on(event, wrap);
  }

  emit<K extends keyof EventMap>(event: K, payload: EventMap[K]): void {
    this.listeners[event]?.forEach((h) => (h as any)(payload));
  }
}
