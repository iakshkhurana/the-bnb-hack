<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { page } from '$app/state';
	import Icon from '$lib/components/ui/Icon.svelte';
	import WalletButton from '$lib/components/wallet/WalletButton.svelte';

	let { children } = $props();

	const nav = [
		{ href: '/', icon: 'home', label: 'Home' },
		{ href: '/marketplace', icon: 'market', label: 'Marketplace' },
		{ href: '/dashboard', icon: 'gauge', label: 'Mission Control' },
		{ href: '/proof', icon: 'proof', label: 'Proof' }
	];

	const active = (href: string) =>
		href === '/' ? page.url.pathname === '/' : page.url.pathname.startsWith(href);
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="min-h-screen">
	<!-- Topbar -->
	<header class="sticky top-0 z-40 border-b border-line/70 bg-page/85 backdrop-blur-md">
		<div class="mx-auto flex h-16 max-w-[1280px] items-center gap-4 px-4 sm:px-6">
			<a href="/" class="flex items-center gap-2.5">
				<span class="grid size-9 place-items-center rounded-xl bg-ink text-white">
					<Icon name="hive" size={20} strokeWidth={1.6} />
				</span>
				<span class="text-[17px] font-bold tracking-tight">HIVE</span>
				<span
					class="mt-0.5 hidden rounded-full border border-line bg-white px-2 py-0.5 text-[10px] font-bold tracking-wide text-sub sm:inline"
				>
					BNB CHAIN
				</span>
			</a>

			<nav class="ml-6 hidden items-center gap-1 md:flex">
				{#each nav as item (item.href)}
					<a
						href={item.href}
						class="rounded-full px-3.5 py-1.5 text-[13px] font-medium transition-colors {active(item.href)
							? 'bg-white text-ink shadow-card'
							: 'text-sub hover:text-ink'}"
					>
						{item.label}
					</a>
				{/each}
			</nav>

			<div class="ml-auto flex items-center gap-2.5">
				<a
					href="https://github.com/iakshkhurana/the-bnb-hack"
					target="_blank"
					rel="noreferrer"
					class="hidden size-9 place-items-center rounded-full border border-line bg-white text-sub transition-colors hover:text-ink sm:grid"
					aria-label="GitHub repository"
				>
					<Icon name="external" size={15} />
				</a>
				<WalletButton />
			</div>
		</div>
	</header>

	<!-- Floating icon rail (desktop) -->
	<aside
		class="fixed top-1/2 left-4 z-40 hidden -translate-y-1/2 flex-col items-center gap-1.5 rounded-full bg-white p-2 shadow-rail lg:flex"
	>
		{#each nav as item (item.href)}
			<a
				href={item.href}
				title={item.label}
				aria-label={item.label}
				class="grid size-10 place-items-center rounded-full transition-all duration-150 {active(item.href)
					? 'bg-ink text-white'
					: 'text-sub hover:bg-page hover:text-ink'}"
			>
				<Icon name={item.icon} size={18} />
			</a>
		{/each}
	</aside>

	<!-- Mobile bottom nav -->
	<nav
		class="fixed bottom-4 left-1/2 z-40 flex -translate-x-1/2 items-center gap-1 rounded-full bg-white p-1.5 shadow-rail lg:hidden"
	>
		{#each nav as item (item.href)}
			<a
				href={item.href}
				aria-label={item.label}
				class="grid size-10 place-items-center rounded-full {active(item.href)
					? 'bg-ink text-white'
					: 'text-sub'}"
			>
				<Icon name={item.icon} size={18} />
			</a>
		{/each}
	</nav>

	<main class="mx-auto max-w-[1280px] px-4 pt-6 pb-28 sm:px-6 lg:pb-16 lg:pl-20">
		{@render children()}
	</main>

	<footer class="border-t border-line">
		<div
			class="mx-auto flex max-w-[1280px] flex-wrap items-center gap-x-6 gap-y-2 px-4 py-6 text-[12px] text-sub sm:px-6 lg:pl-20"
		>
			<span class="font-semibold text-ink">HIVE</span>
			<span>The agent labor market for BNB Chain</span>
			<span class="inline-flex items-center gap-1.5">
				<span class="size-1.5 animate-pulse rounded-full bg-good"></span>
				BSC mainnet · live data
			</span>
			<span class="ml-auto">Built for The Smart Money Era hackathon · 2026</span>
		</div>
	</footer>
</div>
