
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { ensureKatexAssetsOnce } from './runtime/assets/katex';

type KatexModule = {
  renderToString(expression: string, options?: Record<string, unknown>): string;
};

// ---- Public surface ----
export type RenderOptions = {
  displayMode?: boolean;
  throwOnError?: boolean;
  strict?: boolean | "warn" | "ignore";
  katexVersion?: string;
};

export type MVEvents = {
  ready: { injectedAssets: boolean; mountMs: number };
  hover: { anchorId: string; phase: "enter" | "leave" };
  select: { anchorId: string };
  warning: { code: string; message: string };
  error: { code: string; message: string; cause?: unknown };
};

export type MicroViewer = {
  update(nextExpr: string): void;
  destroy(): void;
  getHost(): HTMLElement;
  on<E extends keyof MVEvents>(ev: E, h: (p: MVEvents[E]) => void): () => void;
};

const DEFAULT_KATEX_VERSION = "0.16.11";
const KATEX_STYLE_ID = "motor-mv-katex-style";
const KATEX_SCRIPT_ID = "motor-mv-katex-script";
const QUIRKS_CLASS = "mv-quirks";

let katexReady: Promise<KatexModule> | null = null;
let resolvedKatex: KatexModule | null = null;
const loggedMessages = new Set<string>();

function logOnce(method: "info" | "warn", key: string, ...args: unknown[]) {
  if (loggedMessages.has(key)) return;
  loggedMessages.add(key);
  (console[method] as (...data: unknown[]) => void)(...args);
}

function getDocument(element?: HTMLElement | null): Document {
  if (element?.ownerDocument) return element.ownerDocument;
  if (typeof document !== "undefined") return document;
  throw new Error("micro-viewer: document is not available in this environment");
}

function resolveHost(target: HTMLElement | string): HTMLElement {
  if (typeof target === "string") {
    const element = getDocument().querySelector<HTMLElement>(target);
    if (!element) throw new Error(`micro-viewer: unable to find target for selector "${target}"`);
    return element;
  }
  return target;
}

function coerceKatex(candidate: unknown): KatexModule | null {
  if (typeof candidate !== "object" || candidate === null) return null;
  const record = candidate as Record<string, unknown>;
  const maybeDefault = "default" in record ? (record.default as unknown) : candidate;
  if (typeof (maybeDefault as { renderToString?: unknown }).renderToString === "function") {
    return maybeDefault as KatexModule;
  }
  if (typeof (candidate as { renderToString?: unknown }).renderToString === "function") {
    return candidate as KatexModule;
  }
  return null;
}

// Local fallback asset injector — safe to keep alongside ensureKatexAssetsOnce.
function ensureKatexAssets(doc: Document, version: string): HTMLScriptElement {
  const head = doc.head ?? doc.getElementsByTagName("head")[0] ?? doc.body;
  if (!head) throw new Error("micro-viewer: unable to locate document head to mount KaTeX assets");

  if (!doc.getElementById(KATEX_STYLE_ID)) {
    const link = doc.createElement("link");
    link.id = KATEX_STYLE_ID;
    link.rel = "stylesheet";
    link.href = `https://cdn.jsdelivr.net/npm/katex@${version}/dist/katex.min.css`;
    link.setAttribute("data-motor-mv", "katex-style");
    head.appendChild(link);
  }

  const existingScript = doc.getElementById(KATEX_SCRIPT_ID) as HTMLScriptElement | null;
  if (existingScript) return existingScript;

  const script = doc.createElement("script");
  script.id = KATEX_SCRIPT_ID;
  script.src = `https://cdn.jsdelivr.net/npm/katex@${version}/dist/katex.min.js`;
  script.defer = true;
  script.setAttribute("data-motor-mv", "katex-script");
  script.setAttribute("data-katex-version", version);
  head.appendChild(script);
  return script;
}

function applyQuirksHint(host: HTMLElement, doc: Document) {
  const compat = doc.compatMode;
  if (compat && compat !== "CSS1Compat") {
    host.classList.add(QUIRKS_CLASS);
    return;
  }
  host.classList.remove(QUIRKS_CLASS);
}

