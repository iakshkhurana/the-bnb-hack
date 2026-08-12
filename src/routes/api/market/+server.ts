import { json } from '@sveltejs/kit';
import { getMarket } from '$lib/server/market';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ fetch, setHeaders }) => {
	setHeaders({ 'cache-control': 'public, max-age=10' });
	try {
		return json(await getMarket(fetch));
	} catch {
		return json({ ok: false, at: Date.now(), block: 0, feeds: [], pools: [], venus: [] });
	}
};
