<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { page } from '$app/state';
	import { fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { theme } from '$lib/stores/theme.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import Logo from '$lib/components/ui/Logo.svelte';
	import WalletButton from '$lib/components/wallet/WalletButton.svelte';
	import WalletModal from '$lib/components/wallet/WalletModal.svelte';

	let { children } = $props();

	const nav = [
		{ href: '/', icon: 'home', label: 'Home' },
		{ href: '/marketplace', icon: 'market', label: 'Marketplace' },
		{ href: '/dashboard', icon: 'gauge', label: 'Mission Control' },
		{ href: '/proof', icon: 'proof', label: 'Proof' }
	];

	const active = (href: string) =>
		href === '/' ? page.url.pathname === '/' : page.url.pathname.startsWith(href);

	const activeIndex = $derived(nav.findIndex((n) => active(n.href)));

	// ── scroll-aware navbar: starts generous, condenses on scroll ──
	let scrollY = $state(0);
	const scrolled = $derived(scrollY > 32);

	// ── sliding selection pill (top nav) ────────────────────────────
	let navWrap = $state<HTMLElement | null>(null);
	let pill = $state({ x: 0, w: 0, on: false });

	function movePill() {
		const el = navWrap?.querySelector<HTMLElement>('[data-active="true"]');
		if (el) pill = { x: el.offsetLeft, w: el.offsetWidth, on: true };
		else pill = { ...pill, on: false };
	}

	$effect(() => {
		void page.url.pathname;
		requestAnimationFrame(movePill);
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<svelte:window bind:scrollY onresize={movePill} />

<div class="min-h-screen">
	<!-- ═══ Floating glass navbar ═══ -->
	<header class="fixed inset-x-0 top-0 z-40 px-3 pt-3 sm:px-5">
		<div
			class="mx-auto flex items-center gap-3 rounded-full bg-card/80 shadow-glass backdrop-blur-2xl backdrop-saturate-150 transition-all duration-500 [transition-timing-function:var(--ease-out-quart)] {scrolled
				? 'h-[52px] max-w-[960px] px-2.5 sm:px-3'
				: 'h-[72px] max-w-[1140px] px-3.5 sm:px-5'}"
		>
			<a href="/" class="group grid shrink-0 place-items-center pl-1" aria-label="HIVE home">
				<span
					class="grid place-items-center text-cta transition-all duration-500 [transition-timing-function:var(--ease-spring)] group-hover:rotate-[-10deg]"
				>
					<Logo size={scrolled ? 24 : 30} />
				</span>
			</a>

			<nav bind:this={navWrap} class="relative ml-2 hidden items-center md:flex">
				<!-- sliding selection pill -->
				<span
					class="absolute top-1/2 h-9 -translate-y-1/2 rounded-full bg-cta transition-all duration-[420ms] [transition-timing-function:var(--ease-spring)]"
					style="left: {pill.x}px; width: {pill.w}px; opacity: {pill.on ? 1 : 0}"
					aria-hidden="true"
				></span>
				{#each nav as item (item.href)}
					<a
						href={item.href}
						data-active={active(item.href)}
						class="relative z-10 rounded-full px-4 py-2 text-[13px] font-semibold transition-colors duration-300 {active(
							item.href
						)
							? 'text-cta-fg'
							: 'text-sub hover:text-ink'}"
					>
						{item.label}
					</a>
				{/each}
			</nav>

			<div class="ml-auto flex items-center gap-2">
				<button
					onclick={() => theme.toggle()}
					class="grid size-9 place-items-center rounded-full border border-line bg-card/80 text-sub transition-all duration-200 hover:scale-105 hover:text-ink active:scale-95"
					aria-label="Toggle dark mode"
					title={theme.mode === 'light' ? 'Switch to dark' : 'Switch to light'}
				>
					<Icon name={theme.mode === 'light' ? 'moon' : 'sun'} size={15} />
				</button>
				<a
					href="https://github.com/iakshkhurana/the-bnb-hack"
					target="_blank"
					rel="noreferrer"
					class="hidden size-9 place-items-center rounded-full border border-line bg-card/80 text-sub transition-all duration-200 hover:scale-105 hover:text-ink active:scale-95 sm:grid"
					aria-label="GitHub repository"
				>
					<Icon name="external" size={14} />
				</a>
				<WalletButton />
			</div>
		</div>
	</header>

	<!-- ═══ Floating icon rail (desktop) ═══ -->
	<aside
		class="fixed top-1/2 left-4 z-40 hidden -translate-y-1/2 rounded-full bg-card/90 p-2 shadow-rail backdrop-blur-xl lg:block"
	>
		<div class="relative flex flex-col items-center gap-1.5">
			<span
				class="absolute left-0 size-10 rounded-full bg-cta transition-transform duration-[420ms] [transition-timing-function:var(--ease-spring)]"
				style="transform: translateY({Math.max(activeIndex, 0) * 46}px); opacity: {activeIndex >= 0
					? 1
					: 0}"
				aria-hidden="true"
			></span>
			{#each nav as item (item.href)}
				<a
					href={item.href}
					title={item.label}
					aria-label={item.label}
					class="relative z-10 grid size-10 place-items-center rounded-full transition-all duration-300 {active(
						item.href
					)
						? 'text-cta-fg'
						: 'text-sub hover:scale-110 hover:text-ink'}"
				>
					<Icon name={item.icon} size={18} />
				</a>
			{/each}
		</div>
	</aside>

	<!-- ═══ Mobile bottom nav ═══ -->
	<nav
		class="fixed bottom-4 left-1/2 z-40 -translate-x-1/2 rounded-full bg-card/95 p-1.5 shadow-rail backdrop-blur-xl lg:hidden"
	>
		<div class="relative flex items-center gap-1">
			<span
				class="absolute left-0 size-10 rounded-full bg-cta transition-transform duration-[420ms] [transition-timing-function:var(--ease-spring)]"
				style="transform: translateX({Math.max(activeIndex, 0) * 44}px); opacity: {activeIndex >= 0
					? 1
					: 0}"
				aria-hidden="true"
			></span>
			{#each nav as item (item.href)}
				<a
					href={item.href}
					aria-label={item.label}
					class="relative z-10 grid size-10 place-items-center rounded-full transition-colors duration-300 {active(
						item.href
					)
						? 'text-cta-fg'
						: 'text-sub'}"
				>
					<Icon name={item.icon} size={18} />
				</a>
			{/each}
		</div>
	</nav>

	<main class="mx-auto max-w-[1140px] px-4 pt-[104px] pb-28 sm:px-6 lg:pb-16 lg:pl-16">
		{#key page.url.pathname}
			<div in:fly={{ y: 14, duration: 420, easing: cubicOut, delay: 40 }}>
				{@render children()}
			</div>
		{/key}
	</main>

	<WalletModal />

	<footer class="border-t border-line">
		<div
			class="mx-auto flex max-w-[1140px] flex-wrap items-center gap-x-6 gap-y-2 px-4 py-6 text-[12px] text-sub sm:px-6 lg:pl-16"
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
