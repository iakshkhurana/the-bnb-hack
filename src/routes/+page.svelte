<script lang="ts">
	import { AGENTS, byCategory } from '$lib/agents/registry';
	import { CATEGORIES, CATEGORY_META } from '$lib/agents/types';
	import { market } from '$lib/stores/market.svelte';
	import { usd, num, pct } from '$lib/utils/format';
	import type { EquityPoint } from '$lib/agents/performance';
	import { equityCurve } from '$lib/agents/performance';
	import Card from '$lib/components/ui/Card.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import Delta from '$lib/components/ui/Delta.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import PillTabs from '$lib/components/ui/PillTabs.svelte';
	import AreaChart from '$lib/components/charts/AreaChart.svelte';
	import Sparkline from '$lib/components/charts/Sparkline.svelte';
	import CountUp from '$lib/components/ui/CountUp.svelte';

	$effect(() => market.subscribe());

	// ── hero chart: real BNB/USD candles ──────────────────────────
	let range = $state('1M');
	let heroData = $state<EquityPoint[]>([]);

	const RANGES: Record<string, { interval: string; limit: number }> = {
		'1D': { interval: '15m', limit: 96 },
		'1W': { interval: '1h', limit: 168 },
		'1M': { interval: '4h', limit: 180 },
		'3M': { interval: '1d', limit: 90 }
	};

	async function loadHero(r: string) {
		const { interval, limit } = RANGES[r];
		try {
			const res = await fetch(`/api/klines/BNBUSDT?interval=${interval}&limit=${limit}`);
			if (!res.ok) return;
			const candles = (await res.json()) as { time: number; close: number }[];
			heroData = candles.map((c) => ({ time: c.time, value: c.close }));
		} catch {
			/* keep old data */
		}
	}

	$effect(() => {
		loadHero(range);
	});

	const bnb = $derived(market.snapshot.feeds.find((f) => f.symbol === 'BNB'));

	// ── aggregate stats across the registry ───────────────────────
	const totalTvl = AGENTS.reduce((s, a) => s + a.metrics.tvlUsd, 0);
	const totalActions = AGENTS.reduce((s, a) => s + a.metrics.actions30d, 0);
	const totalUsers = AGENTS.reduce((s, a) => s + a.metrics.users, 0);
	const avgGas = AGENTS.reduce((s, a) => s + a.metrics.avgGasUsd, 0) / AGENTS.length;

	const topByCategory = CATEGORIES.map((c) => {
		const list = byCategory(c).slice().sort((a, b) => b.metrics.tvlUsd - a.metrics.tvlUsd);
		return { category: c, meta: CATEGORY_META[c], top: list[0], count: list.length };
	});
</script>

<svelte:head>
	<title>HIVE, Hire on-chain agents on BNB Chain</title>
</svelte:head>

