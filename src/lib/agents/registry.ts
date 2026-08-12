/**
 * The HIVE agent registry, 12 agents, 3 per category, every category
 * first-class. Allowlists reference the real BSC contracts each agent is
 * scoped to; wallets are the agents' own self-custodial (Altana) accounts.
 */
import type { Agent } from './types';

const PCS_POSITION_MANAGER = {
	label: 'PancakeSwap V3 Position Manager',
	address: '0x46a15b0b27311cedf172ab29e4f4766fbe7f4364'
};
const PCS_ROUTER = {
	label: 'PancakeSwap Smart Router',
	address: '0x13f4ea83d0bd40e75c8222255bc855a974568dd4'
};
const VENUS_COMPTROLLER = {
	label: 'Venus Comptroller',
	address: '0xfd36e2c2a6789db23113685031d7f16329158384'
};
const VENUS_VBNB = { label: 'Venus vBNB', address: '0xa07c5b74c9b40447a954e1466938b865b6bbea36' };
const VENUS_VUSDT = { label: 'Venus vUSDT', address: '0xfd5840cd36d94d7229439859c0112a4185bc0255' };
const VENUS_VUSDC = { label: 'Venus vUSDC', address: '0xeca88125a5adbe82614ffc12d0db554e2e2867c8' };

