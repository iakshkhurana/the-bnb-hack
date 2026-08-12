<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import type { Agent } from '$lib/agents/types';
	import { wallet } from '$lib/wallet/wallet.svelte';
	import { sessionStore, type Session } from '$lib/sessions/sessions.svelte';
	import { market } from '$lib/stores/market.svelte';
	import { usd, shortAddr } from '$lib/utils/format';
	import Icon from '$lib/components/ui/Icon.svelte';
	import Button from '$lib/components/ui/Button.svelte';

	let {
		agent,
		open = $bindable(false)
	}: { agent: Agent; open: boolean } = $props();

	let step = $state<1 | 2 | 3>(1);
	let spendCap = $state(0);
	let expiryDays = $state(0);
	let checked = $state<boolean[]>([]);
	let signing = $state(false);
	let granted = $state<Session | null>(null);

	$effect(() => {
		if (open) {
			step = 1;
			spendCap = agent.leash.spendCapBnb;
			expiryDays = agent.leash.expiryDays;
			checked = agent.leash.allowlist.map(() => true);
			granted = null;
		}
	});

	const bnbUsd = $derived(market.price('BNB'));
	const allowSelected = $derived(agent.leash.allowlist.filter((_, i) => checked[i]));
	const capUsd = $derived(spendCap * bnbUsd);

	const EXPIRY_OPTIONS = [7, 14, 30, 90];

	async function grant() {
		if (!wallet.connected) {
			wallet.requestConnect();
			return;
		}
		if (!wallet.address) return;
		signing = true;
		try {
			let sig: string | undefined;
			if (!wallet.demo && wallet.provider) {
				const message = [
					'HIVE session grant',
					`agent: ${agent.name} (${agent.wallet})`,
					`spend cap: ${spendCap} BNB`,
					`expires: ${new Date(Date.now() + expiryDays * 86_400_000).toISOString()}`,
					`allowlist: ${allowSelected.map((a) => a.address).join(', ')}`
				].join('\n');
				try {
					sig = (await wallet.provider.request({
						method: 'personal_sign',
						params: [message, wallet.address]
					})) as string;
				} catch {
					signing = false;
					return; // user declined the signature
				}
			}
			granted = sessionStore.grant({
				agentId: agent.id,
				owner: wallet.address,
				spendCapBnb: spendCap,
				expiryDays,
				allowlist: allowSelected,
				grantSig: sig,
				demo: wallet.demo
			});
			step = 3;
		} finally {
			signing = false;
		}
	}
</script>

