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
		primary:
			'bg-cta text-cta-fg shadow-card hover:opacity-90 hover:-translate-y-px hover:shadow-lift active:translate-y-0 active:scale-[0.98]',
		accent:
			'bg-accent text-cta-fg shadow-card hover:bg-accent-deep hover:-translate-y-px hover:shadow-lift active:translate-y-0 active:scale-[0.98]',
		ghost:
			'bg-card/60 text-ink border border-line backdrop-blur-sm hover:border-line-strong hover:bg-card active:scale-[0.98]',
		danger:
			'bg-crit text-white shadow-card hover:-translate-y-px hover:opacity-90 hover:shadow-lift active:translate-y-0 active:scale-[0.98]',
		light: 'bg-white text-[#0b0c0f] shadow-card hover:opacity-90 active:scale-[0.98]'
	};

	const sizes = {
		sm: 'h-8 px-3.5 text-[13px]',
		md: 'h-10 px-5 text-sm',
		lg: 'h-12 px-7 text-[15px]'
	};

	const base =
		'inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-200 [transition-timing-function:var(--ease-out-quart)] disabled:opacity-40 disabled:pointer-events-none whitespace-nowrap';
</script>

{#if href}
	<a {href} class="{base} {variants[variant]} {sizes[size]} {cls}">{@render children()}</a>
{:else}
	<button {onclick} {disabled} class="{base} {variants[variant]} {sizes[size]} {cls}">
		{@render children()}
	</button>
{/if}
