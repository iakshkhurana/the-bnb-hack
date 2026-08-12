<script lang="ts">
	import { onMount } from 'svelte';
	import { CATEGORY_META } from '$lib/agents/types';
	import {
		equityCurve,
		activityLog,
		activityHeatmap,
		curveStats,
		type EquityPoint
	} from '$lib/agents/performance';
	import { market } from '$lib/stores/market.svelte';
	import { wallet } from '$lib/wallet/wallet.svelte';
	import { sessionStore } from '$lib/sessions/sessions.svelte';
	import { usd, pct, num, timeAgo, shortAddr, bscScanAddr } from '$lib/utils/format';
	import Card from '$lib/components/ui/Card.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import Delta from '$lib/components/ui/Delta.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import PillTabs from '$lib/components/ui/PillTabs.svelte';
	import AreaChart from '$lib/components/charts/AreaChart.svelte';
	import CandleChart from '$lib/components/charts/CandleChart.svelte';
	import Heatmap from '$lib/components/charts/Heatmap.svelte';
	import HireModal from '$lib/components/hire/HireModal.svelte';
	import CountUp from '$lib/components/ui/CountUp.svelte';
	import TokenIcon from '$lib/components/ui/TokenIcon.svelte';

	let { data } = $props();
	const agent = $derived(data.agent);

	$effect(() => market.subscribe());

	let hireOpen = $state(false);
	let chartWindow = $state('90');

	const meta = $derived(CATEGORY_META[agent.category]);
	const curve = $derived(equityCurve(agent, Number(chartWindow)));
	const stats = $derived(curveStats(curve));
	const log = $derived(activityLog(agent, 12));
	const heat = $derived(activityHeatmap(agent));
	const activeSession = $derived(sessionStore.activeFor(wallet.address, agent.id));

	const pool = $derived(market.snapshot.pools.find((p) => p.id === agent.poolId));
	const venusMarkets = $derived(
		market.snapshot.venus.filter((v) => agent.venusSymbols?.includes(v.symbol))
	);
	const feed = $derived(market.snapshot.feeds.find((f) => f.symbol === agent.feedSymbol));

	// grid agents: candles + level overlay around live price
	let candles = $state<{ time: number; open: number; high: number; low: number; close: number }[]>([]);
	onMount(async () => {
		if (agent.category !== 'grid' || !agent.feedSymbol) return;
		try {
			const res = await fetch(`/api/klines/${agent.feedSymbol}USDT?interval=1h&limit=140`);
			if (res.ok) candles = await res.json();
		} catch {
			/* chart section hides */
		}
	});
	const gridLevels = $derived.by(() => {
		if (!candles.length) return [];
		const price = candles[candles.length - 1].close;
		const spacing = 0.015;
		return Array.from({ length: 9 }, (_, i) => price * (1 + (i - 4) * spacing));
	});

	const isMonitor = $derived(agent.category === 'health');

	const initials = $derived.by(() => {
		const caps = agent.name.match(/[A-Z]/g) ?? [];
		return (caps.length >= 2 ? caps.slice(0, 2).join('') : agent.name.slice(0, 2)).toUpperCase();
	});
</script>

<svelte:head>
	<title>{agent.name} · HIVE</title>
</svelte:head>

