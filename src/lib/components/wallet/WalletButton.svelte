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
			class="flex h-9 items-center gap-2 rounded-full border border-line bg-white pr-3.5 pl-2 text-[13px] font-semibold transition-colors hover:bg-page"
		>
			<span class="grid size-6 place-items-center rounded-full bg-accent-tint text-accent-deep">
				<Icon name="wallet" size={13} />
			</span>
			<span class="tabular">{shortAddr(wallet.address ?? '')}</span>
			{#if wallet.demo}
				<span class="rounded-full bg-warn/20 px-1.5 py-0.5 text-[9px] font-bold text-sub">DEMO</span>
			{/if}
		</button>
		{#if open}
			<div
				class="absolute top-11 right-0 z-50 w-56 rounded-2xl bg-white p-2 shadow-rail"
				transition:fly={{ y: 6, duration: 220, easing: cubicOut }}
			>
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
		onclick={() => wallet.connect()}
		disabled={wallet.connecting}
		class="flex h-9 items-center gap-2 rounded-full bg-ink px-4 text-[13px] font-semibold text-white transition-all hover:bg-night-2 active:scale-[0.98] disabled:opacity-50"
	>
		<Icon name="wallet" size={14} />
		{wallet.connecting ? 'Connecting…' : 'Connect Wallet'}
	</button>
{/if}
