import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { vitestAliases as rawAliases } from "../../scripts/aliases.generated";

// Нормализуем vitestAliases: поддержим и "array", и "object" варианты.
const aliasEntries = Array.isArray(rawAliases)
  ? [...rawAliases]
  : Object.entries(rawAliases || {}).map(([find, replacement]) => ({
      find,
      replacement,
    }));

// Абсолютный путь к локальному src micro-viewer
const microViewerSrc = fileURLToPath(
  new URL("../micro-viewer/src/index.ts", import.meta.url)
);

// КРИТИЧЕСКОЕ ПРАВИЛО — должно быть ПОСЛЕДНИМ:
aliasEntries.push({
  find: /^@motor\/micro-viewer$/,
  replacement: microViewerSrc,
});

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "../../tests/sessions/**/*.test.ts"],
    // Гарантируем inlining, чтобы alias применился до пакетного резолва
    deps: {
      inline: [/@motor\/micro-viewer/],
    },
  },
  resolve: {
    alias: aliasEntries,
    // Явно фиксируем поведение с symlinks (по умолчанию false, но пусть будет явно)
    preserveSymlinks: false,
  },
});
