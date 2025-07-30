import { defineConfig } from "tsup";

export default defineConfig((options) => {
  const isDevelopment = options.env?.NODE_ENV === "development";

  return {
    entry: ["src/index.ts"],
    clean: true,
    format: ["cjs", "esm"],
    minify: true,
    dts: {
      compilerOptions: {
        paths: {
          "@flows/shared": ["../shared/src/index.ts"],
        },
      },
    },
    loader: {
      ".css": "text",
    },
    platform: "browser",
    banner: {
      js: '"use client"',
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
