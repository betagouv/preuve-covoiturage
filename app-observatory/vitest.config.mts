import { resolve } from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: { "@": resolve(import.meta.dirname, "src") },
  },
  // `tsconfig.json` laisse le JSX à Next (`preserve`) : sans ça, un module testé
  // qui importe un `.tsx` (contexte du dashboard) casse au parsing.
  oxc: { jsx: { runtime: "automatic" } },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    // Config lit process.env au chargement du module et lève si l'hôte manque.
    env: {
      NEXT_PUBLIC_SEARCH_URL: "https://search.test",
      NEXT_PUBLIC_SEARCH_TOKEN: "test-token",
    },
  },
});