function waitForKatex(doc: Document, version: string): Promise<KatexModule> {
  if (resolvedKatex) return Promise.resolve(resolvedKatex);

  const globalKatex = (globalThis as { katex?: unknown }).katex;
  const coercedGlobal = coerceKatex(globalKatex);
  if (coercedGlobal) {
    resolvedKatex = coercedGlobal;
    return Promise.resolve(coercedGlobal);
    }

  if (!katexReady) {
    const script = ensureKatexAssets(doc, version);
    // Also call ensureKatexAssetsOnce if host util is present (idempotent).
    try { ensureKatexAssetsOnce?.(doc, version); } catch {}

    katexReady = new Promise((resolve, reject) => {
      let settled = false;
      let scriptFailed = false;
      let importFailed = false;

      const finish = (candidate: unknown) => {
        if (settled) return;
        const coerced = coerceKatex(candidate);
        if (coerced) {
          settled = true;
          resolvedKatex = coerced;
          (globalThis as { katex?: KatexModule }).katex ||= coerced;
          resolve(coerced);
        }
      };

      const fail = (error: Error) => {
        if (settled) return;
        settled = true;
        reject(error);
      };

      const maybeFail = () => {
        // ✅ fixed TS syntax (no Pythonisms)
        if (settled || !scriptFailed || !importFailed) return;
        fail(new Error("micro-viewer: unable to load KaTeX runtime"));
      };

      const tryReadGlobal = () => {
        const refreshed = (globalThis as { katex?: unknown }).katex;
        const coerced = coerceKatex(refreshed);
        if (coerced) {
          script.dataset.mvLoaded = "true";
          finish(coerced);
          return true;
        }
        return false;
      };

      if (!tryReadGlobal()) {
        const handleLoad = () => {
          script.removeEventListener("load", handleLoad);
          script.removeEventListener("error", handleError);
          if (!tryReadGlobal()) {
            fail(new Error("micro-viewer: KaTeX script loaded without exposing window.katex"));
          }
        };

        const handleError = () => {
          script.removeEventListener("load", handleLoad);
          script.removeEventListener("error", handleError);
          scriptFailed = true;
          logOnce("info", "mv-cdn-fallback", "micro-viewer: failed to load KaTeX from CDN; falling back to local module");
          maybeFail();
        };

        script.addEventListener("load", handleLoad);
        script.addEventListener("error", handleError);
      }

      // Fallback for Node-based environments where the CDN script cannot execute.
      // Dynamic import is best-effort; it is ignored if unavailable in the runtime.
      try {
        // bundlers will resolve this during tests/builds.
        // @ts-ignore
        import("katex")
          .then(finish)
          .catch((error: unknown) => {
            importFailed = true;
            logOnce("info", "mv-local-import-failed", "micro-viewer: failed to import local KaTeX module", error);
            maybeFail();
          });
      } catch (error) {
        importFailed = true;
        logOnce("info", "mv-local-import-throw", "micro-viewer: dynamic KaTeX import threw", error as Error);
        maybeFail();
      }
    });
  }

  return katexReady;
}

function wrapAnchors(container: HTMLElement, doc: Document) {
  const spans = container.querySelectorAll("span[id]");
  spans.forEach((node) => {
    const element = node as HTMLElement;
    const id = element.getAttribute("id");
    const parent = element.parentElement;
    if (!id || !parent || parent.classList.contains("motor-mv-anchor")) return;

    const wrapper = doc.createElement("span");
    wrapper.className = "motor-mv-anchor";
    wrapper.setAttribute("data-anchor-id", id);
    wrapper.id = id;

    element.removeAttribute("id");
    parent.replaceChild(wrapper, element);
    wrapper.appendChild(element);
  });
}

function renderHtmlInto(host: HTMLElement, html: string, doc: Document) {
  const temp = doc.createElement("div");
  temp.innerHTML = html;
  wrapAnchors(temp, doc);
  host.replaceChildren(...Array.from(temp.childNodes));
}

function getKatexOptions(opts: RenderOptions | undefined) {
  return {
    displayMode: opts?.displayMode ?? false,
    throwOnError: opts?.throwOnError ?? false,
    strict: opts?.strict ?? "ignore",
    trust: (context: { command?: string } | undefined) => {
      const command = context?.command;
      return command === "\\htmlId" || command === "\\htmlClass";
    },
  } satisfies Record<string, unknown>;
}

// ---- Lightweight internal event bus ----
class MVEventBus {
  private readonly map = new Map<keyof MVEvents, Set<(p: any) => void>>();

