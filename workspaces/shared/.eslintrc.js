const { resolve } = require("node:path");

const project = resolve(__dirname, "tsconfig.json");

module.exports = {
  extends: [
    require.resolve("@vercel/style-guide/eslint/browser"),
    require.resolve("@vercel/style-guide/eslint/node"),
    require.resolve("@vercel/style-guide/eslint/typescript"),
  ],
  parserOptions: {
    project,
  },
  settings: {
    "import/resolver": {
      typescript: {
        project,
      },
    },
  },
  rules: {
    "@typescript-eslint/naming-convention": 0,
    "@typescript-eslint/restrict-template-expressions": 0,
    "no-empty": "off",
  },
};
