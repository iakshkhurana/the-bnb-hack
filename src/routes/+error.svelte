<script lang="ts">
	import { page } from '$app/state';
	import Button from '$lib/components/ui/Button.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
</script>

<svelte:head>
	<title>{page.status} · HIVE</title>
</svelte:head>

<div class="grid min-h-[60vh] place-items-center py-16 text-center">
	<div>
		<span class="mx-auto mb-5 grid size-16 place-items-center rounded-card bg-cta text-cta-fg">
			<Icon name="hive" size={28} />
		</span>
		<p class="tabular text-[13px] font-bold text-faint">{page.status}</p>
		<h1 class="mt-1 text-2xl font-bold tracking-tight">
			{page.status === 404 ? 'This agent went off-grid' : 'Something glitched'}
		</h1>
		<p class="mx-auto mt-2 max-w-sm text-[14px] text-sub">
			{page.status === 404
				? 'The page you are after does not exist. The marketplace, however, very much does.'
				: page.error?.message ?? 'An unexpected error occurred.'}
		</p>
		<div class="mt-6 flex justify-center gap-3">
			<Button variant="primary" href="/marketplace">Browse agents</Button>
			<Button variant="ghost" href="/">Home</Button>
		</div>
	</div>
</div>
