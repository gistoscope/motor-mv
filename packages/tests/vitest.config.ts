import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";
import { vitestAliases } from "../../scripts/aliases.generated";

// Абсолютный путь к исходнику micro-viewer
const microViewerSrc = fileURLToPath(new URL("../micro-viewer/src/index.ts", import.meta.url));

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts", "../../tests/sessions/**/*.test.ts"],
  },
  resolve: {
    alias: {
      // ЯВНЫЙ алиас имеет приоритет и снимает проблему резолва пакета из workspaces
      "@motor/micro-viewer": microViewerSrc,
      // Остальные алиасы проекта
      ...vitestAliases,
    },
  },
});
