import { defineConfig } from "@tanstack/start/config";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  server: {
    port: 3001,
  },
  vite: {
    envDir: '../../',
    plugins: [tailwindcss(), tsconfigPaths()],
  },
});
