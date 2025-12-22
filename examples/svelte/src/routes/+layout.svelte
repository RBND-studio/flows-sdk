<script lang="ts">
	import { onMount } from 'svelte';
	import './layout.css';

	import { init } from '@flows/js';
	import { setupJsComponents } from '@flows/js-components';
	import * as components from '@flows/js-components/components';
	import * as tourComponents from '@flows/js-components/tour-components';
	import '@flows/js-components/index.css';

	import Banner from './banner.svelte';
	import TourBanner from './tour-banner.svelte';

	let { children } = $props();

	onMount(() => {
		init({
			organizationId: 'YOUR_ORGANIZATION_ID',
			userId: 'YOUR_USER_ID',
			environment: 'production'
		});
		setupJsComponents({
			components: {
				...components,
				Banner: Banner.element!
			},
			tourComponents: {
				...tourComponents,
				Banner: TourBanner.element!
			}
		});
	});
</script>

<div class="app">
	<main>{@render children()}</main>
	<footer>
		<p>
			visit
			<a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a>
			to learn about SvelteKit
		</p>
	</footer>

	<flows-floating-blocks></flows-floating-blocks>
</div>

<style>
	.app {
		display: flex;
		flex-direction: column;
		min-height: 100vh;
	}

	main {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 1rem;
		width: 100%;
		max-width: 64rem;
		margin: 0 auto;
		box-sizing: border-box;
	}

	footer {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 12px;
	}

	footer a {
		font-weight: bold;
	}

	@media (min-width: 480px) {
		footer {
			padding: 12px 0;
		}
	}
</style>
