<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		dark = false,
		padded = true,
		class: cls = '',
		children
	}: { dark?: boolean; padded?: boolean; class?: string; children: Snippet } = $props();
</script>

<div
	class="rounded-card border {dark
		? 'border-night-2 bg-night text-white'
		: 'border-line bg-card shadow-card'} {padded ? 'p-5' : ''} {cls}"
>
	{@render children()}
</div>
