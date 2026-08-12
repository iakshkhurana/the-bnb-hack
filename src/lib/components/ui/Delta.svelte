<script lang="ts">
	let {
		value,
		suffix = '%',
		solid = false
	}: { value: number; suffix?: string; solid?: boolean } = $props();

	const up = $derived(value >= 0);
	const label = $derived(`${up ? '+' : ''}${value.toFixed(1)}${suffix}`);
</script>

{#if solid}
	<span
		class="tabular inline-flex items-center gap-0.5 rounded-full bg-cta px-2 py-0.5 text-[11px] font-semibold text-cta-fg"
	>
		{label}
	</span>
{:else}
	<span
		class="tabular inline-flex items-center gap-0.5 text-[13px] font-semibold {up
			? 'text-good-text'
			: 'text-crit'}"
	>
		<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
			{#if up}<path d="M7 17 17 7M8 7h9v9" />{:else}<path d="M7 7l10 10M17 8v9H8" />{/if}
		</svg>
		{label}
	</span>
{/if}
