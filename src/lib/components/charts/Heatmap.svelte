<script lang="ts">
	/**
	 * Activity heatmap — weeks × 7 grid, sequential blue ramp (magnitude).
	 * Zero-days recede to a neutral wash; hover shows the exact count.
	 */
	let { data, label = 'actions' }: { data: number[][]; label?: string } = $props();

	// sequential blue steps from the validated palette
	const RAMP = ['#cde2fb', '#9ec5f4', '#6da7ec', '#3987e5', '#256abf', '#104281'];
	const ZERO = '#eef0f3';

	const max = $derived(Math.max(1, ...data.flat()));

	function color(v: number): string {
		if (v === 0) return ZERO;
		const idx = Math.min(RAMP.length - 1, Math.floor((v / max) * RAMP.length));
		return RAMP[idx];
	}

	let hover = $state<{ week: number; day: number; v: number } | null>(null);

	const CELL = 13;
	const GAP = 3;
	const weeks = $derived(data.length);

	const monthLabels = $derived.by(() => {
		const labels: { week: number; text: string }[] = [];
		const now = Date.now();
		let last = '';
		for (let w = 0; w < weeks; w++) {
			const d = new Date(now - (weeks - 1 - w) * 7 * 86_400_000);
			const m = d.toLocaleDateString('en-US', { month: 'short' });
			if (m !== last && w < weeks - 1) {
				labels.push({ week: w, text: m });
				last = m;
			}
		}
		return labels;
	});
</script>

<div class="relative">
	<svg
		width={weeks * (CELL + GAP)}
		height={7 * (CELL + GAP) + 16}
		class="max-w-full"
		role="img"
		aria-label="Activity heatmap"
	>
		{#each data as week, w (w)}
			{#each week as v, d (d)}
				<rect
					x={w * (CELL + GAP)}
					y={d * (CELL + GAP)}
					width={CELL}
					height={CELL}
					rx="3.5"
					fill={color(v)}
					onmouseenter={() => (hover = { week: w, day: d, v })}
					onmouseleave={() => (hover = null)}
					role="presentation"
				/>
			{/each}
		{/each}
		{#each monthLabels as m (m.week)}
			<text
				x={m.week * (CELL + GAP)}
				y={7 * (CELL + GAP) + 11}
				class="fill-faint text-[9px] font-medium"
			>
				{m.text}
			</text>
		{/each}
	</svg>
	{#if hover}
		<div
			class="pointer-events-none absolute z-10 -translate-x-1/2 rounded-full bg-ink px-2.5 py-1 text-[10px] font-semibold text-white shadow-card"
			style="left: {hover.week * (CELL + GAP) + CELL / 2}px; top: {hover.day * (CELL + GAP) - 26}px"
		>
			{hover.v}
			{label}
		</div>
	{/if}
</div>
