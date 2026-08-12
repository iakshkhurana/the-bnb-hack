<script lang="ts">
	/**
	 * Segmented allocation bar + legend list, in the reference style.
	 * Identity is carried by the labelled legend rows; the ordinal blue
	 * ramp (validated) + neutral gray links row to segment.
	 */
	import { usd } from '$lib/utils/format';

	interface Slice {
		label: string;
		value: number; // USD
	}

	let { slices }: { slices: Slice[] } = $props();

	const COLORS = ['#0300a6', '#4d45ff', '#b3afff', '#929aa5'];
	const total = $derived(slices.reduce((s, x) => s + x.value, 0) || 1);
</script>

<div>
	<div class="flex h-3.5 w-full gap-[2px] overflow-hidden rounded-full">
		{#each slices as s, i (s.label)}
			<div
				class="h-full rounded-[3px] first:rounded-l-full last:rounded-r-full"
				style="width: {(s.value / total) * 100}%; background: {COLORS[i % COLORS.length]}"
				title="{s.label} · {usd(s.value, { compact: true })}"
			></div>
		{/each}
	</div>
	<ul class="mt-4 space-y-2.5">
		{#each slices as s, i (s.label)}
			<li class="flex items-center gap-2.5 text-[13px]">
				<span class="size-2.5 rounded-[4px]" style="background: {COLORS[i % COLORS.length]}"></span>
				<span class="font-medium text-ink">{s.label}</span>
				<span class="text-faint">{((s.value / total) * 100).toFixed(0)}%</span>
				<span class="tabular ml-auto font-semibold">{usd(s.value, { compact: false, decimals: 2 })}</span>
			</li>
		{/each}
	</ul>
</div>
