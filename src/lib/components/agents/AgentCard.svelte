<script lang="ts">
	import type { Agent } from '$lib/agents/types';
	import { CATEGORY_META } from '$lib/agents/types';
	import { POOLS } from '$lib/chain/contracts';
	import { equityCurve } from '$lib/agents/performance';
	import { usd, pct } from '$lib/utils/format';
	import Icon from '$lib/components/ui/Icon.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import TokenIcon from '$lib/components/ui/TokenIcon.svelte';
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

	/** monogram from the camel-case capitals: RangeKeeper -> RK */
	const initials = $derived.by(() => {
		const caps = agent.name.match(/[A-Z]/g) ?? [];
		return (caps.length >= 2 ? caps.slice(0, 2).join('') : agent.name.slice(0, 2)).toUpperCase();
	});

	/** tokens the agent actually touches, for the venue row */
	const tokens = $derived.by(() => {
		if (agent.poolId) {
			const p = POOLS[agent.poolId];
			return [p.token0, p.token1];
		}
		if (agent.category === 'grid' && agent.feedSymbol) return [agent.feedSymbol, 'USDT'];
		if (agent.venusSymbols?.length) {
			return agent.venusSymbols.map((s) => s.replace(/^v/, '')).slice(0, 3);
		}
		return agent.feedSymbol ? [agent.feedSymbol] : [];
	});

	const risk = $derived(
		agent.riskLevel <= 2
			? { label: 'Low', dot: 'bg-good' }
			: agent.riskLevel === 3
				? { label: 'Medium', dot: 'bg-warn' }
				: { label: 'High', dot: 'bg-crit' }
	);
</script>

<article
	class="group relative flex h-full flex-col rounded-card border bg-card p-5 shadow-card transition-all duration-300 [transition-timing-function:var(--ease-out-quart)] hover:-translate-y-1 hover:shadow-lift {selected
		? 'border-cta'
		: 'border-transparent'}"
>
	<!-- identity row -->
	<div class="flex items-start gap-3">
		<span class="relative shrink-0">
			<span
				class="monogram grid size-10 place-items-center rounded-xl bg-accent-tint text-[15px] font-bold text-accent"
			>
				{initials}
			</span>
			<span
				class="absolute -right-1.5 -bottom-1.5 grid size-5 place-items-center rounded-full bg-cta text-cta-fg ring-2 ring-card"
				title={meta.label}
			>
				<Icon name={meta.icon} size={11} strokeWidth={2.4} />
			</span>
		</span>
		<div class="min-w-0 flex-1">
			<div class="flex items-center gap-2">
				<a href="/agents/{agent.id}" class="truncate text-[15px] font-bold hover:text-accent">
					{agent.name}
				</a>
				<Badge kind={agent.network === 'mainnet' ? 'mainnet' : 'testnet'} />
			</div>
			<p class="mt-0.5 truncate text-[12px] text-faint">
				{meta.label} · {agent.operator} · v{agent.version}
			</p>
		</div>
		{#if selectable}
			<button
				onclick={() => ontoggle?.(agent.id)}
				aria-pressed={selected}
				title={selected ? 'Remove from compare' : 'Add to compare'}
				class="grid size-7 shrink-0 place-items-center rounded-lg border transition-all duration-200 {selected
					? 'border-cta bg-cta text-cta-fg'
					: 'border-line text-faint hover:border-line-strong hover:text-ink'}"
			>
				<Icon name={selected ? 'check' : 'plus'} size={13} strokeWidth={2.2} />
			</button>
		{/if}
	</div>

	<p class="mt-3 line-clamp-1 text-[13px] text-sub">{agent.tagline}</p>

	<!-- venue -->
	<div class="mt-2.5 flex items-center gap-2 text-[12px] text-faint">
		<span class="flex items-center -space-x-1.5">
			{#each tokens as t (t)}
				<TokenIcon symbol={t} size={18} class="rounded-full ring-2 ring-card" />
			{/each}
		</span>
		<span class="truncate">{agent.venue}</span>
	</div>

	<!-- headline metric -->
	<div class="mt-4 flex items-end justify-between gap-4 border-t border-line pt-4">
		{#if isMonitor}
			<div>
				<p class="text-[11px] font-medium text-faint">Liquidations · {agent.metrics.users.toLocaleString()} protected</p>
				<p class="tabular mt-0.5 text-2xl font-bold text-good-text">0</p>
			</div>
			<div class="text-right">
				<p class="text-[11px] font-medium text-faint">Uptime 90d</p>
				<p class="tabular mt-0.5 text-lg font-bold">{agent.metrics.uptime}%</p>
			</div>
		{:else}
			<div>
				<p class="flex items-center gap-1.5 text-[11px] font-medium text-faint">
					30d APR <Badge kind="backtest" />
				</p>
				<p class="tabular mt-0.5 text-2xl font-bold {agent.metrics.apr30d >= 0 ? 'text-good-text' : 'text-crit'}">
					{pct(agent.metrics.apr30d)}
				</p>
			</div>
			<Sparkline data={spark} width={112} height={36} />
		{/if}
	</div>

	<!-- fact row -->
	<dl class="mt-4 grid grid-cols-3 gap-2 border-t border-line pt-3.5 pb-4 text-[12px]">
		<div>
			<dt class="text-faint">TVL</dt>
			<dd class="tabular mt-0.5 font-semibold">{usd(agent.metrics.tvlUsd, { compact: true })}</dd>
		</div>
		<div>
			<dt class="text-faint">Users</dt>
			<dd class="tabular mt-0.5 font-semibold">{agent.metrics.users.toLocaleString()}</dd>
		</div>
		<div>
			<dt class="text-faint">Risk</dt>
			<dd class="mt-0.5 flex items-center gap-1.5 font-semibold" title="Risk level {agent.riskLevel} of 5">
				<span class="size-1.5 rounded-full {risk.dot}"></span>{risk.label}
			</dd>
		</div>
	</dl>

	<!-- footer -->
	<div class="mt-auto flex items-center justify-between border-t border-line pt-3.5">
		<span class="text-[12px] font-semibold text-sub">{agent.fee.label}</span>
		<a
			href="/agents/{agent.id}"
			class="inline-flex items-center gap-1 rounded-full bg-cta px-4 py-1.5 text-[12px] font-semibold text-cta-fg transition-transform group-hover:scale-[1.03]"
		>
			View & hire <Icon name="chevron-right" size={13} />
		</a>
	</div>
</article>
