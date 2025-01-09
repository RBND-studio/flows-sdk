import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts", "src/components.ts", "src/tour-components.ts"],
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
