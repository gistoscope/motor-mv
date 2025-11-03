// packages/micro-viewer/src/runtime/options.ts
export type MVTheme = 'light' | 'dark';
export type MVDensity = 'compact' | 'comfortable';

export interface MVOptions {
  theme: MVTheme;
  density: MVDensity;
  fontScale: number;
}

export const defaultOptions: MVOptions = {
  theme: 'light',
  density: 'comfortable',
  fontScale: 1,
};

export function mergeOptions(curr: MVOptions, patch: Partial<MVOptions>): MVOptions {
  return { ...curr, ...patch };
}

export function applyOptions(root: HTMLElement, opts: MVOptions) {
  root.dataset.theme = opts.theme;
  root.dataset.density = opts.density;
  root.style.setProperty('--mv-font-scale', String(opts.fontScale));
}
