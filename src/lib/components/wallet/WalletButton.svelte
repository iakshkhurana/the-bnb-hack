<script lang="ts">
	import { fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { wallet } from '$lib/wallet/wallet.svelte';
	import { shortAddr } from '$lib/utils/format';
	import Icon from '$lib/components/ui/Icon.svelte';

	let open = $state(false);
</script>

{#if wallet.connected}
	<div class="relative">
		<button
			onclick={() => (open = !open)}
			class="flex h-9 items-center gap-2 rounded-full border border-line bg-card pr-3.5 pl-2 text-[13px] font-semibold transition-colors hover:bg-page"
		>
			{#if wallet.walletIcon}
				<img src={wallet.walletIcon} alt="" class="size-6 rounded-full" />
			{:else}
				<span class="grid size-6 place-items-center rounded-full bg-accent-tint text-accent">
					<Icon name="wallet" size={13} />
				</span>
			{/if}
			<span class="tabular">{shortAddr(wallet.address ?? '')}</span>
			{#if wallet.demo}
				<span class="rounded-full bg-warn/20 px-1.5 py-0.5 text-[9px] font-bold text-sub">DEMO</span>
			{:else if !wallet.onBsc}
				<span class="size-2 rounded-full bg-warn" title="Wrong network"></span>
			{/if}
		</button>
		{#if open}
			<div
				class="absolute top-11 right-0 z-50 w-60 rounded-2xl bg-card p-2 shadow-rail"
				transition:fly={{ y: 6, duration: 220, easing: cubicOut }}
			>
				{#if wallet.walletName}
					<p class="px-3 pt-1.5 pb-1 text-[11px] font-bold tracking-wide text-faint uppercase">
						{wallet.walletName}
					</p>
				{/if}
				{#if !wallet.onBsc}
					<button
						onclick={() => {
							wallet.switchToBsc();
							open = false;
						}}
						class="w-full rounded-xl px-3 py-2 text-left text-[13px] font-medium text-warn hover:bg-page"
					>
						Switch to BNB Smart Chain
					</button>
				{/if}
				<button
					onclick={() => {
						wallet.disconnect();
						open = false;
					}}
					class="w-full rounded-xl px-3 py-2 text-left text-[13px] font-medium text-crit hover:bg-page"
				>
					Disconnect
				</button>
			</div>
		{/if}
	</div>
{:else}
	<button
		onclick={() => wallet.requestConnect()}
		class="flex h-9 items-center gap-2 rounded-full bg-cta px-4 text-[13px] font-semibold text-cta-fg transition-all hover:opacity-90 active:scale-[0.98]"
	>
		<Icon name="wallet" size={14} />
		Connect Wallet
	</button>
{/if}
