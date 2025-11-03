// Strongly-typed plugin contract for Micro Viewer (S4 patch)
// This file centralizes types that may be shared across plugins.
import type { PluginContext } from './context';

/**
 * MVPlugin — a plug-in that can register handlers and decorate the viewer.
 * - name: stable identifier for diagnostics & toggles
 * - setup(ctx): run once on attach; return optional dispose for teardown
 */
export interface MVPlugin {
  name: string;
  setup(ctx: PluginContext): void | (() => void);
}
