import type { UserConfig } from "@commitlint/types";

const Configuration: UserConfig = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "scope-enum": [2, "always", ["js", "js-components", "react", "react-components"]],
  },
  ignores: [(message) => message.startsWith("@flows/")],
};

export default Configuration;
