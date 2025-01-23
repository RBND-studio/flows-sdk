import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  root: "./pages",
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "pages/index.html"),
        js: resolve(__dirname, "pages/js.html"),
        react: resolve(__dirname, "pages/react.html"),
        jsBlock: resolve(__dirname, "pages/js/block/block.html"),
      },
    },
  },
  appType: "mpa",
  server: {
    port: 3000,
  },
  preview: {
    port: 3000,
  },
});
