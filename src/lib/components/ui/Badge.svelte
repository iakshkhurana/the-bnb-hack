<script lang="ts">
	/**
	 * Data provenance badge, every metric on HIVE declares where it came from.
	 * LIVE = read from BSC right now · ONCHAIN = decoded from historical txs
	 * BACKTEST = simulated against real market data · CLAIMED = self-reported
	 */
	type Kind = 'live' | 'onchain' | 'backtest' | 'claimed' | 'testnet' | 'mainnet';

	let { kind, class: cls = '' }: { kind: Kind; class?: string } = $props();

	const styles: Record<Kind, { dot: string; text: string; label: string; title: string }> = {
		live: {
			dot: 'bg-good',
			text: 'text-good-text',
			label: 'LIVE',
			title: 'Read from BNB Smart Chain in real time'
		},
		onchain: {
			dot: 'bg-accent',
			text: 'text-accent-deep',
			label: 'ON-CHAIN',
			title: 'Decoded from verifiable transaction history'
		},
		backtest: {
			dot: 'bg-faint',
			text: 'text-sub',
			label: 'BACKTEST',
			title: 'Simulated against real historical market data'
		},
		claimed: {
			dot: 'bg-warn',
			text: 'text-sub',
			label: 'CLAIMED',
			title: 'Self-reported by the agent operator, not yet verified'
		},
		testnet: {
			dot: 'bg-accent-soft',
			text: 'text-accent-deep',
			label: 'TESTNET',
			title: 'Executing on BSC testnet (chapel)'
		},
		mainnet: {
			dot: 'bg-good',
			text: 'text-good-text',
			label: 'MAINNET',
			title: 'Executing on BSC mainnet'
		}
	};

	const s = $derived(styles[kind]);
</script>

<span
	title={s.title}
	class="inline-flex items-center gap-1.5 rounded-full border border-line bg-card px-2 py-0.5 text-[10px] font-bold tracking-wide {s.text} {cls}"
>
	<span class="size-1.5 rounded-full {s.dot}"></span>{s.label}
</span>
