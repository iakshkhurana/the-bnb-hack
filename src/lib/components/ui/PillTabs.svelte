<script lang="ts">
	let {
		options,
		value = $bindable(),
		dark = false
	}: {
		options: { label: string; value: string }[];
		value: string;
		dark?: boolean;
	} = $props();
</script>

<div
	class="inline-flex items-center gap-0.5 rounded-full p-1 {dark
		? 'bg-night-2'
		: 'border border-line bg-page'}"
	role="tablist"
>
	{#each options as opt (opt.value)}
		<button
			role="tab"
			aria-selected={value === opt.value}
			onclick={() => (value = opt.value)}
			class="rounded-full px-3 py-1 text-[12px] font-semibold transition-colors duration-150 {value ===
			opt.value
				? 'bg-cta text-cta-fg'
				: dark
					? 'text-white/50 hover:text-white'
					: 'text-sub hover:text-ink'}"
		>
			{opt.label}
		</button>
	{/each}
</div>
