/**
 * S5 compatibility shim.
 * Tiny typed Emitter; safe no-op if imported for side effects.
 * Does not touch DOM at top-level (SSR-safe).
 */
export type Unsubscribe = () => void;

export class Emitter<T extends Record<string, any[]>> {
  private _m = new Map<keyof T, Set<Function>>();
  on<K extends keyof T>(ev: K, fn: (...args: T[K]) => void): Unsubscribe {
    let s = this._m.get(ev);
    if (!s) { s = new Set(); this._m.set(ev, s); }
    s.add(fn as any);
    return () => this.off(ev, fn);
  }
  off<K extends keyof T>(ev: K, fn: (...args: T[K]) => void): void {
    const s = this._m.get(ev);
    if (s) s.delete(fn as any);
  }
  emit<K extends keyof T>(ev: K, ...args: T[K]): void {
    const s = this._m.get(ev);
    if (!s || s.size === 0) return;
    for (const f of s) { try { (f as any)(...args); } catch { /* swallow */ } }
  }
  clear() { this._m.clear(); }
}

// Global emitter (optional use by existing code)
export const globalEmitter = new Emitter<any>();
export default Emitter;
