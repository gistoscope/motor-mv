// Type-only shim so that `import type { MVPlugin } from '../runtime/plugins'` works
// without requiring a code change in implementation files.
export type MVPlugin = (ctx: unknown) => void;
