<script lang="ts">
	/** Flat token badge with brand color and glyph. Self-contained SVG. */
	let { symbol, size = 24, class: cls = '' }: { symbol: string; size?: number; class?: string } =
		$props();

	const norm = $derived.by(() => {
		const s = (symbol ?? '').toUpperCase();
		if (s === 'WBNB') return 'BNB';
		if (s === 'BTCB') return 'BTC';
		return s;
	});

	const META: Record<string, { bg: string; fg: string; letter?: string; glyph?: 'bnb' | 'eth' }> = {
		BNB: { bg: '#f0b90b', fg: '#181a20', glyph: 'bnb' },
		ETH: { bg: '#627eea', fg: '#ffffff', glyph: 'eth' },
		USDT: { bg: '#26a17b', fg: '#ffffff', letter: 'T' },
		USDC: { bg: '#2775ca', fg: '#ffffff', letter: '$' },
		BTC: { bg: '#f7931a', fg: '#ffffff', letter: 'B' },
		CAKE: { bg: '#1fc7d4', fg: '#ffffff', letter: 'C' }
	};

	const m = $derived(
		META[norm] ?? { bg: 'var(--color-night-2)', fg: '#ffffff', letter: norm.slice(0, 1) || '?' }
	);
</script>

<svg width={size} height={size} viewBox="0 0 32 32" class="shrink-0 {cls}" aria-hidden="true">
	<circle cx="16" cy="16" r="16" fill={m.bg} />
	{#if m.glyph === 'bnb'}
		<g fill={m.fg}>
			<path d="M16 8.6 18.8 11.4 16 14.2 13.2 11.4Z" />
			<path d="M10.4 14.2 13.2 17 10.4 19.8 7.6 17Z" />
			<path d="M21.6 14.2 24.4 17 21.6 19.8 18.8 17Z" />
			<path d="M16 19.8 18.8 22.6 16 25.4 13.2 22.6Z" />
			<path d="M16 14.2 18.8 17 16 19.8 13.2 17Z" />
		</g>
	{:else if m.glyph === 'eth'}
		<g fill={m.fg}>
			<path d="M16 5.5 22 16.1 16 19.7 10 16.1Z" opacity="0.9" />
			<path d="M16 21.2 22 17.6 16 26.5 10 17.6Z" opacity="0.75" />
		</g>
	{:else}
		<text
			x="16"
			y="21.5"
			text-anchor="middle"
			font-size="15"
			font-weight="800"
			fill={m.fg}
			font-family="'Inter Variable', system-ui, sans-serif">{m.letter}</text
		>
	{/if}
</svg>
