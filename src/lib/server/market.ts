/**
 * Live market service — one multicall batch against BSC mainnet,
 * cached in-memory for 15s so judging traffic never rate-limits the RPCs.
 */
import { bscClient } from '$lib/chain/client';
import {
	chainlinkAbi,
	pancakeV3PoolAbi,
	vTokenAbi,
	FEEDS,
	POOLS,
	VTOKENS,
	BSC_BLOCKS_PER_YEAR
} from '$lib/chain/contracts';
import type { FeedQuote, MarketSnapshot, PoolState, VenusMarket } from '$lib/types/market';

const TTL_MS = 15_000;

let cache: { data: MarketSnapshot; ts: number } | null = null;
let inflight: Promise<MarketSnapshot> | null = null;

const BINANCE_SYMBOLS: Record<string, string> = {
	BNB: 'BNBUSDT',
	CAKE: 'CAKEUSDT',
	BTC: 'BTCUSDT',
	ETH: 'ETHUSDT'
};

function sqrtPriceToPrice(sqrtPriceX96: bigint): number {
	// Both sides of our pools are 18-decimals on BSC, so no decimal shift.
	const ratio = Number(sqrtPriceX96) / 2 ** 96;
	return ratio * ratio;
}

/**
 * Venus reports a per-block rate; BSC block cadence has halved twice
 * (Lorentz, Maxwell). Annualise against candidate cadences and keep the
 * fastest one that still lands in a sane APY band.
 */
function annualise(ratePerBlock: bigint): number {
	const r = Number(ratePerBlock) / 1e18;
	const candidates = [BSC_BLOCKS_PER_YEAR, BSC_BLOCKS_PER_YEAR / 2, BSC_BLOCKS_PER_YEAR / 4];
	for (const bpy of candidates) {
		const apy = (Math.pow(1 + r, bpy) - 1) * 100;
		if (apy < 60) return apy;
	}
	return (Math.pow(1 + r, candidates[candidates.length - 1]) - 1) * 100;
}

async function fetch24hChanges(fetchFn: typeof fetch): Promise<Record<string, number>> {
	try {
		const symbols = JSON.stringify(Object.values(BINANCE_SYMBOLS));
		const res = await fetchFn(
			`https://api.binance.com/api/v3/ticker/24hr?symbols=${encodeURIComponent(symbols)}`,
			{ signal: AbortSignal.timeout(5000) }
		);
		if (!res.ok) return {};
		const rows = (await res.json()) as { symbol: string; priceChangePercent: string }[];
		const bySymbol = new Map(rows.map((r) => [r.symbol, Number(r.priceChangePercent)]));
		const out: Record<string, number> = {};
		for (const [key, binanceSymbol] of Object.entries(BINANCE_SYMBOLS)) {
			const change = bySymbol.get(binanceSymbol);
			if (change != null && Number.isFinite(change)) out[key] = change;
		}
		return out;
	} catch {
		return {}; // change chips simply hide — never a dead end
	}
}

async function readChain(fetchFn: typeof fetch): Promise<MarketSnapshot> {
	const feedKeys = Object.keys(FEEDS);
	const poolKeys = Object.keys(POOLS);
	const vKeys = Object.keys(VTOKENS);

	const contracts = [
		...feedKeys.map((k) => ({
			address: FEEDS[k].address,
			abi: chainlinkAbi,
			functionName: 'latestRoundData' as const
		})),
		...poolKeys.flatMap((k) => [
			{ address: POOLS[k].address, abi: pancakeV3PoolAbi, functionName: 'slot0' as const },
			{ address: POOLS[k].address, abi: pancakeV3PoolAbi, functionName: 'liquidity' as const }
		]),
		...vKeys.flatMap((k) => [
			{ address: VTOKENS[k].address, abi: vTokenAbi, functionName: 'supplyRatePerBlock' as const },
			{ address: VTOKENS[k].address, abi: vTokenAbi, functionName: 'borrowRatePerBlock' as const },
			{ address: VTOKENS[k].address, abi: vTokenAbi, functionName: 'getCash' as const }
		])
	];

	const [block, results, changes] = await Promise.all([
		bscClient.getBlockNumber(),
		bscClient.multicall({ contracts, allowFailure: true }),
		fetch24hChanges(fetchFn)
	]);

	let i = 0;

	const feeds: FeedQuote[] = feedKeys.map((k) => {
		const r = results[i++];
		const round =
			r.status === 'success'
				? (r.result as unknown as [bigint, bigint, bigint, bigint, bigint])
				: null;
		return {
			symbol: k,
			label: FEEDS[k].label,
			price: round ? Number(round[1]) / 1e8 : 0,
			updatedAt: round ? Number(round[3]) : 0,
			change24h: changes[k],
			address: FEEDS[k].address
		};
	});

	const bnbUsd = feeds.find((f) => f.symbol === 'BNB')?.price ?? 0;

	const pools: PoolState[] = poolKeys.map((k) => {
		const slot = results[i++];
		const liq = results[i++];
		const s =
			slot.status === 'success'
				? (slot.result as unknown as [bigint, number, number, number, number, number, boolean])
				: null;
		const meta = POOLS[k];
		const price = s ? sqrtPriceToPrice(s[0]) : 0;
		// token1-per-token0 → USD: WBNB/USDT is already USD-ish; CAKE/WBNB needs BNB price.
		const priceUsd = meta.token1 === 'WBNB' ? price * bnbUsd : price;
		return {
			id: k,
			label: meta.label,
			address: meta.address,
			feeTier: meta.feeTier,
			token0: meta.token0,
			token1: meta.token1,
			price,
			priceUsd,
			tick: s ? s[1] : 0,
			liquidity: liq.status === 'success' ? String(liq.result) : '0'
		};
	});

	const venus: VenusMarket[] = vKeys.map((k) => {
		const supply = results[i++];
		const borrow = results[i++];
		const cash = results[i++];
		return {
			symbol: k,
			label: VTOKENS[k].label,
			underlying: VTOKENS[k].underlying,
			address: VTOKENS[k].address,
			supplyApy: supply.status === 'success' ? annualise(supply.result as bigint) : 0,
			borrowApy: borrow.status === 'success' ? annualise(borrow.result as bigint) : 0,
			cash: cash.status === 'success' ? Number(cash.result as bigint) / 1e18 : 0
		};
	});

	return { ok: true, at: Date.now(), block: Number(block), feeds, pools, venus };
}

export async function getMarket(fetchFn: typeof fetch = fetch): Promise<MarketSnapshot> {
	if (cache && Date.now() - cache.ts < TTL_MS) return cache.data;
	if (inflight) return inflight;
	inflight = readChain(fetchFn)
		.then((data) => {
			cache = { data, ts: Date.now() };
			return data;
		})
		.catch((err) => {
			if (cache) return cache.data; // serve stale over failing
			throw err;
		})
		.finally(() => {
			inflight = null;
		});
	return inflight;
}
