<script lang="ts">
	import { onMount } from 'svelte';
	import { wallet } from '$lib/wallet/wallet.svelte';
	import { sessionStore, type Session } from '$lib/sessions/sessions.svelte';
	import { byId } from '$lib/agents/registry';
	import { CATEGORY_META } from '$lib/agents/types';
	import { activityLog } from '$lib/agents/performance';
	import { market } from '$lib/stores/market.svelte';
	import { usd, countdown, timeAgo, shortAddr } from '$lib/utils/format';
	import Card from '$lib/components/ui/Card.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import AllocationBar from '$lib/components/charts/AllocationBar.svelte';

	$effect(() => market.subscribe());

	// live clock so budget bars burn on screen
	let now = $state(Date.now());
	onMount(() => {
		const t = setInterval(() => (now = Date.now()), 1000);
		return () => clearInterval(t);
	});

	const bnbUsd = $derived(market.price('BNB'));
	const sessions = $derived(sessionStore.forOwner(wallet.address));
	const active = $derived(sessions.filter((s) => s.status === 'active' && now < s.expiresAt));
	const past = $derived(sessions.filter((s) => s.status !== 'active' || now >= s.expiresAt));

	const totalCapBnb = $derived(active.reduce((s, x) => s + x.spendCapBnb, 0));
	const totalSpentBnb = $derived(active.reduce((s, x) => s + sessionStore.spent(x), 0));

	const allocation = $derived.by(() => {
		const byCat = new Map<string, number>();
		for (const s of active) {
			const agent = byId(s.agentId);
			if (!agent) continue;
			const label = CATEGORY_META[agent.category].label;
			byCat.set(label, (byCat.get(label) ?? 0) + s.spendCapBnb * bnbUsd);
		}
		return [...byCat.entries()].map(([label, value]) => ({ label, value }));
	});

	let confirmRevoke = $state<string | null>(null);

	function pctSpent(s: Session): number {
		return Math.min(100, (sessionStore.spent(s) / s.spendCapBnb) * 100);
	}

	function barColor(p: number): string {
		if (p >= 80) return 'bg-crit';
		if (p >= 60) return 'bg-warn';
		return 'bg-accent';
	}

	function callsSince(s: Session) {
		const agent = byId(s.agentId);
		if (!agent) return [];
		return activityLog(agent, 14)
			.filter((e) => e.at >= s.createdAt)
			.slice(0, 3);
	}
</script>

<svelte:head>
	<title>Mission Control — HIVE</title>
</svelte:head>

