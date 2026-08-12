/** Shared shape of the live market snapshot served by /api/market. */

export interface FeedQuote {
	symbol: string;
	label: string;
	price: number;
	updatedAt: number; // unix seconds, from Chainlink
	change24h?: number; // percent, from Binance spot
	address: string;
}

export interface PoolState {
	id: string;
	label: string;
	address: string;
	feeTier: string;
	token0: string;
	token1: string;
	/** token1 per token0 (e.g. USDT per WBNB) */
	price: number;
	priceUsd: number;
	tick: number;
	liquidity: string;
}

export interface VenusMarket {
	symbol: string;
	label: string;
	underlying: string;
	address: string;
	supplyApy: number;
	borrowApy: number;
	cash: number;
}

export interface MarketSnapshot {
	ok: boolean;
	at: number; // ms — when this snapshot was read
	block: number;
	feeds: FeedQuote[];
	pools: PoolState[];
	venus: VenusMarket[];
}
