import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "path";

export default defineConfig({
  server: {
    port: 3001,
  },
  envDir: "../../",
  plugins: [
    tanstackStart({ srcDirectory: "app" }),
    react(),
    tailwindcss(),
    tsconfigPaths(),
  ],
  environments: {
    // Polyfill node:async_hooks only in the browser bundle.
    // The server (ssr) environment uses the real Node.js AsyncLocalStorage so
    // async context survives across await boundaries.
    client: {
      resolve: {
        alias: {
          "node:async_hooks": path.resolve("./app/polyfills/async-hooks.ts"),
        },
      },
    },
  },
});