<div class="py-4">
	<div class="mb-6">
		<h1 class="text-3xl font-bold tracking-tight">Mission Control</h1>
		<p class="mt-1 text-[14px] text-sub">
			Everything your agents may do, are doing, and have spent — revocable in one click.
		</p>
	</div>

	{#if !wallet.connected}
		<Card class="py-16 text-center">
			<span class="mx-auto mb-4 grid size-14 place-items-center rounded-full bg-page">
				<Icon name="wallet" size={24} class="text-sub" />
			</span>
			<h2 class="text-lg font-bold">Connect to see your workforce</h2>
			<p class="mx-auto mt-1 max-w-sm text-[13px] text-sub">
				Your sessions live with your address. No wallet installed? Connect starts a demo account
				— the full journey still works.
			</p>
			<div class="mt-5">
				<Button variant="primary" size="lg" onclick={() => wallet.connect()}>
					<Icon name="wallet" size={15} /> Connect wallet
				</Button>
			</div>
		</Card>
	{:else if sessions.length === 0}
		<Card class="py-16 text-center">
			<span class="mx-auto mb-4 grid size-14 place-items-center rounded-full bg-page">
				<Icon name="hive" size={24} class="text-sub" />
			</span>
			<h2 class="text-lg font-bold">No agents on your payroll yet</h2>
			<p class="mx-auto mt-1 max-w-sm text-[13px] text-sub">
				Hire your first agent from the marketplace — you set the spend cap, the contracts it may
				touch, and when its permission dies.
			</p>
			<div class="mt-5">
				<Button variant="primary" size="lg" href="/marketplace">
					Browse the marketplace <Icon name="arrow-up-right" size={15} />
				</Button>
			</div>
		</Card>
	{:else}
		<!-- ═══ Overview ═══ -->
		<div class="mb-6 grid gap-4 lg:grid-cols-[1.4fr_1fr]">
			<Card dark>
				<p class="text-[12px] font-medium text-white/50">Capital under agent authority</p>
				<div class="mt-1 flex items-baseline gap-3">
					<span class="tabular text-4xl font-bold">
						{bnbUsd ? usd(totalCapBnb * bnbUsd) : `${totalCapBnb.toFixed(2)} BNB`}
					</span>
					<span class="tabular rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-white/70">
						{totalCapBnb.toFixed(2)} BNB total cap
					</span>
				</div>
				<div class="mt-6 grid grid-cols-3 gap-4 border-t border-white/10 pt-4">
					<div>
						<p class="text-[11px] text-white/40">Active sessions</p>
						<p class="tabular mt-0.5 text-xl font-bold">{active.length}</p>
					</div>
					<div>
						<p class="text-[11px] text-white/40">Spent so far</p>
						<p class="tabular mt-0.5 text-xl font-bold">
							{totalSpentBnb.toFixed(4)} <span class="text-[12px] font-medium text-white/40">BNB</span>
						</p>
					</div>
					<div>
						<p class="text-[11px] text-white/40">Next expiry</p>
						<p class="tabular mt-0.5 text-xl font-bold">
							{active.length ? countdown(Math.min(...active.map((s) => s.expiresAt))) : '—'}
						</p>
					</div>
				</div>
			</Card>
			<Card>
				<p class="mb-4 text-[13px] font-bold">Authority by category</p>
				{#if allocation.length}
					<AllocationBar slices={allocation} />
				{:else}
					<p class="text-[13px] text-faint">No active authority granted.</p>
				{/if}
			</Card>
		</div>

		<!-- ═══ Active sessions ═══ -->
		<h2 class="mb-4 text-lg font-bold tracking-tight">Active sessions</h2>
		<div class="space-y-4">
			{#each active as s (s.id)}
				{@const agent = byId(s.agentId)}
				{#if agent}
					{@const spent = sessionStore.spent(s)}
					{@const p = pctSpent(s)}
					<Card>
						<div class="flex flex-wrap items-start gap-4">
							<span class="grid size-11 shrink-0 place-items-center rounded-2xl bg-ink text-white">
								<Icon name={CATEGORY_META[agent.category].icon} size={19} />
							</span>
							<div class="min-w-0 flex-1">
								<div class="flex flex-wrap items-center gap-2">
									<a href="/agents/{agent.id}" class="text-[15px] font-bold hover:underline">{agent.name}</a>
									<span class="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-2 py-0.5 text-[10px] font-bold text-good-text">
										<span class="size-1.5 animate-pulse rounded-full bg-good"></span>WORKING
									</span>
									<Badge kind="testnet" />
								</div>
								<p class="tabular mt-0.5 text-[12px] text-faint">
									session key {shortAddr(s.sessionKey)} · granted {timeAgo(s.createdAt)} · expires in {countdown(s.expiresAt)}
								</p>

								<!-- budget bar -->
								<div class="mt-3.5 max-w-xl">
									<div class="mb-1.5 flex items-baseline justify-between text-[12px]">
										<span class="text-sub">
											Budget burned
											<b class="tabular text-ink">{spent.toFixed(4)} / {s.spendCapBnb.toFixed(2)} BNB</b>
										</span>
										<span class="tabular font-semibold {p >= 80 ? 'text-crit' : 'text-sub'}">{p.toFixed(1)}%</span>
									</div>
									<div class="h-2.5 w-full overflow-hidden rounded-full bg-page">
										<div class="h-full rounded-full transition-all duration-1000 {barColor(p)}" style="width: {p}%"></div>
									</div>
									<p class="mt-1 text-[11px] text-faint">
										Hard ceiling — the session key cannot exceed it. {s.allowlist.length} contract{s.allowlist.length > 1 ? 's' : ''} allowlisted.
									</p>
								</div>

								<!-- recent calls -->
								{#if callsSince(s).length}
									<ul class="mt-3.5 max-w-xl divide-y divide-line rounded-2xl border border-line">
										{#each callsSince(s) as call (call.id)}
											<li class="flex items-center gap-3 px-3.5 py-2.5 text-[12px]">
												<span class="rounded-full bg-page px-2 py-0.5 text-[10px] font-bold text-sub">{call.kind}</span>
												<span class="truncate font-medium">{call.summary}</span>
												<span class="tabular ml-auto shrink-0 text-faint">{timeAgo(call.at)}</span>
											</li>
										{/each}
									</ul>
								{/if}
							</div>

							<div class="flex w-full shrink-0 gap-2 sm:w-auto sm:flex-col">
								{#if confirmRevoke === s.id}
									<Button variant="danger" size="sm" onclick={() => { sessionStore.revoke(s.id); confirmRevoke = null; }}>
										Confirm — fire agent
									</Button>
									<Button variant="ghost" size="sm" onclick={() => (confirmRevoke = null)}>Keep</Button>
								{:else}
									<Button variant="ghost" size="sm" onclick={() => (confirmRevoke = s.id)}>
										<Icon name="revoke" size={13} /> Revoke
									</Button>
									<Button variant="ghost" size="sm" href="/agents/{agent.id}">Details</Button>
								{/if}
							</div>
						</div>
					</Card>
				{/if}
			{:else}
				<Card class="py-10 text-center">
					<p class="text-[14px] font-semibold">No active sessions</p>
					<p class="mt-1 text-[13px] text-sub">Everything is revoked or expired. Your capital answers to no one.</p>
				</Card>
			{/each}
		</div>

		<!-- ═══ Past sessions ═══ -->
		{#if past.length}
			<h2 class="mt-10 mb-4 text-lg font-bold tracking-tight">Ended sessions</h2>
			<div class="space-y-2.5">
				{#each past as s (s.id)}
					{@const agent = byId(s.agentId)}
					{#if agent}
						<div class="flex flex-wrap items-center gap-3 rounded-card border border-line bg-white/60 px-5 py-3.5">
							<Icon name={CATEGORY_META[agent.category].icon} size={16} class="text-faint" />
							<span class="text-[13px] font-semibold text-sub">{agent.name}</span>
							<span class="rounded-full bg-page px-2 py-0.5 text-[10px] font-bold text-faint">
								{s.status === 'revoked' ? `REVOKED ${s.revokedAt ? timeAgo(s.revokedAt) : ''}` : 'EXPIRED'}
							</span>
							<span class="tabular text-[12px] text-faint">
								spent {sessionStore.spent(s).toFixed(4)} / {s.spendCapBnb.toFixed(2)} BNB
							</span>
							<a href="/agents/{agent.id}" class="ml-auto text-[12px] font-semibold text-accent hover:underline">
								Rehire →
							</a>
						</div>
					{/if}
				{/each}
			</div>
		{/if}
	{/if}
</div>