export const AGENTS: Agent[] = [
	// ── Rebalancing ────────────────────────────────────────────────
	{
		id: 'rangekeeper',
		name: 'RangeKeeper',
		tagline: 'Keeps your WBNB/USDT liquidity earning, not idling',
		category: 'rebalancing',
		version: '2.4.1',
		operator: 'Hive Labs',
		wallet: '0x8f3a91b27c40d15e6b7a02c9df34e8a1b5c6d701',
		network: 'testnet',
		description:
			'RangeKeeper manages a concentrated-liquidity position in the PancakeSwap V3 WBNB/USDT 0.05% pool. When price drifts within 12% of either range edge, it withdraws, recentres the range around the live tick, compounds earned fees back in, and re-deposits, all in one transaction bundle.',
		strategy: [
			'Watches the pool tick every block against the position range',
			'Triggers a recentre when price crosses the 12% edge buffer',
			'Compounds accrued fees into the new position on every reset',
			'Widens the range automatically when 24h volatility spikes'
		],
		venue: 'PancakeSwap V3 · WBNB/USDT 0.05%',
		poolId: 'wbnb-usdt',
		feedSymbol: 'BNB',
		riskLevel: 3,
		fee: { type: 'performance', label: '8% of fees earned' },
		monthlyUsd: 0,
		metrics: {
			apr30d: 31.4,
			maxDrawdown: -8.2,
			sharpe: 1.7,
			tvlUsd: 412_800,
			users: 143,
			actions30d: 96,
			avgGasUsd: 0.14,
			uptime: 99.7
		},
		provenance: { performance: 'backtest', activity: 'testnet' },
		leash: {
			spendCapBnb: 0.5,
			expiryDays: 30,
			allowlist: [PCS_POSITION_MANAGER, PCS_ROUTER]
		},
		seed: 101,
		erc8183: true,
		x402: false,
		launched: '2026-03-18'
	},
	{
		id: 'tidemaster',
		name: 'TideMaster',
		tagline: 'Volatility-aware ranges for CAKE/WBNB',
		category: 'rebalancing',
		version: '1.9.0',
		operator: 'Deepwater',
		wallet: '0x2b7e44a90cf1d2853a6b1e07c48f92d3a5e8b102',
		network: 'testnet',
		description:
			'TideMaster runs an adaptive-width strategy on the CAKE/WBNB 0.25% pool. Instead of fixed ranges, it sizes each range from realised volatility, tight ranges in calm markets for maximum fee capture, wide ranges in storms to avoid churn.',
		strategy: [
			'Computes 7-day realised volatility from live pool ticks',
			'Sets range width to 2.5× realised vol, recentred on price',
			'Skips resets when projected fees < 3× gas + slippage cost',
			'Parks liquidity to stable during extreme drawdown regimes'
		],
		venue: 'PancakeSwap V3 · CAKE/WBNB 0.25%',
		poolId: 'cake-wbnb',
		feedSymbol: 'CAKE',
		riskLevel: 4,
		fee: { type: 'performance', label: '10% of fees earned' },
		monthlyUsd: 0,
		metrics: {
			apr30d: 44.9,
			maxDrawdown: -14.6,
			sharpe: 1.3,
			tvlUsd: 187_500,
			users: 67,
			actions30d: 61,
			avgGasUsd: 0.17,
			uptime: 99.2
		},
		provenance: { performance: 'backtest', activity: 'testnet' },
		leash: {
			spendCapBnb: 0.4,
			expiryDays: 30,
			allowlist: [PCS_POSITION_MANAGER, PCS_ROUTER]
		},
		seed: 102,
		erc8183: true,
		x402: true,
		launched: '2026-04-02'
	},
	{
		id: 'driftguard',
		name: 'DriftGuard',
		tagline: 'Set-and-forget LP maintenance for conservative depositors',
		category: 'rebalancing',
		version: '3.0.2',
		operator: 'Hive Labs',
		wallet: '0x91c5f8e02ba7d6413c9e85a2f70b4d16e3a9c803',
		network: 'testnet',
		description:
			'DriftGuard is the conservative option: wide ranges on WBNB/USDT, infrequent resets, and a hard rule that it never crosses your gas budget. Built for depositors who want LP yield above HODL without watching charts.',
		strategy: [
			'Maintains a ±25% range around the 30-day moving price',
			'Resets at most twice a week, only outside the range',
			'Auto-compounds fees weekly when they exceed $5',
			'Halts and notifies rather than act in >8% hourly moves'
		],
		venue: 'PancakeSwap V3 · WBNB/USDT 0.05%',
		poolId: 'wbnb-usdt',
		feedSymbol: 'BNB',
		riskLevel: 2,
		fee: { type: 'flat', label: '$9 / month' },
		monthlyUsd: 9,
		metrics: {
			apr30d: 18.6,
			maxDrawdown: -4.1,
			sharpe: 2.1,
			tvlUsd: 903_200,
			users: 388,
			actions30d: 11,
			avgGasUsd: 0.12,
			uptime: 99.9
		},
		provenance: { performance: 'backtest', activity: 'testnet' },
		leash: {
			spendCapBnb: 0.25,
			expiryDays: 60,
			allowlist: [PCS_POSITION_MANAGER]
		},
		seed: 103,
		erc8183: false,
		x402: false,
		launched: '2025-11-20'
	},

	// ── Grid Trading ───────────────────────────────────────────────
	{
		id: 'gridhawk',
		name: 'GridHawk',
		tagline: 'Volatility harvesting on BNB/USDT, 24/7',
		category: 'grid',
		version: '4.1.0',
		operator: 'Talon Systems',
		wallet: '0x5d2c88b1f04ae973d2c5b0a8e61f74d90b3ea204',
		network: 'testnet',
		description:
			'GridHawk runs a 24-level geometric grid on BNB/USDT through PancakeSwap. Each filled buy places a paired sell one level up; each filled sell re-arms a buy below. It rebuilds the entire grid around live price whenever price escapes the outer band.',
		strategy: [
			'24 geometric levels spaced 0.85% apart around spot',
			'Every fill immediately arms its counter-order one level away',
			'Grid recentres when price exits the ±10% outer band',
			'Position size scales down as inventory skews to one side'
		],
		venue: 'PancakeSwap · BNB/USDT',
		feedSymbol: 'BNB',
		riskLevel: 3,
		fee: { type: 'performance', label: '12% of realised P&L' },
		monthlyUsd: 0,
		metrics: {
			apr30d: 26.8,
			maxDrawdown: -9.8,
			winRate: 71.3,
			sharpe: 1.5,
			tvlUsd: 265_400,
			users: 205,
			actions30d: 418,
			avgGasUsd: 0.09,
			uptime: 99.8
		},
		provenance: { performance: 'backtest', activity: 'testnet' },
		leash: { spendCapBnb: 1.0, expiryDays: 14, allowlist: [PCS_ROUTER] },
		seed: 201,
		erc8183: true,
		x402: false,
		launched: '2026-01-09'
	},
	{
		id: 'latticex',
		name: 'LatticeX',
		tagline: 'Tight-spread scalping grid for CAKE',
		category: 'grid',
		version: '2.2.3',
		operator: 'Latticeworks',
		wallet: '0xa48b03e5d17cf2960b8d4a3c5e92f80c1d6b7305',
		network: 'testnet',
		description:
			'LatticeX trades CAKE/USDT with a dense 40-level grid and sub-percent spacing, many small wins that compound. Higher turnover, higher risk: the strategy leans on CAKE volatility and throttles itself when spreads compress.',
		strategy: [
			'40 arithmetic levels spaced 0.45% apart',
			'Per-level size capped at 2.5% of allocated capital',
			'Throttles order rate when 1h volatility drops below 0.6%',
			'Hard stop and de-risk at -12% inventory drawdown'
		],
		venue: 'PancakeSwap · CAKE/USDT',
		feedSymbol: 'CAKE',
		riskLevel: 4,
		fee: { type: 'performance', label: '15% of realised P&L' },
		monthlyUsd: 0,
		metrics: {
			apr30d: 39.1,
			maxDrawdown: -16.4,
			winRate: 68.9,
			sharpe: 1.1,
			tvlUsd: 98_700,
			users: 84,
			actions30d: 1240,
			avgGasUsd: 0.07,
			uptime: 99.4
		},
		provenance: { performance: 'backtest', activity: 'testnet' },
		leash: { spendCapBnb: 0.6, expiryDays: 14, allowlist: [PCS_ROUTER] },
		seed: 202,
		erc8183: true,
		x402: true,
		launched: '2026-02-14'
	},
	{
		id: 'meshtrader',
		name: 'MeshTrader',
		tagline: 'Slow, wide BTC grid for patient capital',
		category: 'grid',
		version: '1.6.1',
		operator: 'Talon Systems',
		wallet: '0x7e91d40cb56af8324e0d9c1b7a85e63f92c4d506',
		network: 'testnet',
		description:
			'MeshTrader runs a wide, sparse grid on BTCB/USDT, 12 levels across a ±18% band. It trades rarely, wins big when volatility mean-reverts, and holds inventory through drawdowns instead of stopping out.',
		strategy: [
			'12 levels across ±18%, spacing widens away from spot',
			'Fills sized progressively larger toward band edges',
			'No stop-loss: inventory is carried, band recentres monthly',
			'Pauses new buys when funding regime turns strongly bearish'
		],
		venue: 'PancakeSwap · BTCB/USDT',
		feedSymbol: 'BTC',
		riskLevel: 2,
		fee: { type: 'flat', label: '$19 / month' },
		monthlyUsd: 19,
		metrics: {
			apr30d: 14.2,
			maxDrawdown: -6.3,
			winRate: 77.8,
			sharpe: 1.9,
			tvlUsd: 511_900,
			users: 156,
			actions30d: 37,
			avgGasUsd: 0.08,
			uptime: 99.9
		},
		provenance: { performance: 'backtest', activity: 'testnet' },
		leash: { spendCapBnb: 0.8, expiryDays: 30, allowlist: [PCS_ROUTER] },
		seed: 203,
		erc8183: false,
		x402: false,
		launched: '2025-12-01'
	},

	// ── Yield Optimisation ─────────────────────────────────────────
	{
		id: 'nectarrouter',
		name: 'NectarRouter',
		tagline: 'Your stables always at the best APR on BSC',
		category: 'yield',
		version: '3.3.0',
		operator: 'Hive Labs',
		wallet: '0xc59f271e83ad04b6d8e12f5c09b7a3e64d18f607',
		network: 'testnet',
		description:
			'NectarRouter watches supply APYs for USDT and USDC across Venus, Lista and PancakeSwap stable pools. When the top venue changes and the spread beats the migration cost, it moves, netting you the best available stable yield without ever thinking about it.',
		strategy: [
			'Polls venue APYs every block via on-chain reads',
			'Migrates when new venue beats current by >0.4% net of gas',
			'Caps any single venue at 60% of managed capital',
			'Only whitelisted blue-chip venues, no exotic collateral'
		],
		venue: 'Venus · Lista · PancakeSwap',
		venusSymbols: ['vUSDT', 'vUSDC'],
		riskLevel: 1,
		fee: { type: 'performance', label: '6% of yield earned' },
		monthlyUsd: 0,
		metrics: {
			apr30d: 9.8,
			maxDrawdown: -0.4,
			sharpe: 4.2,
			tvlUsd: 2_140_000,
			users: 611,
			actions30d: 23,
			avgGasUsd: 0.11,
			uptime: 100
		},
		provenance: { performance: 'backtest', activity: 'testnet' },
		leash: {
			spendCapBnb: 0.2,
			expiryDays: 90,
			allowlist: [VENUS_COMPTROLLER, VENUS_VUSDT, VENUS_VUSDC]
		},
		seed: 301,
		erc8183: true,
		x402: true,
		launched: '2025-10-05'
	},
	{
		id: 'apexyield',
		name: 'ApexYield',
		tagline: 'BNB working across lending and LSTs',
		category: 'yield',
		version: '2.0.4',
		operator: 'Summit Protocol',
		wallet: '0x3fa8c17d92be045e6a1d8c37b04f5e92a8c6d708',
		network: 'testnet',
		description:
			'ApexYield routes BNB between Venus supply, Lista liquid staking and PancakeSwap BNB pools, chasing the best risk-adjusted return on the chain’s native asset. It accounts for slashing, unstaking queues and utilisation spikes before every move.',
		strategy: [
			'Scores venues on APY minus exit-liquidity penalty',
			'Rebalances at most daily; ignores moves under 0.5%',
			'Keeps 10% instantly-withdrawable at all times',
			'Exits any venue whose utilisation exceeds 92%'
		],
		venue: 'Venus · Lista · PancakeSwap',
		venusSymbols: ['vBNB'],
		feedSymbol: 'BNB',
		riskLevel: 2,
		fee: { type: 'performance', label: '8% of yield earned' },
		monthlyUsd: 0,
		metrics: {
			apr30d: 6.9,
			maxDrawdown: -1.8,
			sharpe: 3.1,
			tvlUsd: 1_368_000,
			users: 429,
			actions30d: 19,
			avgGasUsd: 0.13,
			uptime: 99.9
		},
		provenance: { performance: 'backtest', activity: 'testnet' },
		leash: {
			spendCapBnb: 0.3,
			expiryDays: 60,
			allowlist: [VENUS_COMPTROLLER, VENUS_VBNB, PCS_ROUTER]
		},
		seed: 302,
		erc8183: true,
		x402: false,
		launched: '2026-01-28'
	},
	{
		id: 'harvestpilot',
		name: 'HarvestPilot',
		tagline: 'Farm rewards claimed, sold and compounded on schedule',
		category: 'yield',
		version: '1.4.2',
		operator: 'Combine Labs',
		wallet: '0x6b04e92fa1c8d73b5e26a09cf47d81b3e5a2c909',
		network: 'testnet',
		description:
			'HarvestPilot automates the boring half of farming: claiming CAKE rewards, swapping to your target asset, and re-staking, timed to gas conditions and reward decay, not to when you happen to remember.',
		strategy: [
			'Claims when pending rewards exceed 4× estimated gas',
			'Swaps rewards via the route with lowest live slippage',
			'Compounds into the source farm or routes to stables, your pick',
			'Batches actions into off-peak gas windows'
		],
		venue: 'PancakeSwap farms · Venus',
		feedSymbol: 'CAKE',
		venusSymbols: ['vUSDT'],
		riskLevel: 1,
		fee: { type: 'per-action', label: '$0.05 per harvest' },
		monthlyUsd: 0,
		metrics: {
			apr30d: 4.6,
			maxDrawdown: -0.2,
			sharpe: 3.8,
			tvlUsd: 754_300,
			users: 502,
			actions30d: 88,
			avgGasUsd: 0.06,
			uptime: 100
		},
		provenance: { performance: 'backtest', activity: 'testnet' },
		leash: {
			spendCapBnb: 0.1,
			expiryDays: 90,
			allowlist: [PCS_ROUTER, VENUS_VUSDT]
		},
		seed: 303,
		erc8183: false,
		x402: true,
		launched: '2026-03-30'
	},

	// ── Health Factor Monitoring ───────────────────────────────────
	{
		id: 'sentinel',
		name: 'Sentinel',
		tagline: 'Your Venus position never sees a liquidation',
		category: 'health',
		version: '5.0.1',
		operator: 'Hive Labs',
		wallet: '0xd17e58b3fa2c94065b8e01d7c3af62e94b5c8a10',
		network: 'testnet',
		description:
			'Sentinel watches your Venus health factor every block. If it decays toward your danger threshold, Sentinel acts in stages: first claiming and depositing pending rewards, then topping up collateral from a reserve you pre-approve, and as a last resort repaying debt, always the cheapest path back to safety.',
		strategy: [
			'Reads health factor every block via on-chain calls',
			'Stage 1 at HF 1.35: deposit pending rewards as collateral',
			'Stage 2 at HF 1.20: top up from your approved reserve',
			'Stage 3 at HF 1.08: repay debt directly, never liquidated'
		],
		venue: 'Venus core pool',
		venusSymbols: ['vBNB', 'vUSDT'],
		riskLevel: 1,
		fee: { type: 'flat', label: '$5 / month' },
		monthlyUsd: 5,
		metrics: {
			apr30d: 0,
			maxDrawdown: 0,
			tvlUsd: 4_820_000,
			users: 892,
			actions30d: 31,
			avgGasUsd: 0.1,
			uptime: 100
		},
		provenance: { performance: 'backtest', activity: 'testnet' },
		leash: {
			spendCapBnb: 0.5,
			expiryDays: 90,
			allowlist: [VENUS_COMPTROLLER, VENUS_VBNB, VENUS_VUSDT]
		},
		seed: 401,
		erc8183: true,
		x402: false,
		launched: '2025-09-12'
	},
	{
		id: 'pulseguard',
		name: 'PulseGuard',
		tagline: 'Deleverages you gently before the market does it violently',
		category: 'health',
		version: '2.7.0',
		operator: 'Nightwatch',
		wallet: '0x48c2f91ea05bd7364c8e5a12d9bf03e78a4d6b11',
		network: 'testnet',
		description:
			'PulseGuard manages leveraged loopers. Rather than a single panic threshold, it continuously trims leverage as volatility rises, small deleveraging steps in calm order flow beat one giant unwind in a crash.',
		strategy: [
			'Targets a volatility-scaled health factor floor (1.4–1.8)',
			'Trims 5–10% of debt per step when drifting under target',
			'Re-levers gradually when volatility normalises',
			'Emergency full unwind if oracle deviation exceeds 2%'
		],
		venue: 'Venus core pool',
		venusSymbols: ['vBNB', 'vUSDT', 'vUSDC'],
		feedSymbol: 'BNB',
		riskLevel: 2,
		fee: { type: 'performance', label: '4% of avoided-loss (est.)' },
		monthlyUsd: 0,
		metrics: {
			apr30d: 0,
			maxDrawdown: 0,
			tvlUsd: 1_960_000,
			users: 217,
			actions30d: 74,
			avgGasUsd: 0.12,
			uptime: 99.8
		},
		provenance: { performance: 'backtest', activity: 'testnet' },
		leash: {
			spendCapBnb: 0.6,
			expiryDays: 60,
			allowlist: [VENUS_COMPTROLLER, VENUS_VBNB, VENUS_VUSDT, VENUS_VUSDC]
		},
		seed: 402,
		erc8183: true,
		x402: true,
		launched: '2026-02-02'
	},
	{
		id: 'lifeline',
		name: 'Lifeline',
		tagline: 'The cheapest insurance in DeFi: $2 a month, zero liquidations',
		category: 'health',
		version: '1.2.0',
		operator: 'Combine Labs',
		wallet: '0xe94b7c25fd18a3062e9c04b5f8ad71c3b6e2d912',
		network: 'testnet',
		description:
			'Lifeline is the minimal health monitor: one job, done perfectly. It watches your health factor and repays just enough debt from your wallet to stay above your line. No strategy, no leverage games, a dead-simple guardian for small positions.',
		strategy: [
			'Single threshold you set (default HF 1.15)',
			'Repays the minimum debt needed to restore HF 1.30',
			'Uses only funds in your wallet, never touches collateral',
			'Sends a heartbeat receipt after every check-in'
		],
		venue: 'Venus core pool',
		venusSymbols: ['vUSDT'],
		riskLevel: 1,
		fee: { type: 'flat', label: '$2 / month' },
		monthlyUsd: 2,
		metrics: {
			apr30d: 0,
			maxDrawdown: 0,
			tvlUsd: 386_000,
			users: 1043,
			actions30d: 12,
			avgGasUsd: 0.05,
			uptime: 100
		},
		provenance: { performance: 'backtest', activity: 'testnet' },
		leash: {
			spendCapBnb: 0.15,
			expiryDays: 90,
			allowlist: [VENUS_VUSDT]
		},
		seed: 403,
		erc8183: false,
		x402: false,
		launched: '2026-05-11'
	}
];

export const byId = (id: string): Agent | undefined => AGENTS.find((a) => a.id === id);

export const byCategory = (cat: Agent['category']): Agent[] =>
	AGENTS.filter((a) => a.category === cat);
