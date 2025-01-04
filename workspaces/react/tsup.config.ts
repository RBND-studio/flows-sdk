import { defineConfig } from "tsup";

export default defineConfig({
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
  platform: "browser",
  banner: {
    js: '"use client"',
  },
});
