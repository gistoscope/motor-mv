import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";
import { vitestAliases as rawAliases } from "../../scripts/aliases.generated";

const aliasArray = Array.isArray(rawAliases)
  ? rawAliases.slice()
  : Object.entries(rawAliases ?? {}).map(([find, replacement]) => ({ find, replacement }));

// Абсолютный путь к локальному src micro-viewer
const microViewerSrc = fileURLToPath(new URL("../micro-viewer/src/public.ts", import.meta.url));

// КРИТИЧЕСКОЕ правило — должно быть ПЕРВЫМ и ТОЛЬКО точное совпадение
aliasArray.unshift({
  find: /^@motor\/micro-viewer$/,
  replacement: microViewerSrc,
});

export default defineConfig({
  test: {
    environment: "node",
    deps: {
      inline: [/@motor\/micro-viewer/],
    },
  },
  resolve: {
    alias: aliasArray,
    preserveSymlinks: false,
  },
});
