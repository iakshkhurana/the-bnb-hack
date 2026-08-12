<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
	import { page } from '$app/state';
	import { fly } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
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

	const activeIndex = $derived(nav.findIndex((n) => active(n.href)));

	// ── scroll-aware navbar ─────────────────────────────────────────
	let scrollY = $state(0);
	const scrolled = $derived(scrollY > 24);

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
			class="mx-auto flex max-w-[1240px] items-center gap-3 rounded-full bg-white/75 shadow-glass backdrop-blur-2xl backdrop-saturate-150 transition-all duration-500 [transition-timing-function:var(--ease-out-quart)] {scrolled
				? 'h-[52px] max-w-[1080px] px-2.5 sm:px-3'
				: 'h-16 px-3 sm:px-4'}"
		>
			<a href="/" class="group flex shrink-0 items-center gap-2.5 pl-1">
				<span
					class="grid place-items-center rounded-xl bg-ink text-white transition-all duration-500 [transition-timing-function:var(--ease-spring)] group-hover:rotate-[-8deg] {scrolled
						? 'size-8'
						: 'size-9'}"
				>
					<Icon name="hive" size={scrolled ? 17 : 20} strokeWidth={1.6} />
				</span>
				<span class="text-[16px] font-bold tracking-tight">HIVE</span>
				<span
					class="mt-0.5 hidden rounded-full border border-line bg-white px-2 py-0.5 text-[9px] font-bold tracking-[0.08em] text-sub transition-opacity duration-300 md:inline {scrolled
						? 'opacity-0'
						: 'opacity-100'}"
				>
					BNB CHAIN
				</span>
			</a>

			<nav bind:this={navWrap} class="relative ml-2 hidden items-center md:flex">
				<!-- sliding black pill -->
				<span
					class="absolute top-1/2 h-9 -translate-y-1/2 rounded-full bg-ink transition-all duration-[420ms] [transition-timing-function:var(--ease-spring)]"
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
							? 'text-white'
							: 'text-sub hover:text-ink'}"
					>
						{item.label}
					</a>
				{/each}
			</nav>

			<div class="ml-auto flex items-center gap-2">
				<a
					href="https://github.com/iakshkhurana/the-bnb-hack"
					target="_blank"
					rel="noreferrer"
					class="hidden size-9 place-items-center rounded-full border border-line bg-white/80 text-sub transition-all duration-200 hover:scale-105 hover:text-ink active:scale-95 sm:grid"
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
		class="fixed top-1/2 left-4 z-40 hidden -translate-y-1/2 rounded-full bg-white/85 p-2 shadow-rail backdrop-blur-xl lg:block"
	>
		<div class="relative flex flex-col items-center gap-1.5">
			<!-- sliding black disc -->
			<span
				class="absolute left-0 size-10 rounded-full bg-ink transition-transform duration-[420ms] [transition-timing-function:var(--ease-spring)]"
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
						? 'text-white'
						: 'text-sub hover:scale-110 hover:text-ink'}"
				>
					<Icon name={item.icon} size={18} />
				</a>
			{/each}
		</div>
	</aside>

	<!-- ═══ Mobile bottom nav ═══ -->
	<nav
		class="fixed bottom-4 left-1/2 z-40 -translate-x-1/2 rounded-full bg-white/90 p-1.5 shadow-rail backdrop-blur-xl lg:hidden"
	>
		<div class="relative flex items-center gap-1">
			<span
				class="absolute left-0 size-10 rounded-full bg-ink transition-transform duration-[420ms] [transition-timing-function:var(--ease-spring)]"
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
						? 'text-white'
						: 'text-sub'}"
				>
					<Icon name={item.icon} size={18} />
				</a>
			{/each}
		</div>
	</nav>

	<main class="mx-auto max-w-[1280px] px-4 pt-[92px] pb-28 sm:px-6 lg:pb-16 lg:pl-20">
		{#key page.url.pathname}
			<div in:fly={{ y: 14, duration: 420, easing: cubicOut, delay: 40 }}>
				{@render children()}
			</div>
		{/key}
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
