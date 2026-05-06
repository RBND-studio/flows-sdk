# Flows Ember example

An example project showcasing how to use Flows with Ember to build native product growth experiences.

![Cover](./cover.png)

This example extends the Ember starter project with the [`@flows/js`](https://www.npmjs.com/package/@flows/js) and [`@flows/js-components`](https://www.npmjs.com/package/@flows/js-components) packages to demonstrate how to integrate Flows into your application.

## Features

### Flows initialization

In [`flows.ts`](./app/initializers/flows.ts) you can find Flows being initialized. In the [application.gts](./app/templates/application.gts) - `<flows-floating-blocks>` is added to render floating components.

### Pre-built components

The `@flows/js-components` package includes ready-to-use components to build in-app experiences. Refer to [`flows.ts`](./app/initializers/flows.ts) to learn how to import and use these components.

### Custom components

Extends Flows by creating your own components for workflows and tours:

- Ember components cannot be passed to `setupJsComponents` from `@flows/js-components`, because `setupJsComponents` only accepts Web Components. For simple components you can use `lit` to build compatible custom components, refer to [Lit example](../lit/README.md) for more info.
- **Recommended**: To use Ember components with Flows recreate [flows-floating-blocks.gts](./app/components/flows-floating-blocks.gts) and [flows-slot.gts](./app/components/flows-slot.gts) from `@flows/js-components`. In [`application.gts`](./app/templates/application.gts) you can see example of using these components. Lastly define your components in [flows-block.gts](./app/components/flows-block.gts).

Note that to use these custom components you need to define them in your Flows organization with the same properties and exit nodes as defined in your component files. For detailed instructions on building custom components, see the [custom components documentation](https://flows.sh/docs/components/custom).

### Flows slots

The `<flows-slot>` element lets you render Flows UI elements dynamically within your application. You can add placeholder UI for empty states. See [`application.gts`](./app/templates/application.gts) for examples of both the native `<flows-slot>` web component and the custom `<FlowsSlot>` Ember component.

## Documentation

Learn more about Flows and how to use its features in the [official Flows documentation](https://flows.sh/docs).
