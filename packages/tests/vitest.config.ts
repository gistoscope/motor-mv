import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";
import { vitestAliases } from "../../scripts/aliases.generated";

const microViewerSrc = fileURLToPath(
  new URL("../micro-viewer/src/index.ts", import.meta.url)
);

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "../../tests/sessions/**/*.test.ts"],
  },
  resolve: {
    alias: {
      // Сначала автогенерированные алиасы проекта...
      ...vitestAliases,
      // ...и в самом конце — наш точный алиас, который переопределяет всё выше.
      "@motor/micro-viewer": microViewerSrc,
    },
  },
});
