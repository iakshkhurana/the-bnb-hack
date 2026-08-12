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
	class="rounded-card transition-shadow duration-300 {dark
		? 'bg-night text-white shadow-[0_0_0_1px_rgb(255_255_255/0.06),0_2px_8px_rgb(11_12_15/0.2),0_24px_48px_-16px_rgb(11_12_15/0.35)]'
		: 'bg-card shadow-card'} {padded ? 'p-5' : ''} {cls}"
>
	{@render children()}
</div>