{#if open}
	<div
		class="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 backdrop-blur-[3px] sm:items-center sm:p-6"
		transition:fade={{ duration: 200 }}
		onclick={(e) => {
			if (e.target === e.currentTarget) open = false;
		}}
		onkeydown={(e) => e.key === 'Escape' && (open = false)}
		role="dialog"
		aria-modal="true"
		tabindex="-1"
	>
		<div
			class="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-card bg-card p-6 shadow-rail sm:rounded-card"
			in:fly={{ y: 28, duration: 380, easing: cubicOut }}
			out:fly={{ y: 16, duration: 180, easing: cubicOut }}
		>
			<!-- header -->
			<div class="mb-5 flex items-start justify-between">
				<div>
					<p class="text-[11px] font-bold tracking-wide text-faint uppercase">
						{step === 3 ? 'Session active' : `Hire ${agent.name}`}
					</p>
					<h3 class="mt-0.5 text-xl font-bold tracking-tight">
						{step === 1 ? 'Set the leash' : step === 2 ? 'Review the grant' : 'Agent hired'}
					</h3>
				</div>
				<button
					onclick={() => (open = false)}
					class="grid size-8 place-items-center rounded-full border border-line text-sub hover:bg-page"
					aria-label="Close"
				>
					<Icon name="x" size={14} />
				</button>
			</div>

			{#if step < 3}
				<div class="mb-5 flex gap-1.5">
					{#each [1, 2] as s (s)}
						<div class="h-1 flex-1 rounded-full {step >= s ? 'bg-ink' : 'bg-line'}"></div>
					{/each}
				</div>
			{/if}

			{#if step === 1}
				<!-- spend cap -->
				<label class="mb-1.5 block text-[13px] font-semibold" for="cap">Spend cap</label>
				<p class="mb-2 text-[12px] text-sub">
					The hard ceiling this agent can move or spend. It can never exceed this, not by one wei.
				</p>
				<div class="mb-1 flex items-center gap-3 rounded-2xl border border-line bg-page p-3">
					<input
						id="cap"
						type="range"
						min="0.05"
						max={agent.leash.spendCapBnb * 4}
						step="0.05"
						bind:value={spendCap}
						class="flex-1 accent-cta"
					/>
					<span class="tabular w-24 text-right text-[15px] font-bold">{spendCap.toFixed(2)} BNB</span>
				</div>
				<p class="tabular mb-5 text-right text-[12px] text-faint">
					≈ {bnbUsd ? usd(capUsd) : '…'}
				</p>

				<!-- expiry -->
				<p class="mb-1.5 text-[13px] font-semibold">Permission expires in</p>
				<div class="mb-5 flex gap-2">
					{#each EXPIRY_OPTIONS as d (d)}
						<button
							onclick={() => (expiryDays = d)}
							class="flex-1 rounded-full border py-2 text-[13px] font-semibold transition-colors {expiryDays ===
							d
								? 'border-cta bg-cta text-cta-fg'
								: 'border-line bg-card text-sub hover:text-ink'}"
						>
							{d}d
						</button>
					{/each}
				</div>

				<!-- allowlist -->
				<p class="mb-1.5 text-[13px] font-semibold">Contract allowlist</p>
				<p class="mb-2 text-[12px] text-sub">
					The only contracts this session key may call. Everything else reverts.
				</p>
				<div class="mb-6 space-y-2">
					{#each agent.leash.allowlist as item, i (item.address)}
						<label
							class="flex cursor-pointer items-center gap-3 rounded-2xl border border-line bg-card p-3 transition-colors has-checked:border-accent"
						>
							<input type="checkbox" bind:checked={checked[i]} class="size-4 accent-cta" />
							<span class="min-w-0">
								<span class="block text-[13px] font-semibold">{item.label}</span>
								<span class="tabular block truncate text-[11px] text-faint">{item.address}</span>
							</span>
						</label>
					{/each}
				</div>

				<Button
					variant="primary"
					size="lg"
					class="w-full"
					disabled={allowSelected.length === 0 || spendCap <= 0}
					onclick={() => (step = 2)}
				>
					Review grant <Icon name="chevron-right" size={15} />
				</Button>
			{:else if step === 2}
				<div class="mb-5 space-y-3">
					<div class="rounded-2xl border border-line bg-page p-4">
						<p class="mb-3 text-[11px] font-bold tracking-wide text-faint uppercase">
							This session may
						</p>
						<ul class="space-y-2 text-[13px]">
							<li class="flex items-center gap-2">
								<Icon name="check" size={14} class="text-good-text" />
								Spend up to <b class="tabular">{spendCap.toFixed(2)} BNB</b>
								<span class="tabular text-faint">({bnbUsd ? usd(capUsd, { compact: true }) : '…'})</span>
							</li>
							<li class="flex items-center gap-2">
								<Icon name="check" size={14} class="text-good-text" />
								Call {allowSelected.length} allowlisted contract{allowSelected.length > 1 ? 's' : ''} only
							</li>
							<li class="flex items-center gap-2">
								<Icon name="check" size={14} class="text-good-text" />
								Act until <b>{new Date(Date.now() + expiryDays * 86_400_000).toLocaleDateString()}</b>
							</li>
						</ul>
					</div>
					<div class="rounded-2xl border border-line bg-page p-4">
						<p class="mb-3 text-[11px] font-bold tracking-wide text-faint uppercase">It can never</p>
						<ul class="space-y-2 text-[13px] text-sub">
							<li class="flex items-center gap-2"><Icon name="x" size={14} class="text-crit" /> Withdraw to any address but yours</li>
							<li class="flex items-center gap-2"><Icon name="x" size={14} class="text-crit" /> Touch contracts outside the allowlist</li>
							<li class="flex items-center gap-2"><Icon name="x" size={14} class="text-crit" /> Outlive your revoke, one click, immediate</li>
						</ul>
					</div>
					<div class="flex items-center justify-between rounded-2xl border border-line p-4 text-[13px]">
						<span class="text-sub">Agent fee</span>
						<span class="font-semibold">{agent.fee.label}</span>
					</div>
					<div class="flex items-start gap-2.5 rounded-2xl bg-accent-tint p-4 text-[12px] leading-relaxed">
						<Icon name="shield" size={15} class="mt-0.5 shrink-0 text-accent" />
						{#if wallet.demo || !wallet.connected}
							<span class="text-sub">
								<b class="text-ink">Demo money only.</b> This session runs on simulated funds. Nothing
								real is ever at stake in demo mode.
							</span>
						{:else}
							<span class="text-sub">
								<b class="text-ink">Signing is free.</b> No funds leave your wallet today. When this
								agent executes on-chain, the spend cap above is the hard maximum it can ever use.
							</span>
						{/if}
					</div>
				</div>

				<div class="flex gap-2.5">
					<Button variant="ghost" size="lg" onclick={() => (step = 1)}>Back</Button>
					<Button variant="primary" size="lg" class="flex-1" disabled={signing} onclick={grant}>
						{#if signing}Waiting for signature…{:else}
							<Icon name="key" size={15} /> Sign & grant session
						{/if}
					</Button>
				</div>
				{#if !wallet.connected}
					<p class="mt-3 text-center text-[12px] text-faint">
						Clicking opens the connect dialog: pick MetaMask, Trust, Binance Wallet or the demo account.
					</p>
				{/if}
			{:else if granted}
				<div class="mb-5 rounded-2xl bg-night p-5 text-white">
					<div class="mb-4 flex items-center gap-2.5">
						<span class="grid size-9 place-items-center rounded-full bg-good/20 text-good">
							<Icon name="check" size={17} />
						</span>
						<div>
							<p class="text-[15px] font-bold">{agent.name} is on the clock</p>
							<p class="text-[12px] text-white/50">Session registered · revocable anytime</p>
						</div>
					</div>
					<dl class="space-y-2 text-[12px]">
						<div class="flex justify-between">
							<dt class="text-white/50">Session key</dt>
							<dd class="tabular">{shortAddr(granted.sessionKey)}</dd>
						</div>
						<div class="flex justify-between">
							<dt class="text-white/50">Spend cap</dt>
							<dd class="tabular">{granted.spendCapBnb.toFixed(2)} BNB</dd>
						</div>
						<div class="flex justify-between">
							<dt class="text-white/50">Expires</dt>
							<dd>{new Date(granted.expiresAt).toLocaleString()}</dd>
						</div>
						<div class="flex justify-between">
							<dt class="text-white/50">Scope</dt>
							<dd>{granted.allowlist.length} contract{granted.allowlist.length > 1 ? 's' : ''}</dd>
						</div>
					</dl>
				</div>
				<div class="flex gap-2.5">
					<Button variant="ghost" size="lg" class="flex-1" onclick={() => (open = false)}>Keep browsing</Button>
					<Button variant="primary" size="lg" class="flex-1" href="/dashboard">
						Mission Control <Icon name="arrow-up-right" size={15} />
					</Button>
				</div>
			{/if}
		</div>
	</div>
{/if}
