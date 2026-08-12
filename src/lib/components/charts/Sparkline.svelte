<script lang="ts">
	import type { EquityPoint } from '$lib/agents/performance';

	let {
		data,
		width = 120,
		height = 36,
		stroke = 'var(--spark-stroke)'
	}: { data: EquityPoint[]; width?: number; height?: number; stroke?: string } = $props();

	const path = $derived.by(() => {
		if (data.length < 2) return '';
		const values = data.map((d) => d.value);
		const min = Math.min(...values);
		const max = Math.max(...values);
		const span = max - min || 1;
		const pad = 2;
		return values
			.map((v, i) => {
				const x = pad + (i / (values.length - 1)) * (width - pad * 2);
				const y = pad + (1 - (v - min) / span) * (height - pad * 2);
				return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
			})
			.join(' ');
	});
</script>

<svg {width} {height} viewBox="0 0 {width} {height}" aria-hidden="true" class="shrink-0">
	<path d={path} fill="none" {stroke} stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
</svg>
