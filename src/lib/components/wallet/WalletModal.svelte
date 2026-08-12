<script lang="ts">
	import { fade, fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { wallet } from '$lib/wallet/wallet.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import WalletBrandIcon from './WalletBrandIcon.svelte';

	const POPULAR = [
		{ key: 'metamask', match: 'metamask', name: 'MetaMask', url: 'https://metamask.io/download' },
		{ key: 'trust', match: 'trust', name: 'Trust Wallet', url: 'https://trustwallet.com/download' },
		{ key: 'binance', match: 'binance', name: 'Binance Wallet', url: 'https://www.binance.com/en/web3wallet' },
		{ key: 'okx', match: 'okx', name: 'OKX Wallet', url: 'https://web3.okx.com/download' },
		{ key: 'phantom', match: 'phantom', name: 'Phantom', url: 'https://phantom.com/download' }
	];

	const detectedNames = $derived(wallet.options.map((o) => o.info.name.toLowerCase()));
	const notInstalled = $derived(
		POPULAR.filter((p) => !detectedNames.some((n) => n.includes(p.match)))
	);

	let showMore = $state(false);
	$effect(() => {
		// nothing detected: the install list IS the main content
		if (wallet.modalOpen) showMore = wallet.options.length === 0 && !wallet.injected;
	});
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
			class="max-h-[92vh] w-full max-w-sm overflow-y-auto rounded-t-card bg-card p-6 shadow-rail sm:rounded-card"
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
			{/if}

			<!-- other popular wallets: faded icons, install links -->
			{#if notInstalled.length}
				{#if wallet.options.length || wallet.injected}
					<button
						onclick={() => (showMore = !showMore)}
						class="mt-3 flex w-full items-center justify-between rounded-2xl border border-line px-4 py-3 text-[13px] font-semibold text-sub transition-colors hover:border-line-strong hover:text-ink"
					>
						<span class="flex items-center gap-2">
							<span class="flex items-center -space-x-1.5 opacity-45 grayscale">
								{#each notInstalled.slice(0, 4) as p (p.key)}
									<WalletBrandIcon name={p.key} size={20} />
								{/each}
							</span>
							More wallets
						</span>
						<Icon name="chevron-down" size={14} class="transition-transform duration-300 {showMore ? 'rotate-180' : ''}" />
					</button>
				{:else}
					<p class="mb-2 rounded-2xl border border-line bg-page p-3.5 text-[12px] leading-relaxed text-sub">
						<b class="text-ink">No wallet detected.</b> Install one below, then refresh. All of them
						speak BNB Smart Chain.
					</p>
				{/if}

				{#if showMore}
					<div class="mt-2 space-y-1.5" transition:fly={{ y: -6, duration: 220, easing: cubicOut }}>
						{#each notInstalled as p (p.key)}
							<a
								href={p.url}
								target="_blank"
								rel="noreferrer"
								class="group flex items-center gap-3 rounded-2xl border border-line px-3 py-2.5 transition-all hover:border-line-strong"
							>
								<span class="opacity-40 grayscale transition-all duration-200 group-hover:opacity-100 group-hover:grayscale-0">
									<WalletBrandIcon name={p.key} size={26} />
								</span>
								<span class="text-[13px] font-semibold text-sub group-hover:text-ink">{p.name}</span>
								<span class="ml-auto flex items-center gap-1 text-[11px] font-bold text-faint group-hover:text-accent">
									Install <Icon name="external" size={10} />
								</span>
							</a>
						{/each}
					</div>
				{/if}
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
