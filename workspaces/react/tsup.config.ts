import { defineConfig } from "tsup";

export default defineConfig((options) => {
  const isDevelopment = options.env?.NODE_ENV === "development";

  return {
    entry: ["src/index.ts"],
    format: ["cjs", "esm"],
    minify: true,
    dts: {
      compilerOptions: {
        // Temporary workaround to make tsup work with Typescript 6+
        // More info: https://github.com/egoist/tsup/issues/1388
        ignoreDeprecations: "6.0",
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
