/**
 * Real market candles (Binance spot, keyless) for the trading charts.
 * Whitelisted symbols only; 60s in-memory cache per (symbol, interval).
 */
import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const ALLOWED = new Set(['BNBUSDT', 'CAKEUSDT', 'BTCUSDT', 'ETHUSDT']);
const INTERVALS = new Set(['15m', '1h', '4h', '1d']);

const cache = new Map<string, { ts: number; body: unknown }>();
const TTL = 60_000;

export const GET: RequestHandler = async ({ params, url, fetch, setHeaders }) => {
	const symbol = params.symbol.toUpperCase();
	const interval = url.searchParams.get('interval') ?? '1h';
	const limit = Math.min(Number(url.searchParams.get('limit') ?? 300), 500);

	if (!ALLOWED.has(symbol)) error(400, 'symbol not allowed');
	if (!INTERVALS.has(interval)) error(400, 'interval not allowed');

	const key = `${symbol}:${interval}:${limit}`;
	const hit = cache.get(key);
	if (hit && Date.now() - hit.ts < TTL) {
		setHeaders({ 'cache-control': 'public, max-age=30' });
		return json(hit.body);
	}

	const res = await fetch(
		`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`,
		{ signal: AbortSignal.timeout(6000) }
	);
	if (!res.ok) error(502, 'upstream unavailable');

	const raw = (await res.json()) as [number, string, string, string, string, string][];
	const candles = raw.map((k) => ({
		time: Math.floor(k[0] / 1000),
		open: Number(k[1]),
		high: Number(k[2]),
		low: Number(k[3]),
		close: Number(k[4]),
		volume: Number(k[5])
	}));

	cache.set(key, { ts: Date.now(), body: candles });
	setHeaders({ 'cache-control': 'public, max-age=30' });
	return json(candles);
};
