<script lang="ts">
	/**
	 * Token logos: official brand marks (cryptologos.cc), vendored into
	 * the repo. Diamond-shaped marks (BNB, ETH) sit in a circular chip so
	 * every token renders uniformly; unknown symbols fall back to a letter.
	 */
	import bnb from '$lib/assets/tokens/bnb.svg';
	import eth from '$lib/assets/tokens/eth.svg';
	import usdt from '$lib/assets/tokens/usdt.svg';
	import usdc from '$lib/assets/tokens/usdc.svg';
	import btc from '$lib/assets/tokens/btc.svg';
	import cake from '$lib/assets/tokens/cake.svg';

	let { symbol, size = 24, class: cls = '' }: { symbol: string; size?: number; class?: string } =
		$props();

	const norm = $derived.by(() => {
		const s = (symbol ?? '').toUpperCase();
		if (s === 'WBNB') return 'BNB';
		if (s === 'BTCB') return 'BTC';
		return s;
	});

	const META: Record<string, { src: string; contained?: boolean; chipBg?: string }> = {
		BNB: { src: bnb },
		ETH: { src: eth, contained: true, chipBg: '#f0f1f5' },
		USDT: { src: usdt },
		USDC: { src: usdc },
		BTC: { src: btc },
		CAKE: { src: cake }
	};

	const meta = $derived(META[norm]);
	const inner = $derived(Math.round(size * 0.62));
</script>

{#if meta?.contained}
	<span
		class="grid shrink-0 place-items-center rounded-full {cls}"
		style="width:{size}px;height:{size}px;background:{meta.chipBg}"
	>
		<img src={meta.src} alt={norm} style="width:{inner}px;height:{inner}px" />
	</span>
{:else if meta}
	<img
		src={meta.src}
		alt={norm}
		class="shrink-0 rounded-full {cls}"
		style="width:{size}px;height:{size}px"
	/>
{:else}
	<span
		class="grid shrink-0 place-items-center rounded-full bg-night-2 font-extrabold text-white {cls}"
		style="width:{size}px;height:{size}px;font-size:{Math.round(size * 0.45)}px"
	>
		{norm.slice(0, 1) || '?'}
	</span>
{/if}
