<script lang="ts">
	import type { TourComponentProps } from '@flows/js';

	type Props = TourComponentProps<{
		title: string;
		body: string;
	}>;

	let { title, body, previous, continue: continueFn, cancel }: Props = $props();
</script>

<div class="w-full rounded border border-gray-400 p-4">
	<p class="mb-3 text-base font-bold">{title}</p>
	<p class="mb-4 text-sm">{body}</p>
	<div class="flex justify-end gap-1">
		<!-- In the first step the previous function is undefined -->
		{#if previous}
			<button onclick={previous}>Previous</button>
		{/if}
		<button onclick={continueFn}>Continue</button>
		<button onclick={cancel}>Cancel</button>
	</div>
</div>
