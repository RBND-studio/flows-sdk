# Flows Ember example

An example project showcasing how to use Flows with Ember to build native product growth experiences.

<!-- TODO: -->
<!-- ![Cover](./cover.png) -->

This example extends the Ember starter project with the [`@flows/js`](https://www.npmjs.com/package/@flows/js) and [`@flows/js-components`](https://www.npmjs.com/package/@flows/js-components) packages to demonstrate how to integrate Flows into your application.

## Features

### Flows SDK

In [`app.js`](./app/app.js) you can find Flows being initialized during `ready` lifecycle method. In the [index.html](./index.html) - `<flows-floating-blocks>` is added to render floating components.

### Pre-built components

The `@flows/js-components` package includes ready-to-use components to build in-app experiences. Refer to [`flows.tsx`](./src/flows.tsx) to learn how to import and use these components.

### Custom components

Extend Flows by creating your own components for workflows and tours:

- Use `addFloatingBlocksChangeListener()` and `addSlotBlocksChangeListener()` methods to use your own Ember components
- Alternatively use `lit` to build HTML Web Components for your custom components, check [Lit example](../../examples/lit/README.md) for more details.

Note that to use these custom components you need to define them in your Flows organization with the same properties and exit nodes as described above. For detailed instructions on building custom components, see the [custom components documentation](https://flows.sh/docs/components/custom).

### Flows slots

The `<flows-slot>` element lets you render Flows UI elements dynamically within your application. You can add placeholder UI for empty states. See [`application.gjs`](./app/templates/application.gjs) for an example.

## Documentation

Learn more about Flows and how to use its features in the [official Flows documentation](https://flows.sh/docs).
