/** Core domain types for HIVE agents. */

export type Category = 'rebalancing' | 'grid' | 'yield' | 'health';

export type Provenance = 'live' | 'onchain' | 'backtest' | 'claimed';

export interface AgentMetrics {
	/** 30-day annualised return, % */
	apr30d: number;
	/** worst peak-to-trough, % (negative) */
	maxDrawdown: number;
	/** % of closed actions that were profitable (trading categories) */
	winRate?: number;
	sharpe?: number;
	tvlUsd: number;
	users: number;
	actions30d: number;
	avgGasUsd: number;
	/** % uptime over 90d */
	uptime: number;
}

export interface LeashDefaults {
	spendCapBnb: number;
	expiryDays: number;
	/** Human-readable contract allowlist the session is scoped to */
	allowlist: { label: string; address: string }[];
}

export interface Agent {
	id: string;
	name: string;
	tagline: string;
	category: Category;
	version: string;
	operator: string;
	/** the agent's own self-custodial wallet */
	wallet: string;
	network: 'mainnet' | 'testnet';
	description: string;
	strategy: string[];
	venue: string;
	/** bindings into the live data layer */
	poolId?: 'wbnb-usdt' | 'cake-wbnb';
	feedSymbol?: 'BNB' | 'CAKE' | 'BTC' | 'ETH';
	venusSymbols?: string[];
	riskLevel: 1 | 2 | 3 | 4 | 5;
	fee: { type: 'performance' | 'flat' | 'per-action'; label: string };
	monthlyUsd: number;
	metrics: AgentMetrics;
	provenance: { performance: Provenance; activity: 'backtest' | 'testnet' | 'mainnet' };
	leash: LeashDefaults;
	/** Altana production skills this agent is composed from (skills.altana.network) */
	skills: string[];
	/** deterministic seed for backtest series + activity simulation */
	seed: number;
	erc8183: boolean;
	x402: boolean;
	launched: string;
}

export const CATEGORY_META: Record<
	Category,
	{ label: string; short: string; icon: string; blurb: string; kpi: string }
> = {
	rebalancing: {
		label: 'Rebalancing',
		short: 'LP ranges, reset automatically',
		icon: 'range',
		blurb:
			'Manages concentrated-liquidity ranges on PancakeSwap V3, recentring positions when price drifts so liquidity keeps earning instead of sitting idle.',
		kpi: 'Fees captured'
	},
	grid: {
		label: 'Grid Trading',
		short: 'Automated grid orders',
		icon: 'grid',
		blurb:
			'Places and manages ladders of buy/sell orders around live price, harvesting volatility on BNB pairs without a human watching the chart.',
		kpi: 'Win rate'
	},
	yield: {
		label: 'Yield Optimisation',
		short: 'Routes to the best APR',
		icon: 'leaf',
		blurb:
			'Watches supply rates across Venus, Lista and PancakeSwap farms and moves liquidity to the highest risk-adjusted APR the moment the ranking flips.',
		kpi: 'Net APY'
	},
	health: {
		label: 'Health Factor',
		short: 'Liquidation protection',
		icon: 'heart',
		blurb:
			'Monitors lending positions around the clock, topping up collateral or unwinding debt before the health factor ever reaches the liquidation line.',
		kpi: 'Saves executed'
	}
};

export const CATEGORIES = Object.keys(CATEGORY_META) as Category[];
