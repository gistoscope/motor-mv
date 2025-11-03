// packages/micro-viewer/src/runtime/plugins.ts
// Minimal plugin manager that augments an existing controller with .use(plugin).
// The controller is expected to have: on(event, handler), off(event, handler), destroy().

export type MVTheme = 'light' | 'dark';
export type MVDensity = 'compact' | 'comfortable';

export interface MVOptions {
  theme: MVTheme;
  density: MVDensity;
  fontScale: number;
}

export interface PluginAPI {
  root: HTMLElement;
  on: (event: string, handler: (...args: any[]) => void) => void;
  off: (event: string, handler: (...args: any[]) => void) => void;
  getOptions: () => MVOptions;
  setOptions: (patch: Partial<MVOptions>) => void;
}

export interface MVPlugin {
  (api: PluginAPI): { teardown?: () => void } | void;
}

export interface AugmentedController {
  use: (plugin: MVPlugin) => void;
  destroy: () => void;
}

export function attachPluginAPI<T extends {
  on: (e: string, h: (...a: any[]) => void) => void;
  off: (e: string, h: (...a: any[]) => void) => void;
  destroy: () => void;
}>(
  controller: T,
  root: HTMLElement,
  getOptions: () => MVOptions,
  setOptions: (patch: Partial<MVOptions>) => void
): T & AugmentedController {
  const teardowns: Array<() => void> = [];
  const origDestroy = controller.destroy.bind(controller);

  function use(plugin: MVPlugin) {
    const api: PluginAPI = { root, on: controller.on, off: controller.off, getOptions, setOptions };
    const res = plugin(api);
    if (res && typeof res.teardown === 'function') {
      teardowns.push(res.teardown);
    }
  }

  function destroy() {
    // run plugin teardowns first
    while (teardowns.length) {
      const td = teardowns.pop();
      try { td && td(); } catch {}
    }
    origDestroy();
  }

  return Object.assign(controller, { use, destroy });
}
