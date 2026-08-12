<script lang="ts">
	import { onMount } from 'svelte';
	import type { EquityPoint } from '$lib/agents/performance';

	let {
		data,
		dark = false,
		height = 260,
		valueSuffix = ''
	}: { data: EquityPoint[]; dark?: boolean; height?: number; valueSuffix?: string } = $props();

	let el: HTMLDivElement;
	let tooltip = $state<{ x: number; y: number; text: string; date: string } | null>(null);
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let series: any = null;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let chart: any = null;

	onMount(() => {
		let disposed = false;
		let ro: ResizeObserver | null = null;

		(async () => {
			const { createChart, AreaSeries, ColorType, CrosshairMode } = await import(
				'lightweight-charts'
			);
			if (disposed) return;

			const ink = dark ? 'rgba(255,255,255,0.55)' : '#898781';
			chart = createChart(el, {
				height,
				layout: {
					background: { type: ColorType.Solid, color: 'transparent' },
					textColor: ink,
					fontFamily: "'Inter Variable', system-ui, sans-serif",
					fontSize: 11
				},
				grid: {
					vertLines: { visible: false },
					horzLines: { color: dark ? 'rgba(255,255,255,0.06)' : '#eef0f3' }
				},
				rightPriceScale: { borderVisible: false },
				timeScale: { borderVisible: false, timeVisible: false },
				crosshair: {
					mode: CrosshairMode.Magnet,
					vertLine: { color: dark ? 'rgba(255,255,255,0.35)' : '#c3c2b7', labelVisible: false },
					horzLine: { visible: false, labelVisible: false }
				},
				handleScroll: false,
				handleScale: false
			});

			series = chart.addSeries(AreaSeries, {
				lineColor: dark ? '#ffffff' : '#2a78d6',
				lineWidth: 2,
				topColor: dark ? 'rgba(255,255,255,0.16)' : 'rgba(42,120,214,0.18)',
				bottomColor: 'rgba(0,0,0,0)',
				priceLineVisible: false,
				lastValueVisible: true,
				crosshairMarkerRadius: 4
			});
			series.setData(data);
			chart.timeScale().fitContent();

			chart.subscribeCrosshairMove((param: { time?: unknown; point?: { x: number; y: number }; seriesData: Map<unknown, { value?: number }> }) => {
				if (!param.time || !param.point) {
					tooltip = null;
					return;
				}
				const d = param.seriesData.get(series);
				if (!d || d.value == null) {
					tooltip = null;
					return;
				}
				const date = new Date((param.time as number) * 1000).toLocaleDateString('en-US', {
					month: 'short',
					day: 'numeric'
				});
				tooltip = {
					x: param.point.x,
					y: param.point.y,
					text: `${d.value.toFixed(2)}${valueSuffix}`,
					date
				};
			});

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
		if (series && data) {
			series.setData(data);
			chart?.timeScale().fitContent();
		}
	});
</script>

<div class="relative w-full" style="height: {height}px">
	<div bind:this={el} class="absolute inset-0"></div>
	{#if tooltip}
		<div
			class="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-[130%] rounded-full px-3 py-1 text-[11px] font-semibold whitespace-nowrap shadow-card {dark
				? 'bg-white text-ink'
				: 'bg-ink text-white'}"
			style="left: {tooltip.x}px; top: {tooltip.y}px"
		>
			<span class="tabular">{tooltip.text}</span>
			<span class="ml-1.5 opacity-60">{tooltip.date}</span>
		</div>
	{/if}
</div>
