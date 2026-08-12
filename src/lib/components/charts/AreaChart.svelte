<script lang="ts">
	import { onMount } from 'svelte';
	import { theme } from '$lib/stores/theme.svelte';
	import type { EquityPoint } from '$lib/agents/performance';

	let {
		data,
		dark = false,
		height = 260,
		valueSuffix = ''
	}: { data: EquityPoint[]; dark?: boolean; height?: number; valueSuffix?: string } = $props();

	let el: HTMLDivElement;
	let tooltip = $state<{ x: number; y: number; text: string; date: string } | null>(null);
	let ready = $state(false);
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let series: any = null;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let chart: any = null;

	/** dark = rendered on a night card; otherwise follow the app theme */
	const onDarkSurface = $derived(dark || theme.mode === 'dark');
	const palette = $derived({
		text: onDarkSurface ? 'rgba(255,255,255,0.5)' : '#929aa5',
		grid: onDarkSurface ? 'rgba(255,255,255,0.07)' : '#efeff1',
		line: onDarkSurface ? '#f0b90b' : '#d9a509',
		fill: onDarkSurface ? 'rgba(240,185,11,0.16)' : 'rgba(240,185,11,0.18)',
		crosshair: onDarkSurface ? 'rgba(255,255,255,0.35)' : '#c9ced6'
	});

	onMount(() => {
		let disposed = false;

		(async () => {
			try {
				const { createChart, AreaSeries, ColorType, CrosshairMode } = await import(
					'lightweight-charts'
				);
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
					timeScale: { borderVisible: false, timeVisible: false },
					crosshair: {
						mode: CrosshairMode.Magnet,
						vertLine: { color: palette.crosshair, labelVisible: false },
						horzLine: { visible: false, labelVisible: false }
					},
					handleScroll: false,
					handleScale: false
				});

				series = chart.addSeries(AreaSeries, {
					lineColor: palette.line,
					lineWidth: 2,
					topColor: palette.fill,
					bottomColor: 'rgba(0,0,0,0)',
					priceLineVisible: false,
					lastValueVisible: true,
					crosshairMarkerRadius: 4
				});

				chart.subscribeCrosshairMove(
					(param: {
						time?: unknown;
						point?: { x: number; y: number };
						seriesData: Map<unknown, { value?: number }>;
					}) => {
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
					}
				);

				ready = true;
			} catch (err) {
				console.error('[AreaChart] init failed', err);
			}
		})();

		return () => {
			disposed = true;
			chart?.remove();
			chart = null;
			series = null;
		};
	});

	// data → series (re-runs when the chart becomes ready OR data changes)
	$effect(() => {
		if (!ready || !series) return;
		const points = $state.snapshot(data) as EquityPoint[];
		if (!points.length) return;
		series.setData(points);
		chart?.timeScale().fitContent();
	});

	// theme → chart colors
	$effect(() => {
		if (!ready || !chart) return;
		chart.applyOptions({
			layout: { textColor: palette.text },
			grid: { horzLines: { color: palette.grid } },
			crosshair: { vertLine: { color: palette.crosshair } }
		});
		series?.applyOptions({ lineColor: palette.line, topColor: palette.fill });
	});
</script>

<div class="relative w-full" style="height: {height}px">
	<div bind:this={el} class="absolute inset-0"></div>
	{#if tooltip}
		<div
			class="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-[130%] rounded-full px-3 py-1 text-[11px] font-semibold whitespace-nowrap shadow-card {dark
				? 'bg-white text-[#0b0c0f]'
				: 'bg-ink text-page'}"
			style="left: {tooltip.x}px; top: {tooltip.y}px"
		>
			<span class="tabular">{tooltip.text}</span>
			<span class="ml-1.5 opacity-60">{tooltip.date}</span>
		</div>
	{/if}
</div>
