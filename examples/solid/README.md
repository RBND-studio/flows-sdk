# Flows SolidJS with SolidStart example

An example project showcasing how to use Flows with SolidJS to build native product growth experiences.

![Cover](./cover.png)

This example extends the SolidStart starter project with the [`@flows/js`](https://www.npmjs.com/package/@flows/js) and [`@flows/js-components`](https://www.npmjs.com/package/@flows/js-components) packages to demonstrate how to integrate Flows into your application.

## Features

### Flows component

In [`flows.tsx`](./src/flows.tsx) you can find Flows being initialized during `onMount` effect in the browser. In its render we've added `<flows-floating-blocks>` custom element to render floating components. The Flows component is rendered in the root layout found in [`app.tsx`](./src/app.tsx). For the TypeScript to know about custom HTML elements, we've added TS definition to [`global.d.ts`](./src/global.d.ts).

### Pre-built components

The `@flows/js-components` package includes ready-to-use components to build in-app experiences. Refer to [`flows.tsx`](./src/flows.tsx) to learn how to import and use these components.

### Custom components

Extend Flows by creating your own components for workflows and tours:

- **Workflow block:** The [`banner.tsx`](./src/components/banner.tsx) file demonstrates a custom `Banner` component with `title`, `body`, and a `close` prop connected to an exit node.
- **Tour block:** The [`tour-banner.tsx`](./src/components/tour-banner.tsx) file shows how to build a `TourBanner` component. It accepts `title` and `body` props, as well as `continue`, `previous` and `cancel` for navigation between tour steps.

Convert these Solid components to custom elements with `customElement()` from `solid-element` package and pass them to `setupJsComponents()`. See [`flows.tsx`](./src/flows.tsx) for an example.

Note that to use these custom components you need to define them in your Flows organization with the same properties and exit nodes as described above. For detailed instructions on building custom components, see the [custom components documentation](https://flows.sh/docs/components/custom).

### Flows slots

The `<flows-slot>` element lets you render Flows UI elements dynamically within your application. You can add placeholder UI for empty states. You can add placeholder UI for empty states. See [`index.tsx`](./src/routes/index.tsx) for an example.

## Documentation

Learn more about Flows and how to use its features in the [official Flows documentation](https://flows.sh/docs).
