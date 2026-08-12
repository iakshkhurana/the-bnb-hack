<script lang="ts">
	import type { Snippet } from 'svelte';

	type Variant = 'primary' | 'accent' | 'ghost' | 'danger' | 'light';

	let {
		variant = 'primary',
		size = 'md',
		href = undefined,
		disabled = false,
		class: cls = '',
		onclick = undefined,
		children
	}: {
		variant?: Variant;
		size?: 'sm' | 'md' | 'lg';
		href?: string;
		disabled?: boolean;
		class?: string;
		onclick?: (e: MouseEvent) => void;
		children: Snippet;
	} = $props();

	const variants: Record<Variant, string> = {
		primary: 'bg-ink text-white hover:bg-night-2 active:scale-[0.98]',
		accent: 'bg-accent text-white hover:bg-accent-deep active:scale-[0.98]',
		ghost: 'bg-transparent text-ink border border-line hover:bg-page active:scale-[0.98]',
		danger: 'bg-crit text-white hover:opacity-90 active:scale-[0.98]',
		light: 'bg-white text-ink hover:bg-accent-tint active:scale-[0.98]'
	};

	const sizes = {
		sm: 'h-8 px-3.5 text-[13px]',
		md: 'h-10 px-5 text-sm',
		lg: 'h-12 px-7 text-[15px]'
	};

	const base =
		'inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-150 disabled:opacity-40 disabled:pointer-events-none whitespace-nowrap';
</script>

{#if href}
	<a {href} class="{base} {variants[variant]} {sizes[size]} {cls}">{@render children()}</a>
{:else}
	<button {onclick} {disabled} class="{base} {variants[variant]} {sizes[size]} {cls}">
		{@render children()}
	</button>
{/if}
