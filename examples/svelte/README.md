# Flows Svelte Kit example

An example project showcasing how to use Flows with Svelte Kit to build native product growth experiences.

![Cover](./cover.png)

This example extends the Svelte Kit starter project with the [`@flows/js`](https://www.npmjs.com/package/@flows/js) and [`@flows/js-components`](https://www.npmjs.com/package/@flows/js-components) packages to demonstrate how to integrate Flows into your application.

## Features

### Flows init

In [`+layout.svelte`](./src/routes/+layout.svelte) Flows is being initialized in the browser during the `onMount` lifecycle hook. At the end of the layout markup - `<flows-floating-blocks>` is added to render floating components.

### Pre-built components

The `@flows/js-components` package includes ready-to-use components to build in-app experiences. Refer to [`+layout.svelte`](./src/routes/+layout.svelte) to learn how to import and use these components.

### Custom components

Extend Flows by creating your own components for workflows and tours:

- **Workflow block:** The [`banner.svelte`](./src/routes/banner.svelte) file demonstrates a custom `Banner` component with `title`, `body`, and a `close` prop connected to an exit node.
- **Tour block:** The [`tour-banner.svelte`](./src/routes/tour-banner.svelte) file shows how to build a `TourBanner` component. It accepts `title` and `body` props, as well as `continue`, `previous` and `cancel` for navigation between tour steps.

Also enable `customElement` in the `compilerOptions` of [`svelte.config.js`](./svelte.config.js).

Note that to use these custom components you need to define them in your Flows organization with the same properties and exit nodes as described above. For detailed instructions on building custom components, see the [custom components documentation](https://flows.sh/docs/components/custom).

### Flows slots

The `<flows-slot>` element lets you render Flows UI elements dynamically within your application. You can add placeholder UI for empty states. You can add placeholder UI for empty states. See [`+page.svelte`](./src/routes/+page.svelte) for an example.

## Documentation

Learn more about Flows and how to use its features in the [official Flows documentation](https://flows.sh/docs).
