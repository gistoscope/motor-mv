import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";
import { vitestAliases as rawAliases } from "../../scripts/aliases.generated";

// Превращаем любые алиасы в массив правил
const aliasArray = Array.isArray(rawAliases)
  ? rawAliases.slice()
  : Object.entries(rawAliases ?? {}).map(([find, replacement]) => ({ find, replacement }));

// Абсолютный путь к локальному src micro-viewer
const microViewerSrc = fileURLToPath(new URL("../micro-viewer/src/index.ts", import.meta.url));

// КРИТИЧЕСКОЕ ПРАВИЛО — должно быть ПЕРВЫМ (first match wins)
aliasArray.unshift({
  find: "@motor/micro-viewer",
  replacement: microViewerSrc,
});

export default defineConfig({
  test: {
    environment: "node",
    deps: {
      inline: [/@motor\/micro-viewer/],
    },
    // include оставьте как у вас, если нужно — добавьте свои гло́бберы
  },
  resolve: {
    alias: aliasArray,
    preserveSymlinks: false,
  },
});
