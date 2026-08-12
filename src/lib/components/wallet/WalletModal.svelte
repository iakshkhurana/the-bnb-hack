<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { wallet } from '$lib/wallet/wallet.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';

	const INSTALL_LINKS = [
		{ name: 'MetaMask', url: 'https://metamask.io/download' },
		{ name: 'Trust Wallet', url: 'https://trustwallet.com/download' },
		{ name: 'Binance Wallet', url: 'https://www.binance.com/en/web3wallet' },
		{ name: 'OKX Wallet', url: 'https://web3.okx.com/download' }
	];

	const detectedNames = $derived(wallet.options.map((o) => o.info.name.toLowerCase()));
	const missing = $derived(
		INSTALL_LINKS.filter(
			(l) => !detectedNames.some((n) => n.includes(l.name.split(' ')[0].toLowerCase()))
		)
	);
</script>

{#if wallet.modalOpen}
	<div
		class="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 p-0 backdrop-blur-[3px] sm:items-center sm:p-6"
		transition:fade={{ duration: 200 }}
		onclick={(e) => e.target === e.currentTarget && (wallet.modalOpen = false)}
		onkeydown={(e) => e.key === 'Escape' && (wallet.modalOpen = false)}
		role="dialog"
		aria-modal="true"
		tabindex="-1"
	>
		<div
			class="w-full max-w-sm rounded-t-card bg-card p-6 shadow-rail sm:rounded-card"
			in:fly={{ y: 28, duration: 380, easing: cubicOut }}
			out:fly={{ y: 16, duration: 180, easing: cubicOut }}
		>
			<div class="mb-5 flex items-start justify-between">
				<div>
					<h3 class="text-lg font-bold tracking-tight">Connect a wallet</h3>
					<p class="mt-0.5 text-[12px] text-sub">
						BNB Smart Chain · we switch the network for you
					</p>
				</div>
				<button
					onclick={() => (wallet.modalOpen = false)}
					class="grid size-8 place-items-center rounded-full border border-line text-sub hover:bg-page"
					aria-label="Close"
				>
					<Icon name="x" size={14} />
				</button>
			</div>

			<!-- detected wallets (EIP-6963) -->
			{#if wallet.options.length}
				<div class="space-y-2">
					{#each wallet.options as opt (opt.info.uuid)}
						<button
							onclick={() => wallet.connectWith(opt)}
							disabled={wallet.connecting}
							class="flex w-full items-center gap-3 rounded-2xl border border-line bg-page p-3 text-left transition-all hover:border-cta hover:bg-accent-tint active:scale-[0.99] disabled:opacity-50"
						>
							<img src={opt.info.icon} alt="" class="size-8 rounded-lg" />
							<span class="text-[14px] font-semibold">{opt.info.name}</span>
							<span class="ml-auto rounded-full bg-good/15 px-2 py-0.5 text-[10px] font-bold text-good-text">
								DETECTED
							</span>
						</button>
					{/each}
				</div>
			{:else if wallet.injected}
				<button
					onclick={() => wallet.connectInjected()}
					disabled={wallet.connecting}
					class="flex w-full items-center gap-3 rounded-2xl border border-line bg-page p-3 text-left transition-all hover:border-cta hover:bg-accent-tint active:scale-[0.99] disabled:opacity-50"
				>
					<span class="grid size-8 place-items-center rounded-lg bg-cta text-cta-fg">
						<Icon name="wallet" size={16} />
					</span>
					<span class="text-[14px] font-semibold">Browser wallet</span>
					<span class="ml-auto rounded-full bg-good/15 px-2 py-0.5 text-[10px] font-bold text-good-text">
						DETECTED
					</span>
				</button>
			{:else}
				<div class="rounded-2xl border border-line bg-page p-4">
					<p class="text-[13px] font-semibold">No wallet detected</p>
					<p class="mt-0.5 text-[12px] leading-relaxed text-sub">
						Install one of these, then refresh. All of them speak BNB Smart Chain.
					</p>
				</div>
			{/if}

			{#if missing.length && !wallet.options.length}
				<div class="mt-2 grid grid-cols-2 gap-2">
					{#each missing as link (link.name)}
						<a
							href={link.url}
							target="_blank"
							rel="noreferrer"
							class="flex items-center justify-between rounded-xl border border-line px-3 py-2.5 text-[12px] font-semibold text-sub transition-colors hover:border-cta hover:text-ink"
						>
							{link.name} <Icon name="external" size={11} />
						</a>
					{/each}
				</div>
			{/if}

			<div class="my-4 flex items-center gap-3">
				<span class="h-px flex-1 bg-line"></span>
				<span class="text-[11px] font-bold tracking-wide text-faint">OR</span>
				<span class="h-px flex-1 bg-line"></span>
			</div>

			<button
				onclick={() => wallet.connectDemo()}
				class="flex w-full items-center gap-3 rounded-2xl border border-dashed border-line-strong p-3 text-left transition-all hover:border-cta active:scale-[0.99]"
			>
				<span class="grid size-8 place-items-center rounded-lg bg-warn/20 text-sub">
					<Icon name="play" size={15} />
				</span>
				<span>
					<span class="block text-[14px] font-semibold">Try the demo account</span>
					<span class="block text-[11px] text-faint">Full journey, no wallet, nothing at risk</span>
				</span>
			</button>

			{#if wallet.connecting}
				<p class="mt-3 text-center text-[12px] font-medium text-sub">
					Check your wallet, approve the connection...
				</p>
			{/if}
		</div>
	</div>
{/if}
