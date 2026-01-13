import { defineConfig } from "tsup";

export default defineConfig((options) => {
  const isDevelopment = options.env?.NODE_ENV === "development";

  return {
    entry: ["src/index.ts"],
    format: ["cjs", "esm", "iife"],
    globalName: "flows_js",

    minify: true,
    dts: {
      compilerOptions: {
        paths: {
          "@flows/shared": ["../shared/src/index.ts"],
        },
      },
    },
    platform: "browser",
    loader: {
      ".css": "text",
    },

    // Enable watching of external files
    watch: isDevelopment
      ? [
          "src/**/*",
          "../styles/src/**/*", // Watch CSS files in styles workspace
          "../shared/src/**/*", // Also watch shared files
        ]
      : undefined,
  };
});
