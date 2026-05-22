<script lang="ts">
	type Props = {
		title: string;
		body: string;

		close: () => void;
	};

	let { title, body, close }: Props = $props();
</script>

<div class="w-full rounded border border-gray-400 p-4">
	<p class="mb-3 text-base font-bold">{title}</p>
	<p class="mb-4 text-sm">{body}</p>
	<div class="flex justify-end">
		<button onclick={close}>Close</button>
	</div>
</div>
