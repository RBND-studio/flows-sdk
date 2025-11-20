# Flows Angular example

An example project showcasing how to use Flows with Angular to build native product growth experiences.

![Cover](./cover.png)

This example extends the Angular starter project with the [`@flows/js`](https://www.npmjs.com/package/@flows/js) and [`@flows/js-components`](https://www.npmjs.com/package/@flows/js-components) packages to demonstrate how to integrate Flows into your application.

## Features

### Flows service

In [`flows.service.ts`](./src/app/flows.service.ts) you can find Flows service that is imported to [`app.ts`](./src/app/app.ts) and is initialized in the browser during the `ngOnInit()` lifecycle method. In [`app.html`](./src/app/app.html) - `<flows-floating-blocks>` is added to render floating components.

### Pre-built components

The `@flows/js-components` package includes ready-to-use components to build in-app experiences. Refer to [`flows.service.ts`](./src/app/flows.service.ts) to learn how to import and use these components.

### Custom components

Extend Flows by creating your own components for workflows and tours:

- **Workflow block:** The [`banner.ts`](./src/app/banner/banner.ts) file demonstrates a custom `Banner` component with `title`, `body`, and a `close` prop connected to an exit node.
- **Tour block:** The [`tour-banner.ts`](./src/app/tour-banner/tour-banner.ts) file shows how to build a `TourBanner` component. It accepts `title` and `body` props, as well as `continue`, `previous` and `cancel` for navigation between tour steps.

Note that to use these custom components you need to define them in your Flows organization with the same properties and exit nodes as described above. For detailed instructions on building custom components, see the [custom components documentation](https://flows.sh/docs/components/custom).

### Flows slots

The `<flows-slot>` element lets you render Flows UI elements dynamically within your application. You can add placeholder UI for empty states. You can add placeholder UI for empty states. See [`app.html`](./src/app/app.html) for an example.

## Documentation

Learn more about Flows and how to use its features in the [official Flows documentation](https://flows.sh/docs).
