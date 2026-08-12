<script lang="ts">
	/** Animated number, counts from 0 on mount, then eases to any new value. */
	import { onMount } from 'svelte';

	let {
		value,
		format = (n: number) => Math.round(n).toLocaleString(),
		duration = 1300,
		class: cls = ''
	}: {
		value: number;
		format?: (n: number) => string;
		duration?: number;
		class?: string;
	} = $props();

	let display = $state(0);
	let raf = 0;
	let mounted = $state(false);

	function animate(from: number, to: number, ms: number) {
		cancelAnimationFrame(raf);
		if (
			typeof window !== 'undefined' &&
			window.matchMedia('(prefers-reduced-motion: reduce)').matches
		) {
			display = to;
			return;
		}
		const t0 = performance.now();
		const tick = (t: number) => {
			const p = Math.min(1, (t - t0) / ms);
			const eased = 1 - Math.pow(1 - p, 4);
			display = from + (to - from) * eased;
			if (p < 1) raf = requestAnimationFrame(tick);
		};
		raf = requestAnimationFrame(tick);
	}

	onMount(() => {
		animate(0, value, duration);
		mounted = true;
		return () => cancelAnimationFrame(raf);
	});

	// live updates after mount ease from the current display value
	$effect(() => {
		const target = value;
		if (mounted) animate(display, target, 500);
	});
</script>

<span class="tabular {cls}">{format(display)}</span>