<!-- ═══ Hero ═══ -->
<section class="grid items-center gap-6 py-8 lg:grid-cols-[1.02fr_1fr] lg:gap-10 lg:py-12">
	<div class="rise">
		<p
			class="mb-4 inline-flex items-center gap-2 rounded-full border border-line bg-card px-3.5 py-1.5 text-[12px] font-semibold text-sub"
		>
			<span class="size-1.5 animate-pulse rounded-full bg-good"></span>
			The agent labor market for BNB Chain
		</p>
		<h1 class="text-4xl leading-[1.05] font-bold tracking-tight sm:text-5xl lg:text-[56px]">
			Hire agents.<br />Keep the keys.
		</h1>
		<p class="mt-5 max-w-md text-[15px] leading-relaxed text-sub">
			Every agent on HIVE has a verifiable resume, works inside a leash you set, spend cap,
			contract allowlist, expiry, and can be fired in one click. Rebalancing, grid trading,
			yield routing and liquidation protection, side by side.
		</p>
		<div class="mt-7 flex flex-wrap gap-3">
			<Button variant="primary" size="lg" href="/marketplace">
				Explore the marketplace <Icon name="arrow-up-right" size={16} />
			</Button>
			<Button variant="ghost" size="lg" href="/proof">See the proof</Button>
		</div>
		<div class="mt-7 flex flex-wrap items-center gap-2">
			<Badge kind="live" />
			<span class="text-[12px] text-faint">
				Chainlink · PancakeSwap V3 · Venus, read on-chain, block {market.snapshot.block
					? `#${num(market.snapshot.block, 0)}`
					: '…'}
			</span>
		</div>
	</div>

	<Card dark padded={false} class="rise p-5 [animation-delay:110ms] sm:p-6">
		<div class="mb-1 flex flex-wrap items-center justify-between gap-3">
			<div>
				<p class="flex items-center gap-2 text-[12px] font-medium text-white/50">
					BNB / USD <Badge kind="live" class="border-white/10 bg-white/10" />
				</p>
				<div class="mt-1 flex items-baseline gap-2.5">
					<span class="tabular text-3xl font-bold">
						{bnb?.price ? usd(bnb.price) : '...'}
					</span>
					{#if bnb?.change24h != null}
						<span class="rounded-full bg-white px-2 py-0.5">
							<Delta value={bnb.change24h} />
						</span>
					{/if}
				</div>
			</div>
			<PillTabs
				dark
				options={Object.keys(RANGES).map((r) => ({ label: r, value: r }))}
				bind:value={range}
			/>
		</div>
		<AreaChart data={heroData} dark height={250} valueSuffix=" $" />
		<p class="mt-2 text-[11px] text-white/35">
			Spot price via Chainlink on BSC · candles via public market data · refreshes live
		</p>
	</Card>
</section>

<!-- ═══ Stat tiles ═══ -->
<section class="rise grid grid-cols-2 gap-4 [animation-delay:200ms] lg:grid-cols-4">
	{#each [{ icon: 'wallet', label: 'Under agent management', value: totalTvl, format: (v: number) => usd(v, { compact: true }) }, { icon: 'bolt', label: 'Actions last 30 days', value: totalActions, format: (v: number) => num(v, 0) }, { icon: 'users', label: 'Active hirers', value: totalUsers, format: (v: number) => num(v, 0) }, { icon: 'gas', label: 'Avg gas per action', value: avgGas, format: (v: number) => usd(v, { decimals: 2 }) }] as stat (stat.label)}
		<Card>
			<div class="flex items-center gap-2 text-sub">
				<Icon name={stat.icon} size={15} />
				<p class="text-[12px] font-medium">{stat.label}</p>
			</div>
			<p class="mt-2 text-2xl font-bold tracking-tight">
				<CountUp value={stat.value} format={stat.format} />
			</p>
		</Card>
	{/each}
</section>

<!-- ═══ Category doors ═══ -->
<section class="mt-12">
	<div class="mb-5 flex items-end justify-between">
		<div>
			<h2 class="text-2xl font-bold tracking-tight">Four jobs. Twelve specialists.</h2>
			<p class="mt-1 text-[14px] text-sub">Every category first-class, pick the job, compare the agents.</p>
		</div>
		<a href="/marketplace" class="hidden items-center gap-1 text-[13px] font-semibold text-accent hover:underline sm:flex">
			View all <Icon name="chevron-right" size={14} />
		</a>
	</div>
	<div class="grid gap-4 sm:grid-cols-2">
		{#each topByCategory as door (door.category)}
			<a
				href="/marketplace?category={door.category}"
				class="group rounded-card border border-line bg-card p-6 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-rail"
			>
				<div class="mb-4 flex items-center justify-between">
					<span class="grid size-11 place-items-center rounded-2xl bg-cta text-cta-fg">
						<Icon name={door.meta.icon} size={20} />
					</span>
					<span class="rounded-full border border-line bg-page px-2.5 py-1 text-[11px] font-bold text-sub">
						{door.count} agents
					</span>
				</div>
				<h3 class="text-lg font-bold tracking-tight">{door.meta.label}</h3>
				<p class="mt-1.5 line-clamp-2 text-[13px] leading-snug text-sub">{door.meta.blurb}</p>
				<div class="mt-5 flex items-center justify-between rounded-2xl bg-page p-3.5">
					<div>
						<p class="text-[11px] text-faint">Top agent · {door.top.name}</p>
						{#if door.category === 'health'}
							<p class="text-[15px] font-bold text-good-text">0 liquidations</p>
						{:else}
							<p class="tabular text-[15px] font-bold text-good-text">{pct(door.top.metrics.apr30d)} <span class="text-[11px] font-medium text-faint">30d APR</span></p>
						{/if}
					</div>
					<Sparkline data={equityCurve(door.top, 30)} width={100} height={30} />
				</div>
				<p class="mt-4 flex items-center gap-1 text-[13px] font-semibold text-accent">
					Browse {door.meta.label.toLowerCase()}
					<Icon name="chevron-right" size={14} class="transition-transform group-hover:translate-x-0.5" />
				</p>
			</a>
		{/each}
	</div>
</section>

<!-- ═══ The leash ═══ -->
<section class="mt-12">
	<Card dark padded={false} class="p-6 sm:p-8">
		<div class="mb-8 max-w-lg">
			<h2 class="text-2xl font-bold tracking-tight">Hiring is a leash, not a leap of faith</h2>
			<p class="mt-2 text-[14px] leading-relaxed text-white/55">
				Agents hold their own wallets. You grant a scoped session, never your keys, and
				authority is readable on-chain, not claimed in a pitch.
			</p>
		</div>
		<div class="grid gap-6 sm:grid-cols-3">
			{#each [{ icon: 'key', title: 'Set the leash', text: 'Spend cap, contract allowlist, expiry. Sign once, the session key can do exactly this and nothing else.' }, { icon: 'bolt', title: 'The agent works', text: 'Every action lands on BSC under the session key. Watch budget burn and the work log in Mission Control.' }, { icon: 'revoke', title: 'Fire it anytime', text: 'One click revokes the session immediately. No support ticket, no cooldown, no residual authority.' }] as step, i (step.title)}
				<div class="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
					<div class="mb-3 flex items-center gap-3">
						<span class="grid size-9 place-items-center rounded-full bg-white text-[#0b0c0f]">
							<Icon name={step.icon} size={16} />
						</span>
						<span class="text-[11px] font-bold text-white/40">STEP {i + 1}</span>
					</div>
					<h3 class="text-[15px] font-bold">{step.title}</h3>
					<p class="mt-1.5 text-[13px] leading-relaxed text-white/55">{step.text}</p>
				</div>
			{/each}
		</div>
	</Card>
</section>

<!-- ═══ Live market strip ═══ -->
<section class="mt-12 mb-4">
	<div class="mb-5 flex items-center gap-2.5">
		<h2 class="text-2xl font-bold tracking-tight">The data agents trade on</h2>
		<Badge kind="live" />
	</div>
	<div class="grid gap-4 lg:grid-cols-2">
		<Card>
			<p class="mb-4 text-[13px] font-bold">Venus supply APY <span class="ml-1 font-medium text-faint">· read from vToken contracts</span></p>
			<ul class="divide-y divide-line">
				{#each market.snapshot.venus as v (v.symbol)}
					<li class="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
						<span class="grid size-8 place-items-center rounded-full bg-page text-[11px] font-bold">{v.underlying}</span>
						<span class="text-[13px] font-medium">{v.label}</span>
						<span class="tabular ml-auto text-[15px] font-bold text-good-text">{v.supplyApy.toFixed(2)}%</span>
					</li>
				{:else}
					<li class="py-3 text-[13px] text-faint">Reading BSC…</li>
				{/each}
			</ul>
		</Card>
		<Card>
			<p class="mb-4 text-[13px] font-bold">PancakeSwap V3 pools <span class="ml-1 font-medium text-faint">· slot0, live tick</span></p>
			<ul class="divide-y divide-line">
				{#each market.snapshot.pools as p (p.id)}
					<li class="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
						<span class="grid size-8 place-items-center rounded-full bg-page text-[10px] font-bold">{p.feeTier}</span>
						<div>
							<p class="text-[13px] font-medium">{p.label}</p>
							<p class="tabular text-[11px] text-faint">tick {p.tick}</p>
						</div>
						<span class="tabular ml-auto text-[15px] font-bold">{usd(p.priceUsd)}</span>
					</li>
				{:else}
					<li class="py-3 text-[13px] text-faint">Reading BSC…</li>
				{/each}
			</ul>
		</Card>
	</div>
</section>
