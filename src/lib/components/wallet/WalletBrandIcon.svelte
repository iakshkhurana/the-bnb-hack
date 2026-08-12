<script lang="ts">
	/** Wallet brand marks (token-branded set), vendored via the Iconify API. */
	import icons from './wallet-icons.json';

	let { name, size = 28, class: cls = '' }: { name: string; size?: number; class?: string } =
		$props();

	const icon = $derived(
		(icons as Record<string, { body: string; w: number; h: number }>)[name]
	);
</script>

{#if icon}
	<svg width={size} height={size} viewBox="0 0 {icon.w} {icon.h}" class={cls} aria-hidden="true">
		<!-- eslint-disable-next-line svelte/no-at-html-tags -- static, vendored icon data -->
		{@html icon.body}
	</svg>
{/if}
