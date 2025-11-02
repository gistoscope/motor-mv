import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";
import { vitestAliases } from "../../scripts/aliases.generated";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "../../tests/sessions/**/*.test.ts"],
  },
  resolve: {
    alias: {
      // существующие алиасы проекта
      ...vitestAliases,
      // прямой путь к исходнику micro-viewer для Vitest/Vite
      "@motor/micro-viewer": fileURLToPath(
        new URL("../micro-viewer/src/index.ts", import.meta.url)
      ),
    },
  },
});
