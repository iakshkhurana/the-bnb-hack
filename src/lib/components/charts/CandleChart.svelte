<script lang="ts">
	import { onMount } from 'svelte';

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
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let chart: any = null;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let series: any = null;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let priceLines: any[] = [];

	function drawLevels() {
		for (const line of priceLines) series?.removePriceLine(line);
		priceLines = [];
		for (const [i, level] of gridLevels.entries()) {
			priceLines.push(
				series.createPriceLine({
					price: level,
					color: 'rgba(42,120,214,0.45)',
					lineWidth: 1,
					lineStyle: 3, // dotted
					axisLabelVisible: i === 0 || i === gridLevels.length - 1,
					title: ''
				})
			);
		}
	}

	onMount(() => {
		let disposed = false;
		let ro: ResizeObserver | null = null;

		(async () => {
			const { createChart, CandlestickSeries, ColorType } = await import('lightweight-charts');
			if (disposed) return;

			chart = createChart(el, {
				height,
				layout: {
					background: { type: ColorType.Solid, color: 'transparent' },
					textColor: '#898781',
					fontFamily: "'Inter Variable', system-ui, sans-serif",
					fontSize: 11
				},
				grid: {
					vertLines: { visible: false },
					horzLines: { color: '#eef0f3' }
				},
				rightPriceScale: { borderVisible: false },
				timeScale: { borderVisible: false, timeVisible: true },
				crosshair: {
					vertLine: { color: '#c3c2b7', labelVisible: true },
					horzLine: { color: '#c3c2b7' }
				}
			});

			series = chart.addSeries(CandlestickSeries, {
				upColor: '#0ca30c',
				downColor: '#d03b3b',
				borderUpColor: '#0ca30c',
				borderDownColor: '#d03b3b',
				wickUpColor: '#0ca30c',
				wickDownColor: '#d03b3b'
			});
			series.setData(data);
			drawLevels();
			chart.timeScale().fitContent();

			ro = new ResizeObserver(() => chart?.applyOptions({ width: el.clientWidth }));
			ro.observe(el);
		})();

		return () => {
			disposed = true;
			ro?.disconnect();
			chart?.remove();
		};
	});

	$effect(() => {
		if (series && data.length) {
			series.setData(data);
			drawLevels();
			chart?.timeScale().fitContent();
		}
	});
</script>

<div bind:this={el} class="w-full" style="height: {height}px"></div>
