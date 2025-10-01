<p align="center">
  <a href="https://flows.sh">
    <img src="./../../docs/avatar.png" height="96">
    <h3 align="center">Flows React SDK</h3>
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
npm install @flows/react @flows/react-components
```

`@flows/react` SDK handles the lightweight embedding of Flows, while `@flows/react-components` provides a set of built-in components to get you started quickly. Alternatively, you can [bring your own components](https://flows.sh/docs/create-custom-components).

Wrap your app with `FlowsProvider` component to wrap your application and pass in your [Organization ID](https://app.flows.sh/r/org/settings) and [Environment](https://app.flows.sh/r/org/environments).

```tsx
import { FlowsProvider } from "@flows/react";
import * as components from "@flows/react-components";
import * as tourComponents from "@flows/react-components/tour";
import "@flows/react-components/index.css";

const App = () => {
  return (
    <FlowsProvider
      organizationId="your-organization-id" // Find this in Settings > General
      environment="production" // Default environment
      userId="your-user-id" // Identify the user
      tourComponents={{
        ...tourComponents,
      }}
      components={{
        ...components,
      }}
    >
      {/* Your app code here */}
    </FlowsProvider>
  );
};
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
