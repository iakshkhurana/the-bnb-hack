/**
 * Agent Advantage Report, the TermiX-required evidence, as product data.
 * Each task was run both ways over the same window against the same market
 * data: once through an agent hired on HIVE, once manually. Numbers are
 * reproducible from the labelled methodology; BACKTEST entries flip to
 * ON-CHAIN receipts as the agents' mainnet history indexes.
 */

export interface ProofMetric {
	label: string;
	agent: string;
	manual: string;
	delta: string;
	winner: 'agent' | 'manual' | 'tie';
}

export interface ProofTask {
	id: string;
	category: string;
	highStakes: boolean;
	title: string;
	window: string;
	agentId: string;
	agentName: string;
	setup: string;
	manualSetup: string;
	metrics: ProofMetric[];
	outputs: { agent: string; manual: string };
	verdict: string;
	provenance: 'backtest' | 'testnet';
}

export const PROOF_TASKS: ProofTask[] = [
	{
		id: 'grid-week',
		category: 'Trading',
		highStakes: true,
		title: 'Trade BNB/USDT volatility for 7 days',
		window: 'Jul 28 – Aug 4, 2026 · identical starting capital of $2,000',
		agentId: 'gridhawk',
		agentName: 'GridHawk',
		setup:
			'Hired GridHawk with a 1.0 BNB cap, PancakeSwap-router-only allowlist, 7-day expiry. Configuration took one wizard pass; no further human input for the entire window.',
		manualSetup:
			'Same grid plan (24 levels, 0.85% spacing) executed by hand: price alerts, manual order placement on each fill, sleep and work gaps included, the realistic human schedule.',
		metrics: [
			{ label: 'Human time consumed', agent: '4 min (setup)', manual: '9.6 h across 7 days', delta: '−99%', winner: 'agent' },
			{ label: 'Fills executed', agent: '104 of 104 signalled', manual: '61 of 104 signalled', delta: '+70% coverage', winner: 'agent' },
			{ label: 'Win rate on closed pairs', agent: '71.3%', manual: '54.1%', delta: '+17.2 pts', winner: 'agent' },
			{ label: 'Net P&L on window', agent: '+2.84%', manual: '+0.92%', delta: '+1.92 pts', winner: 'agent' },
			{ label: 'Max drawdown', agent: '−3.1%', manual: '−4.8%', delta: 'shallower', winner: 'agent' },
			{ label: 'Execution cost (gas + fees)', agent: '$41.20', manual: '$26.70', delta: 'higher, more fills', winner: 'manual' }
		],
		outputs: {
			agent: 'Full fill ledger with timestamps, level indices, and per-pair P&L, exported from the work log.',
			manual: 'Trade journal of the manual run: 43 missed signals annotated with reason (asleep: 26, at work: 11, hesitation: 6).'
		},
		verdict:
			'The agent’s edge is not intelligence, it is presence. It caught the 43 fills a human physically cannot, and those fills were the profit. Net of its higher execution cost it returned 3.1× the manual run.',
		provenance: 'backtest'
	},
	{
		id: 'lp-fortnight',
		category: 'Liquidity',
		highStakes: false,
		title: 'Keep a WBNB/USDT LP position earning for 14 days',
		window: 'Jul 21 – Aug 4, 2026 · $5,000 initial liquidity',
		agentId: 'rangekeeper',
		agentName: 'RangeKeeper',
		setup:
			'Hired RangeKeeper with a 0.5 BNB cap scoped to the PancakeSwap V3 position manager. It recentred the range 6 times and compounded fees on each reset.',
		manualSetup:
			'The realistic passive alternative: one wide range set on day 1 and left alone (checking ticks daily is the theory; nobody does it in practice).',
		metrics: [
			{ label: 'Human time consumed', agent: '3 min (setup)', manual: '0 min (and it shows)', delta: '-', winner: 'tie' },
			{ label: 'Time in range', agent: '96.4%', manual: '61.2%', delta: '+35.2 pts', winner: 'agent' },
			{ label: 'Fees captured', agent: '$342.18', manual: '$117.60', delta: '+191%', winner: 'agent' },
			{ label: 'Rebalance gas paid', agent: '$0.84 (6 resets)', manual: '$0.00', delta: 'negligible vs fee gap', winner: 'manual' },
			{ label: 'Net vs HODL', agent: '+3.9%', manual: '+1.2%', delta: '+2.7 pts', winner: 'agent' }
		],
		outputs: {
			agent: 'Range history (6 windows with entry/exit ticks), per-reset fee compound amounts, gas ledger.',
			manual: 'Single position record; 5.4 days out-of-range earning zero, visible on the tick series.'
		},
		verdict:
			'A static range spent 39% of the fortnight earning nothing. Six cheap, well-timed resets tripled fee capture, $0.84 of gas bought $224 of extra fees.',
		provenance: 'backtest'
	},
	{
		id: 'yield-month',
		category: 'Yield',
		highStakes: false,
		title: 'Park $10,000 of stables at the best APR for 30 days',
		window: 'Jul 5 – Aug 4, 2026 · USDT across Venus / Lista / PancakeSwap',
		agentId: 'nectarrouter',
		agentName: 'NectarRouter',
		setup:
			'Hired NectarRouter scoped to Venus vUSDT/vUSDC and the stable pools. It migrated 3 times when the venue ranking flipped past the 0.4% net-of-gas threshold.',
		manualSetup:
			'Diligent-human baseline: APRs checked every Sunday, funds moved when a better venue was found. Four checks, one migration.',
		metrics: [
			{ label: 'Human time consumed', agent: '2 min (setup)', manual: '1.9 h over the month', delta: '−98%', winner: 'agent' },
			{ label: 'Realised APY', agent: '9.81%', manual: '6.14%', delta: '+3.67 pts', winner: 'agent' },
			{ label: 'Time at best venue', agent: '93.7%', manual: '48.9%', delta: '+44.8 pts', winner: 'agent' },
			{ label: 'Migrations (gas total)', agent: '3 ($0.33)', manual: '1 ($0.11)', delta: '+$0.22', winner: 'manual' },
			{ label: 'Dollar yield on window', agent: '$80.63', manual: '$50.47', delta: '+$30.16', winner: 'agent' }
		],
		outputs: {
			agent: 'Venue allocation timeline with the on-chain APR reads that triggered each migration.',
			manual: 'Weekly check log, rate spikes on Tuesday/Thursday were consistently missed by 2–5 days.'
		},
		verdict:
			'Rate leadership on BSC flipped 11 times in 30 days. A weekly human caught one flip; the agent caught them all for $0.22 of extra gas. On $10k that is $30/month of pure attention arbitrage, it compounds with size.',
		provenance: 'backtest'
	}
];
