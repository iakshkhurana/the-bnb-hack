<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { fade, fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { AGENTS } from '$lib/agents/registry';
	import { CATEGORIES, CATEGORY_META, type Category } from '$lib/agents/types';
	import { byId } from '$lib/agents/registry';
	import { usd, pct } from '$lib/utils/format';
	import AgentCard from '$lib/components/agents/AgentCard.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import Button from '$lib/components/ui/Button.svelte';

	let query = $state('');
	let category = $state<Category | 'all'>(
		(page.url.searchParams.get('category') as Category) ?? 'all'
	);
	let sort = $state('tvl');
	let compareIds = $state<string[]>([]);
	let compareOpen = $state(false);

	const SORTS: Record<string, { label: string; fn: (a: (typeof AGENTS)[0], b: (typeof AGENTS)[0]) => number }> = {
		tvl: { label: 'TVL', fn: (a, b) => b.metrics.tvlUsd - a.metrics.tvlUsd },
		apr: { label: '30d APR', fn: (a, b) => b.metrics.apr30d - a.metrics.apr30d },
		users: { label: 'Users', fn: (a, b) => b.metrics.users - a.metrics.users },
		activity: { label: 'Actions (30d)', fn: (a, b) => b.metrics.actions30d - a.metrics.actions30d },
		risk: { label: 'Lowest risk', fn: (a, b) => a.riskLevel - b.riskLevel }
	};

	const filtered = $derived(
		AGENTS.filter((a) => category === 'all' || a.category === category)
			.filter((a) => {
				const q = query.trim().toLowerCase();
				if (!q) return true;
				return [a.name, a.tagline, a.operator, a.venue, CATEGORY_META[a.category].label]
					.join(' ')
					.toLowerCase()
					.includes(q);
			})
			.sort(SORTS[sort].fn)
	);

	function setCategory(c: Category | 'all') {
		category = c;
		const url = c === 'all' ? '/marketplace' : `/marketplace?category=${c}`;
		goto(url, { replaceState: true, noScroll: true, keepFocus: true });
	}

	function toggleCompare(id: string) {
		if (compareIds.includes(id)) {
			compareIds = compareIds.filter((x) => x !== id);
		} else if (compareIds.length < 3) {
			compareIds = [...compareIds, id];
		}
	}

	const compared = $derived(compareIds.map((id) => byId(id)!).filter(Boolean));

	const ROWS: { label: string; value: (a: (typeof AGENTS)[0]) => string; strong?: boolean }[] = [
		{ label: 'Category', value: (a) => CATEGORY_META[a.category].label },
		{ label: '30d APR', value: (a) => (a.category === 'health' ? '—' : pct(a.metrics.apr30d)), strong: true },
		{ label: 'Max drawdown', value: (a) => (a.category === 'health' ? '—' : `${a.metrics.maxDrawdown.toFixed(1)}%`) },
		{ label: 'Win rate', value: (a) => (a.metrics.winRate != null ? `${a.metrics.winRate.toFixed(1)}%` : '—') },
		{ label: 'Sharpe', value: (a) => (a.metrics.sharpe != null ? a.metrics.sharpe.toFixed(1) : '—') },
		{ label: 'TVL', value: (a) => usd(a.metrics.tvlUsd, { compact: true }), strong: true },
		{ label: 'Users', value: (a) => a.metrics.users.toLocaleString() },
		{ label: 'Actions (30d)', value: (a) => a.metrics.actions30d.toLocaleString() },
		{ label: 'Avg gas / action', value: (a) => usd(a.metrics.avgGasUsd, { decimals: 2 }) },
		{ label: 'Uptime (90d)', value: (a) => `${a.metrics.uptime}%` },
		{ label: 'Risk level', value: (a) => `${a.riskLevel} / 5` },
		{ label: 'Fee', value: (a) => a.fee.label, strong: true },
		{ label: 'Default spend cap', value: (a) => `${a.leash.spendCapBnb} BNB` },
		{ label: 'Default expiry', value: (a) => `${a.leash.expiryDays} days` },
		{ label: 'Venue', value: (a) => a.venue }
	];
</script>

<svelte:head>
	<title>Marketplace — HIVE</title>
</svelte:head>

<div class="py-4">
	<div class="mb-6 flex flex-wrap items-end justify-between gap-4">
		<div>
			<h1 class="text-3xl font-bold tracking-tight">Marketplace</h1>
			<p class="mt-1 text-[14px] text-sub">
				{AGENTS.length} agents · every metric labelled with where it came from
			</p>
		</div>
		<label class="relative block w-full sm:w-72">
			<span class="absolute top-1/2 left-3.5 -translate-y-1/2 text-faint">
				<Icon name="search" size={15} />
			</span>
			<input
				type="search"
				placeholder="Search agents, venues, operators…"
				bind:value={query}
				class="h-10 w-full rounded-full border border-line bg-white pr-4 pl-10 text-[13px] outline-none placeholder:text-faint focus:border-accent"
			/>
		</label>
	</div>

	<!-- filters row -->
	<div class="mb-6 flex flex-wrap items-center gap-3">
		<div class="flex flex-wrap gap-1.5">
			<button
				onclick={() => setCategory('all')}
				class="rounded-full px-4 py-1.5 text-[13px] font-semibold transition-colors {category === 'all'
					? 'bg-ink text-white'
					: 'border border-line bg-white text-sub hover:text-ink'}"
			>
				All
			</button>
			{#each CATEGORIES as c (c)}
				<button
					onclick={() => setCategory(c)}
					class="flex items-center gap-1.5 rounded-full px-4 py-1.5 text-[13px] font-semibold transition-colors {category ===
					c
						? 'bg-ink text-white'
						: 'border border-line bg-white text-sub hover:text-ink'}"
				>
					<Icon name={CATEGORY_META[c].icon} size={14} />
					{CATEGORY_META[c].label}
				</button>
			{/each}
		</div>
		<label class="ml-auto flex items-center gap-2 text-[13px] text-sub">
			Sort
			<select
				bind:value={sort}
				class="h-9 rounded-full border border-line bg-white px-3 text-[13px] font-semibold text-ink outline-none"
			>
				{#each Object.entries(SORTS) as [key, s] (key)}
					<option value={key}>{s.label}</option>
				{/each}
			</select>
		</label>
	</div>

	{#if category !== 'all'}
		<div class="mb-6 rounded-card border border-line bg-white p-5 shadow-card">
			<div class="flex items-start gap-4">
				<span class="grid size-11 shrink-0 place-items-center rounded-2xl bg-ink text-white">
					<Icon name={CATEGORY_META[category].icon} size={20} />
				</span>
				<div>
					<h2 class="text-[15px] font-bold">{CATEGORY_META[category].label}</h2>
					<p class="mt-0.5 max-w-2xl text-[13px] leading-relaxed text-sub">
						{CATEGORY_META[category].blurb}
					</p>
				</div>
			</div>
		</div>
	{/if}

	<!-- grid -->
	{#if filtered.length}
		<div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
			{#each filtered as agent, i (agent.id)}
				<div class="rise" style="animation-delay: {Math.min(i, 8) * 45}ms">
					<AgentCard
						{agent}
						selectable
						selected={compareIds.includes(agent.id)}
						ontoggle={toggleCompare}
					/>
				</div>
			{/each}
		</div>
	{:else}
		<div class="rounded-card border border-line bg-white p-12 text-center shadow-card">
			<p class="text-[15px] font-semibold">No agents match “{query}”</p>
			<p class="mt-1 text-[13px] text-sub">Try a different term, or clear the category filter.</p>
		</div>
	{/if}
</div>

<!-- compare bar -->
{#if compareIds.length > 0}
	<div
		class="fixed bottom-20 left-1/2 z-40 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 lg:bottom-6"
		transition:fly={{ y: 24, duration: 320, easing: cubicOut }}
	>
		<div class="flex items-center gap-3 rounded-full bg-night p-2 pl-5 text-white shadow-rail">
			<p class="text-[13px] font-semibold">
				{compareIds.length} selected <span class="text-white/40">· up to 3</span>
			</p>
			<button class="ml-auto text-[12px] text-white/50 hover:text-white" onclick={() => (compareIds = [])}>
				Clear
			</button>
			<Button variant="light" size="sm" disabled={compareIds.length < 2} onclick={() => (compareOpen = true)}>
				Compare <Icon name="arrow-up-right" size={13} />
			</Button>
		</div>
	</div>
{/if}

<!-- compare modal -->
{#if compareOpen}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4 backdrop-blur-[3px]"
		transition:fade={{ duration: 200 }}
		onclick={(e) => e.target === e.currentTarget && (compareOpen = false)}
		onkeydown={(e) => e.key === 'Escape' && (compareOpen = false)}
		role="dialog"
		aria-modal="true"
		tabindex="-1"
	>
		<div
			class="max-h-[88vh] w-full max-w-3xl overflow-auto rounded-card bg-card p-6 shadow-rail"
			in:fly={{ y: 28, duration: 380, easing: cubicOut }}
			out:fly={{ y: 16, duration: 180, easing: cubicOut }}
		>
			<div class="mb-5 flex items-center justify-between">
				<h3 class="text-xl font-bold tracking-tight">Side by side</h3>
				<button
					onclick={() => (compareOpen = false)}
					class="grid size-8 place-items-center rounded-full border border-line text-sub hover:bg-page"
					aria-label="Close"
				>
					<Icon name="x" size={14} />
				</button>
			</div>
			<div class="overflow-x-auto">
				<table class="w-full min-w-[560px] text-[13px]">
					<thead>
						<tr>
							<th class="w-40 pb-3 text-left font-medium text-faint">Metric</th>
							{#each compared as a (a.id)}
								<th class="pb-3 text-left">
									<a href="/agents/{a.id}" class="font-bold hover:underline">{a.name}</a>
									<Badge kind={a.network === 'mainnet' ? 'mainnet' : 'testnet'} class="ml-1.5" />
								</th>
							{/each}
						</tr>
					</thead>
					<tbody class="divide-y divide-line">
						{#each ROWS as row (row.label)}
							<tr>
								<td class="py-2.5 pr-4 text-faint">{row.label}</td>
								{#each compared as a (a.id)}
									<td class="tabular py-2.5 pr-4 {row.strong ? 'font-bold' : 'font-medium'}">
										{row.value(a)}
									</td>
								{/each}
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	</div>
{/if}
