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
    tanstackStart({
      srcDirectory: "app",
    }),
    react(),
    tailwindcss(),
    tsconfigPaths(),
  ],
  resolve: {
    alias: {
      "node:async_hooks": path.resolve("./app/polyfills/async-hooks.ts"),
    },
  },
});
