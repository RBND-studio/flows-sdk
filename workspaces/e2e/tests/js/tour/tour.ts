import { init, addFloatingBlocksChangeListener } from "@flows/js";
import { render } from "@flows/js-components";
import * as components from "@flows/js-components/components";
import * as tourComponents from "@flows/js-components/tour-components";
import "@flows/js-components/index.css";

init({
  environment: "production",
  organizationId: "orgId",
  userId: "testUserId",
  userProperties: {
    email: "test@flows.sh",
  },
});
addFloatingBlocksChangeListener((blocks) => {
  render({ blocks, components, tourComponents });
});
