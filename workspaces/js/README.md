<p align="center">
  <a href="https://flows.sh">
    <img src="https://raw.githubusercontent.com/RBND-studio/flows-sdk/refs/heads/main/docs/avatar.png" height="96">
    <h3 align="center">Flows JavaScript SDK</h3>
  </a>
</p>

<p align="center">
  The better way to build product adoption.
</p>

<p align="center">
  <a href="https://flows.sh/docs"><strong>Documentation</strong></a> ·
  <a href="https://flows.sh/changelog"><strong>Changelog</strong></a> ·
  <a href="https://flows.sh/examples"><strong>Examples</strong></a> ·
  <a href="https://flows.sh/docs/sdk-overview"><strong>SDKs</strong></a>
</p>

## Installation

For full setup instructions, see our [Quickstart guide](https://flows.sh/docs/quickstart).

```
npm install @flows/js @flows/js-components
```

`@flows/js` SDK handles the lightweight embedding of Flows, while `@flows/js-components` provides a set of built-in components to get you started quickly. Alternatively, you can [bring your own components](https://flows.sh/docs/create-custom-components).

Call `init` and `setupJsComponents` and pass in your [Organization ID](https://app.flows.sh/r/org/settings) and [Environment](https://app.flows.sh/r/org/environments).

```js
import { init } from "@flows/js";
import { setupJsComponents } from "@flows/js-components";
import * as components from "@flows/js-components/components";
import * as tourComponents from "@flows/js-components/tour-components";

// Depending on your setup, link the CSS, copy-paste it to your codebase, or import it in your JS files
import "@flows/js-components/dist/index.css"

init({
  organizationId: "YOUR_ORGANIZATION_ID", // Find this in Settings > General
  userId: "YOUR_USER_ID", // Identify the user
  environment: "production", // Default environment
});
setupJsComponents({
  components: { ...components },
  tourComponents: { ...tourComponents },
});`
```

Add `<flows-floating-blocks>` at the end of the `<body>` to handle rendering of floating components.

```html
<body>
  <!-- Your app code -->

  <flows-floating-blocks></flows-floating-blocks>
</body>
```

## Features

Meet Flows, the flexible platform for building in-app experiences. Focus on your product, not creating one-off logic.

- Build powerful in-app experiences to drive product growth
- Embed components directly into your app
- Create onboarding, product adoption, in-app messaging, growth experiments, and more
- Bring your own UI components or use Flows' built-in components

Visit our [website](https://flows.sh) to learn more about Flows

## Get started for free

The fastest and most reliable way to get started with Flows is [signing up for free](https://app.flows.sh/signup). Your first 250 MTUs (monthly tracked users) are free every month, after which you pay based on usage. See our [pricing](https://flows.sh/pricing) for more details.

## Contributing

We ❤️ contributions big and small. If you have any ideas for improvements, either submit an issue or create a pull request.

---

Created by [rbnd.studio](https://rbnd.studio/).
