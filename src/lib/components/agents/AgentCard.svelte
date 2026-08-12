<script lang="ts">
	import type { Agent } from '$lib/agents/types';
	import { CATEGORY_META } from '$lib/agents/types';
	import { equityCurve } from '$lib/agents/performance';
	import { usd, pct } from '$lib/utils/format';
	import Icon from '$lib/components/ui/Icon.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import Sparkline from '$lib/components/charts/Sparkline.svelte';

	let {
		agent,
		selectable = false,
		selected = false,
		ontoggle = undefined
	}: {
		agent: Agent;
		selectable?: boolean;
		selected?: boolean;
		ontoggle?: (id: string) => void;
	} = $props();

	const spark = $derived(equityCurve(agent, 30));
	const meta = $derived(CATEGORY_META[agent.category]);
	const isMonitor = $derived(agent.category === 'health');
</script>

<div
	class="group relative flex flex-col rounded-card border bg-card p-5 shadow-card transition-all duration-300 [transition-timing-function:var(--ease-out-quart)] hover:-translate-y-1 hover:shadow-lift {selected
		? 'border-accent'
		: 'border-transparent'}"
>
	<div class="mb-3 flex items-start gap-3">
		<span class="grid size-10 shrink-0 place-items-center rounded-xl bg-ink text-white">
			<Icon name={meta.icon} size={18} />
		</span>
		<div class="min-w-0">
			<div class="flex items-center gap-2">
				<a href="/agents/{agent.id}" class="truncate text-[15px] font-bold hover:underline">
					{agent.name}
				</a>
				<Badge kind={agent.network === 'mainnet' ? 'mainnet' : 'testnet'} />
			</div>
			<p class="text-[12px] text-faint">{meta.label} · by {agent.operator}</p>
		</div>
		{#if selectable}
			<label class="ml-auto flex cursor-pointer items-center gap-1.5 text-[11px] font-semibold text-sub">
				<input
					type="checkbox"
					checked={selected}
					onchange={() => ontoggle?.(agent.id)}
					class="size-3.5 accent-ink"
				/>
				Compare
			</label>
		{/if}
	</div>

	<p class="mb-4 line-clamp-2 min-h-[2.4em] text-[13px] leading-snug text-sub">{agent.tagline}</p>

	<div class="mb-4 flex items-end justify-between gap-3 rounded-2xl bg-page p-3.5">
		{#if isMonitor}
			<div>
				<p class="text-[11px] font-medium text-faint">Positions protected</p>
				<p class="tabular text-xl font-bold">{agent.metrics.users.toLocaleString()}</p>
			</div>
			<div class="text-right">
				<p class="text-[11px] font-medium text-faint">Liquidations</p>
				<p class="text-xl font-bold text-good-text">0</p>
			</div>
		{:else}
			<div>
				<div class="flex items-center gap-1.5">
					<p class="text-[11px] font-medium text-faint">30d APR</p>
					<Badge kind={agent.provenance.performance === 'backtest' ? 'backtest' : 'onchain'} />
				</div>
				<p class="tabular text-xl font-bold {agent.metrics.apr30d >= 0 ? 'text-good-text' : 'text-crit'}">
					{pct(agent.metrics.apr30d)}
				</p>
			</div>
			<Sparkline data={spark} width={110} height={34} />
		{/if}
	</div>

	<div class="mb-4 grid grid-cols-3 gap-2 text-[12px]">
		<div>
			<p class="text-faint">TVL</p>
			<p class="tabular font-semibold">{usd(agent.metrics.tvlUsd, { compact: true })}</p>
		</div>
		<div>
			<p class="text-faint">Users</p>
			<p class="tabular font-semibold">{agent.metrics.users.toLocaleString()}</p>
		</div>
		<div>
			<p class="text-faint">Risk</p>
			<p class="mt-1 flex gap-0.5" title="Risk level {agent.riskLevel} of 5">
				{#each Array(5) as _, i (i)}
					<span class="h-1.5 w-3 rounded-full {i < agent.riskLevel ? 'bg-ink' : 'bg-line'}"></span>
				{/each}
			</p>
		</div>
	</div>

	<div class="mt-auto flex items-center justify-between border-t border-line pt-3.5">
		<span class="text-[12px] font-semibold text-sub">{agent.fee.label}</span>
		<a
			href="/agents/{agent.id}"
			class="inline-flex items-center gap-1 rounded-full bg-ink px-4 py-1.5 text-[12px] font-semibold text-white transition-transform group-hover:scale-[1.03]"
		>
			View & hire <Icon name="chevron-right" size={13} />
		</a>
	</div>
</div>
