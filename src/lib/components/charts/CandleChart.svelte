<script lang="ts">
	import { onMount } from 'svelte';
	import { theme } from '$lib/stores/theme.svelte';

	interface Candle {
		time: number;
		open: number;
		high: number;
		low: number;
		close: number;
	}

	let {
		data,
		gridLevels = [],
		height = 320
	}: { data: Candle[]; gridLevels?: number[]; height?: number } = $props();

	let el: HTMLDivElement;
	let ready = $state(false);
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let chart: any = null;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let series: any = null;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let priceLines: any[] = [];

	const palette = $derived({
		text: theme.mode === 'dark' ? 'rgba(255,255,255,0.5)' : '#929aa5',
		grid: theme.mode === 'dark' ? 'rgba(255,255,255,0.07)' : '#efeff1',
		up: '#0ecb81',
		down: '#f6465d',
		level: theme.mode === 'dark' ? 'rgba(240,185,11,0.5)' : 'rgba(201,148,0,0.55)'
	});

	function drawLevels(levels: number[]) {
		for (const line of priceLines) series?.removePriceLine(line);
		priceLines = [];
		for (const [i, level] of levels.entries()) {
			priceLines.push(
				series.createPriceLine({
					price: level,
					color: palette.level,
					lineWidth: 1,
					lineStyle: 3,
					axisLabelVisible: i === 0 || i === levels.length - 1,
					title: ''
				})
			);
		}
	}

	onMount(() => {
		let disposed = false;

		(async () => {
			try {
				const { createChart, CandlestickSeries, ColorType } = await import('lightweight-charts');
				if (disposed) return;

				chart = createChart(el, {
					autoSize: true,
					layout: {
						background: { type: ColorType.Solid, color: 'transparent' },
						textColor: palette.text,
						fontFamily: "'Inter Variable', system-ui, sans-serif",
						fontSize: 11
					},
					grid: {
						vertLines: { visible: false },
						horzLines: { color: palette.grid }
					},
					rightPriceScale: { borderVisible: false },
					timeScale: { borderVisible: false, timeVisible: true }
				});

				series = chart.addSeries(CandlestickSeries, {
					upColor: palette.up,
					downColor: palette.down,
					borderUpColor: palette.up,
					borderDownColor: palette.down,
					wickUpColor: palette.up,
					wickDownColor: palette.down
				});

				ready = true;
			} catch (err) {
				console.error('[CandleChart] init failed', err);
			}
		})();

		return () => {
			disposed = true;
			chart?.remove();
			chart = null;
			series = null;
		};
	});

	$effect(() => {
		if (!ready || !series) return;
		const candles = $state.snapshot(data) as Candle[];
		const levels = $state.snapshot(gridLevels) as number[];
		if (!candles.length) return;
		series.setData(candles);
		drawLevels(levels);
		chart?.timeScale().fitContent();
	});

	$effect(() => {
		if (!ready || !chart) return;
		chart.applyOptions({
			layout: { textColor: palette.text },
			grid: { horzLines: { color: palette.grid } }
		});
		series?.applyOptions({
			upColor: palette.up,
			downColor: palette.down,
			borderUpColor: palette.up,
			borderDownColor: palette.down,
			wickUpColor: palette.up,
			wickDownColor: palette.down
		});
	});
</script>

<div bind:this={el} class="w-full" style="height: {height}px"></div>