<div class="py-4">
	<a href="/marketplace" class="mb-6 inline-flex items-center gap-1.5 text-[13px] font-semibold text-sub hover:text-ink">
		<Icon name="chevron-right" size={14} class="rotate-180" /> Marketplace
	</a>

	<!-- ═══ Resume header ═══ -->
	<div class="mb-6 flex flex-wrap items-start gap-5">
		<span class="relative shrink-0">
			<span
				class="monogram grid size-16 place-items-center rounded-card bg-accent-tint text-2xl font-bold text-accent"
			>
				{initials}
			</span>
			<span
				class="absolute -right-2 -bottom-2 grid size-7 place-items-center rounded-full bg-cta text-cta-fg ring-4 ring-page"
				title={meta.label}
			>
				<Icon name={meta.icon} size={14} strokeWidth={2.2} />
			</span>
		</span>
		<div class="min-w-0 flex-1">
			<div class="flex flex-wrap items-center gap-2.5">
				<h1 class="text-3xl font-bold tracking-tight">{agent.name}</h1>
				<Badge kind={agent.network === 'mainnet' ? 'mainnet' : 'testnet'} />
				{#if agent.erc8183}
					<span class="rounded-full border border-line bg-card px-2 py-0.5 text-[10px] font-bold text-sub" title="Hireable agent-to-agent via ERC-8183">ERC-8183</span>
				{/if}
				{#if agent.x402}
					<span class="rounded-full border border-line bg-card px-2 py-0.5 text-[10px] font-bold text-sub" title="Sells its output per-call over x402/B402">x402</span>
				{/if}
			</div>
			<p class="mt-1 text-[15px] text-sub">{agent.tagline}</p>
			<div class="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-faint">
				<span>{meta.label}</span>
				<span>by <b class="text-sub">{agent.operator}</b></span>
				<span>v{agent.version} · since {new Date(agent.launched).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
				<a href={bscScanAddr(agent.wallet, agent.network === 'testnet')} target="_blank" rel="noreferrer" class="tabular inline-flex items-center gap-1 text-accent hover:underline">
					{shortAddr(agent.wallet)} <Icon name="external" size={11} />
				</a>
			</div>
		</div>
		<div class="w-full sm:w-auto">
			{#if activeSession}
				<Button variant="ghost" size="lg" href="/dashboard" class="w-full sm:w-auto">
					<span class="size-2 rounded-full bg-good"></span> Session active, Mission Control
				</Button>
			{:else}
				<Button variant="primary" size="lg" class="w-full sm:w-auto" onclick={() => (hireOpen = true)}>
					<Icon name="key" size={16} /> Hire {agent.name}
				</Button>
			{/if}
		</div>
	</div>

	<!-- ═══ Stat strip ═══ -->
	<div class="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-5">
		<Card class="!p-4">
			<p class="flex items-center gap-1.5 text-[11px] font-medium text-faint">
				{isMonitor ? 'Protected positions' : '30d APR'}
				{#if !isMonitor}<Badge kind="backtest" />{/if}
			</p>
			<p class="tabular mt-1.5 text-xl font-bold {isMonitor ? '' : agent.metrics.apr30d >= 0 ? 'text-good-text' : 'text-crit'}">
				{isMonitor ? agent.metrics.users.toLocaleString() : pct(agent.metrics.apr30d)}
			</p>
		</Card>
		<Card class="!p-4">
			<p class="text-[11px] font-medium text-faint">{isMonitor ? 'Liquidations suffered' : 'Max drawdown'}</p>
			<p class="tabular mt-1.5 text-xl font-bold">
				{isMonitor ? '0' : `${agent.metrics.maxDrawdown.toFixed(1)}%`}
			</p>
		</Card>
		<Card class="!p-4">
			<p class="text-[11px] font-medium text-faint">{agent.metrics.winRate != null ? 'Win rate' : 'Sharpe'}</p>
			<p class="tabular mt-1.5 text-xl font-bold">
				{agent.metrics.winRate != null ? `${agent.metrics.winRate.toFixed(1)}%` : (agent.metrics.sharpe?.toFixed(1) ?? '-')}
			</p>
		</Card>
		<Card class="!p-4">
			<p class="text-[11px] font-medium text-faint">TVL managed</p>
			<p class="mt-1.5 text-xl font-bold">
				<CountUp value={agent.metrics.tvlUsd} format={(v) => usd(v, { compact: true })} />
			</p>
		</Card>
		<Card class="!p-4">
			<p class="text-[11px] font-medium text-faint">Uptime 90d</p>
			<p class="mt-1.5 text-xl font-bold">
				<CountUp value={agent.metrics.uptime} format={(v) => `${v.toFixed(1)}%`} />
			</p>
		</Card>
	</div>

	<div class="grid gap-4 lg:grid-cols-[1.65fr_1fr]">
		<!-- ═══ Left column ═══ -->
		<div class="space-y-4">
			{#if !isMonitor}
				<Card>
					<div class="mb-3 flex flex-wrap items-center justify-between gap-3">
						<div class="flex items-center gap-2">
							<h2 class="text-[15px] font-bold">Strategy performance</h2>
							<Badge kind="backtest" />
						</div>
						<PillTabs options={[{ label: '30d', value: '30' }, { label: '60d', value: '60' }, { label: '90d', value: '90' }]} bind:value={chartWindow} />
					</div>
					<div class="mb-3 flex gap-5 text-[13px]">
						<span class="flex items-center gap-1.5 text-sub">Return <Delta value={stats.totalReturn} /></span>
						<span class="text-sub">Worst drawdown <b class="tabular text-ink">{stats.maxDrawdown.toFixed(1)}%</b></span>
					</div>
					<AreaChart data={curve} height={250} />
					<p class="mt-2 text-[11px] text-faint">
						Indexed to 100 · simulated against real historical market data · becomes ON-CHAIN when this agent's mainnet history is indexed
					</p>
				</Card>
			{/if}

			{#if agent.category === 'grid' && candles.length}
				<Card>
					<div class="mb-3 flex items-center gap-2">
						<h2 class="text-[15px] font-bold">Live grid placement</h2>
						<Badge kind="live" />
					</div>
					<CandleChart data={candles} {gridLevels} height={300} />
					<p class="mt-2 text-[11px] text-faint">
						Real {agent.feedSymbol}/USDT hourly candles · dotted lines are this agent's current grid levels around live price
					</p>
				</Card>
			{/if}

			<Card>
				<div class="mb-4 flex items-center gap-2">
					<h2 class="text-[15px] font-bold">Work log</h2>
					<Badge kind="testnet" />
				</div>
				<ul class="divide-y divide-line">
					{#each log as entry (entry.id)}
						<li class="flex items-start gap-3.5 py-3 first:pt-0 last:pb-0">
							<span class="mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-page">
								<Icon name={entry.kind === 'Heartbeat' || entry.kind === 'Scan' ? 'clock' : 'bolt'} size={14} class="text-sub" />
							</span>
							<div class="min-w-0 flex-1">
								<div class="flex flex-wrap items-center gap-x-2 gap-y-0.5">
									<span class="rounded-full bg-page px-2 py-0.5 text-[10px] font-bold text-sub">{entry.kind}</span>
									<p class="text-[13px] font-semibold">{entry.summary}</p>
								</div>
								<p class="mt-0.5 text-[12px] leading-snug text-sub">{entry.detail}</p>
							</div>
							<div class="shrink-0 text-right">
								<p class="text-[11px] text-faint">{timeAgo(entry.at)}</p>
								<p class="tabular text-[11px] text-faint">gas {usd(entry.gasUsd, { decimals: 2 })}</p>
								{#if entry.deltaUsd != null}
									<Delta value={entry.deltaUsd} suffix=" $" />
								{/if}
							</div>
						</li>
					{/each}
				</ul>
			</Card>

			<Card>
				<div class="mb-4 flex items-center justify-between">
					<h2 class="text-[15px] font-bold">Activity <span class="ml-1 font-medium text-faint">· {num(agent.metrics.actions30d, 0)} actions in 30d</span></h2>
				</div>
				<div class="overflow-x-auto">
					<Heatmap data={heat} />
				</div>
			</Card>
		</div>

		<!-- ═══ Right column ═══ -->
		<div class="space-y-4">
			<Card dark>
				<div class="mb-3 flex items-center gap-2">
					<h2 class="text-[15px] font-bold">Live venue</h2>
					<Badge kind="live" class="border-white/10 bg-white/10" />
				</div>
				<p class="mb-4 text-[12px] text-white/50">{agent.venue}</p>
				{#if pool}
					<div class="mb-3 flex items-center justify-between">
						<span class="flex items-center gap-2 text-[12px] text-white/50">
							<span class="flex items-center -space-x-2">
								<TokenIcon symbol={pool.token0} size={22} />
								<TokenIcon symbol={pool.token1} size={22} />
							</span>
							{pool.label}
						</span>
						<span class="tabular text-xl font-bold">{usd(pool.priceUsd)}</span>
					</div>
					<div class="flex items-baseline justify-between text-[12px] text-white/50">
						<span>Current tick</span><span class="tabular text-white">{pool.tick}</span>
					</div>
				{/if}
				{#if feed && !pool}
					<div class="mb-3 flex items-center justify-between">
						<span class="flex items-center gap-2 text-[12px] text-white/50">
							<TokenIcon symbol={feed.symbol} size={22} />
							{feed.label}
						</span>
						<span class="tabular text-xl font-bold">{usd(feed.price)}</span>
					</div>
				{/if}
				{#each venusMarkets as v (v.symbol)}
					<div class="flex items-center justify-between border-t border-white/10 py-2.5 text-[13px] first:border-0">
						<span class="flex items-center gap-2 text-white/60">
							<TokenIcon symbol={v.underlying} size={20} />
							{v.label} supply
						</span>
						<span class="tabular font-bold text-good">{v.supplyApy.toFixed(2)}%</span>
					</div>
				{/each}
				<p class="mt-3 border-t border-white/10 pt-3 text-[11px] text-white/35">
					Block #{num(market.snapshot.block, 0)} · refreshes every 15s
				</p>
			</Card>

			<Card>
				<h2 class="mb-3 text-[15px] font-bold">How it works</h2>
				<p class="mb-4 text-[13px] leading-relaxed text-sub">{agent.description}</p>
				<ol class="space-y-2.5">
					{#each agent.strategy as step, i (step)}
						<li class="flex gap-2.5 text-[13px]">
							<span class="grid size-5 shrink-0 place-items-center rounded-full bg-page text-[10px] font-bold text-sub">{i + 1}</span>
							<span class="text-sub">{step}</span>
						</li>
					{/each}
				</ol>
			</Card>

			<Card>
				<div class="mb-3 flex items-center gap-2">
					<Icon name="key" size={15} class="text-sub" />
					<h2 class="text-[15px] font-bold">Default leash</h2>
				</div>
				<dl class="space-y-2.5 text-[13px]">
					<div class="flex justify-between"><dt class="text-sub">Spend cap</dt><dd class="tabular font-bold">{agent.leash.spendCapBnb} BNB</dd></div>
					<div class="flex justify-between"><dt class="text-sub">Expiry</dt><dd class="font-bold">{agent.leash.expiryDays} days</dd></div>
					<div>
						<dt class="mb-1.5 text-sub">May only call</dt>
						<dd class="space-y-1.5">
							{#each agent.leash.allowlist as item (item.address)}
								<a href={bscScanAddr(item.address)} target="_blank" rel="noreferrer" class="flex items-center justify-between rounded-xl bg-page px-3 py-2 text-[12px] hover:bg-accent-tint">
									<span class="font-semibold">{item.label}</span>
									<span class="tabular flex items-center gap-1 text-faint">{shortAddr(item.address)} <Icon name="external" size={10} /></span>
								</a>
							{/each}
						</dd>
					</div>
				</dl>
				<p class="mt-3 text-[11px] leading-relaxed text-faint">
					You tune all three before signing. The session key can do exactly this, nothing else.
				</p>
			</Card>

			<Card>
				<h2 class="mb-3 text-[15px] font-bold">Fee</h2>
				<p class="text-lg font-bold">{agent.fee.label}</p>
				<p class="mt-1 text-[12px] text-sub">
					{agent.fee.type === 'performance'
						? 'Charged only on realised gains, nothing when it does not perform.'
						: agent.fee.type === 'per-action'
							? 'Micro-billed per completed action over x402.'
							: 'Flat subscription, cancel by revoking anytime.'}
				</p>
				{#if !activeSession}
					<Button variant="primary" size="md" class="mt-4 w-full" onclick={() => (hireOpen = true)}>
						<Icon name="key" size={14} /> Set the leash & hire
					</Button>
				{/if}
			</Card>
		</div>
	</div>
</div>

<HireModal {agent} bind:open={hireOpen} />
