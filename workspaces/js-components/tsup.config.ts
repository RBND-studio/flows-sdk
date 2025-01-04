import { defineConfig } from "tsup";

export default defineConfig({
  entry: [
    "src/index.ts",
    "src/tour.ts",
    // TODO: find out if we can share the css file between the packages
    "src/index.css",
  ],
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
});
