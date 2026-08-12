<script lang="ts">
	import { PROOF_TASKS } from '$lib/proof/tasks';
	import { byId } from '$lib/agents/registry';
	import { CATEGORY_META } from '$lib/agents/types';
	import Card from '$lib/components/ui/Card.svelte';
	import Icon from '$lib/components/ui/Icon.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import Button from '$lib/components/ui/Button.svelte';
</script>

<svelte:head>
	<title>Agent Advantage Report — HIVE</title>
</svelte:head>

<div class="py-4">
	<!-- header -->
	<div class="mb-8 max-w-2xl">
		<p class="mb-3 inline-flex items-center gap-2 rounded-full border border-line bg-white px-3.5 py-1.5 text-[12px] font-semibold text-sub">
			<Icon name="doc" size={13} /> Agent Advantage Report
		</p>
		<h1 class="text-3xl font-bold tracking-tight sm:text-4xl">
			Does hiring an agent beat doing the job yourself?
		</h1>
		<p class="mt-3 text-[15px] leading-relaxed text-sub">
			We ran the same three jobs twice over identical windows and market data — once through an
			agent hired on HIVE, once the way a human actually does it. Time, cost and output quality,
			measured, with the outputs attached. One task is trading — the high-stakes case.
		</p>
	</div>

	<!-- summary strip -->
	<div class="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
		{#each [{ label: 'Tasks measured, both ways', value: '3', note: 'trading · liquidity · yield' }, { label: 'Human time eliminated', value: '13.4 h', note: 'across the three windows' }, { label: 'Avg quality delta vs manual', value: '+2.8×', note: 'P&L / fees / realised yield' }] as s (s.label)}
			<Card>
				<p class="text-[12px] font-medium text-sub">{s.label}</p>
				<p class="tabular mt-1.5 text-3xl font-bold tracking-tight">{s.value}</p>
				<p class="mt-1 text-[12px] text-faint">{s.note}</p>
			</Card>
		{/each}
	</div>

	<!-- tasks -->
	<div class="space-y-8">
		{#each PROOF_TASKS as task, ti (task.id)}
			{@const agent = byId(task.agentId)}
			<section>
				<div class="mb-4 flex flex-wrap items-center gap-2.5">
					<span class="grid size-8 place-items-center rounded-full bg-ink text-[13px] font-bold text-white">
						{ti + 1}
					</span>
					<h2 class="text-xl font-bold tracking-tight">{task.title}</h2>
					<span class="rounded-full border border-line bg-white px-2.5 py-0.5 text-[11px] font-bold text-sub">
						{task.category}
					</span>
					{#if task.highStakes}
						<span class="rounded-full bg-warn/15 px-2.5 py-0.5 text-[11px] font-bold text-sub">HIGH-STAKES</span>
					{/if}
					<Badge kind={task.provenance} />
				</div>
				<p class="tabular mb-4 text-[12px] text-faint">{task.window}</p>

				<div class="grid gap-4 lg:grid-cols-2">
					<!-- agent side -->
					<Card dark>
						<div class="mb-3 flex items-center gap-2.5">
							{#if agent}
								<span class="grid size-9 place-items-center rounded-xl bg-white text-ink">
									<Icon name={CATEGORY_META[agent.category].icon} size={16} />
								</span>
							{/if}
							<div>
								<p class="text-[14px] font-bold">
									With <a href="/agents/{task.agentId}" class="underline decoration-white/30 hover:decoration-white">{task.agentName}</a>
								</p>
								<p class="text-[11px] text-white/45">hired through HIVE, leash on</p>
							</div>
						</div>
						<p class="text-[13px] leading-relaxed text-white/60">{task.setup}</p>
						<p class="mt-4 border-t border-white/10 pt-3 text-[12px] leading-relaxed text-white/45">
							<b class="text-white/70">Output attached:</b> {task.outputs.agent}
						</p>
					</Card>
					<!-- manual side -->
					<Card>
						<div class="mb-3 flex items-center gap-2.5">
							<span class="grid size-9 place-items-center rounded-xl bg-page text-sub">
								<Icon name="users" size={16} />
							</span>
							<div>
								<p class="text-[14px] font-bold">Doing it yourself</p>
								<p class="text-[11px] text-faint">same plan, human schedule</p>
							</div>
						</div>
						<p class="text-[13px] leading-relaxed text-sub">{task.manualSetup}</p>
						<p class="mt-4 border-t border-line pt-3 text-[12px] leading-relaxed text-faint">
							<b class="text-sub">Output attached:</b> {task.outputs.manual}
						</p>
					</Card>
				</div>

				<!-- metric table -->
				<Card class="mt-4" padded={false}>
					<div class="overflow-x-auto">
						<table class="w-full min-w-[620px] text-[13px]">
							<thead>
								<tr class="border-b border-line text-left text-[11px] font-bold tracking-wide text-faint uppercase">
									<th class="px-5 py-3.5">Measure</th>
									<th class="px-5 py-3.5">Agent</th>
									<th class="px-5 py-3.5">Manual</th>
									<th class="px-5 py-3.5">Delta</th>
								</tr>
							</thead>
							<tbody class="divide-y divide-line">
								{#each task.metrics as m (m.label)}
									<tr>
										<td class="px-5 py-3 font-medium text-sub">{m.label}</td>
										<td class="tabular px-5 py-3 font-bold {m.winner === 'agent' ? 'text-good-text' : ''}">
											{m.agent}
											{#if m.winner === 'agent'}<Icon name="check" size={12} class="ml-1 inline text-good-text" />{/if}
										</td>
										<td class="tabular px-5 py-3 {m.winner === 'manual' ? 'font-bold' : 'text-sub'}">{m.manual}</td>
										<td class="tabular px-5 py-3 font-semibold">{m.delta}</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
					<div class="border-t border-line bg-page/60 px-5 py-4">
						<p class="text-[13px] leading-relaxed text-sub">
							<b class="text-ink">Verdict:</b> {task.verdict}
						</p>
					</div>
				</Card>
			</section>
		{/each}
	</div>

	<!-- methodology -->
	<Card class="mt-10">
		<h2 class="mb-2 text-[15px] font-bold">Methodology & honesty</h2>
		<ul class="space-y-2 text-[13px] leading-relaxed text-sub">
			<li class="flex gap-2"><Icon name="check" size={14} class="mt-0.5 shrink-0 text-good-text" /> Both runs of every task use the same window, the same starting capital and the same real market data — the only variable is who does the work.</li>
			<li class="flex gap-2"><Icon name="check" size={14} class="mt-0.5 shrink-0 text-good-text" /> Every number carries a provenance badge. BACKTEST means simulated against real historical data; entries flip to ON-CHAIN with BscScan receipts as the agents' mainnet history is indexed.</li>
			<li class="flex gap-2"><Icon name="check" size={14} class="mt-0.5 shrink-0 text-good-text" /> Where the manual run wins a line (usually raw gas), it is shown winning — the report measures, it does not advertise.</li>
		</ul>
		<div class="mt-5 flex flex-wrap gap-3">
			<Button variant="primary" href="/marketplace">Hire the agents measured here <Icon name="arrow-up-right" size={14} /></Button>
			<Button variant="ghost" href="/">Back to overview</Button>
		</div>
	</Card>
</div>
