import { init } from "@flows/js";

export default defineNuxtPlugin({
  name: "flows",
  parallel: true,
  hooks: {
    "app:mounted"() {
      init({
        organizationId: "your-organization-id",
        environment: "production",
        userId: "your-user-id",
      });
    },
  },
});