  on<E extends keyof MVEvents>(ev: E, h: (p: MVEvents[E]) => void): () => void {
    const set = this.map.get(ev) ?? new Set();
    set.add(h as (p: any) => void);
    this.map.set(ev, set);
    return () => { set.delete(h as (p: any) => void); };
  }

  emit<E extends keyof MVEvents>(ev: E, payload: MVEvents[E]) {
    const set = this.map.get(ev);
    if (!set || set.size === 0) return;
    for (const h of Array.from(set)) {
      try { (h as (p: MVEvents[E]) => void)(payload); } catch (e) {
        // keep going — do not let handlers crash the viewer
        console.warn("micro-viewer: handler error", e);
      }
    }
  }

  clearAll() {
    this.map.clear();
  }
}

// Hover/select bridge — attaches listeners to anchor wrappers
function installHoverSelectBridge(root: HTMLElement, bus: MVEventBus) {
  const enter = (e: Event) => {
    const t = e.target as HTMLElement | null;
    const anchor = t?.closest?.('.motor-mv-anchor') as HTMLElement | null;
    const id = anchor?.getAttribute('data-anchor-id');
    if (id) bus.emit('hover', { anchorId: id, phase: 'enter' });
  };
  const leave = (e: Event) => {
    const t = e.target as HTMLElement | null;
    const anchor = t?.closest?.('.motor-mv-anchor') as HTMLElement | null;
    const id = anchor?.getAttribute('data-anchor-id');
    if (id) bus.emit('hover', { anchorId: id, phase: 'leave' });
  };
  const click = (e: Event) => {
    const t = e.target as HTMLElement | null;
    const anchor = t?.closest?.('.motor-mv-anchor') as HTMLElement | null;
    const id = anchor?.getAttribute('data-anchor-id');
    if (id) bus.emit('select', { anchorId: id });
  };

  root.addEventListener('mouseover', enter);
  root.addEventListener('mouseout', leave);
  root.addEventListener('click', click);

  return () => {
    root.removeEventListener('mouseover', enter);
    root.removeEventListener('mouseout', leave);
    root.removeEventListener('click', click);
  };
}

class Viewer implements MicroViewer {
  private readonly host: HTMLElement;
  private readonly doc: Document;
  private readonly version: string;
  private readonly options: RenderOptions | undefined;
  private destroyed = false;
  private job = 0;
  private readonly bus = new MVEventBus();
  private detachBridge: (() => void) | null = null;
  private readyEmitted = false;

  constructor(host: HTMLElement, expr: string, opts?: RenderOptions) {
    this.host = host;
    this.doc = getDocument(host);
    this.version = opts?.katexVersion ?? DEFAULT_KATEX_VERSION;
    this.options = opts;

    applyQuirksHint(this.host, this.doc);
    this.update(expr);
  }

  on<E extends keyof MVEvents>(ev: E, h: (p: MVEvents[E]) => void): () => void {
    return this.bus.on(ev, h);
  }

  update(nextExpr: string): void {
    if (this.destroyed) return;

    const started = performance.now?.() ?? Date.now();
    const request = ++this.job;
    const doc = this.doc;
    const version = this.version;
    const host = this.host;
    const katexOptions = getKatexOptions(this.options);

    waitForKatex(doc, version)
      .then((katex) => {
        if (this.destroyed || request !== this.job) return;

        const html = katex.renderToString(nextExpr, katexOptions);
        renderHtmlInto(host, html, doc);

        // Reinstall hover/select bridge after each render
        if (this.detachBridge) { this.detachBridge(); }
        this.detachBridge = installHoverSelectBridge(this.host, this.bus);

        if (!this.readyEmitted) {
          this.readyEmitted = true;
          const mountMs = (performance.now?.() ?? Date.now()) - started;
          this.bus.emit('ready', { injectedAssets: true, mountMs });
        }
      })
      .catch((error: unknown) => {
        this.bus.emit('error', { code: 'render', message: 'failed to render expression', cause: error });
        console.error("micro-viewer: failed to render expression", error);
      });
  }

  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    this.job++;
    if (this.detachBridge) { this.detachBridge(); this.detachBridge = null; }
    this.bus.clearAll();
    this.host.replaceChildren();
  }

  getHost(): HTMLElement {
    return this.host;
  }
}

export function render(
  host: HTMLElement | string,
  expr: string,
  opts?: RenderOptions
): MicroViewer {
  const element = resolveHost(host);
  return new Viewer(element, expr, opts);
}
