<script lang="ts">
	/**
	 * UI icons: Lucide, vendored at build time via the Iconify API
	 * (api.iconify.design) into icon-bodies.json. Fully self-contained.
	 */
	import bodies from './icon-bodies.json';

	let {
		name,
		size = 18,
		strokeWidth = 1.8,
		class: cls = ''
	}: { name: string; size?: number; strokeWidth?: number; class?: string } = $props();

	const body = $derived(
		((bodies as Record<string, string>)[name] ?? '').replaceAll(
			'stroke-width="2"',
			`stroke-width="${strokeWidth}"`
		)
	);
</script>

<svg width={size} height={size} viewBox="0 0 24 24" fill="none" class={cls} aria-hidden="true">
	<!-- eslint-disable-next-line svelte/no-at-html-tags -- static, vendored icon data -->
	{@html body}
</svg>
