/**
 * ERC-8004 agent economy stats via the 8004scan public API (AltLayer).
 * Anonymous tier works out of the box; add SCAN8004_API_KEY in .env to
 * lift rate limits to the hackathon Pro tier. Cached 5 minutes.
 */
import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import type { RequestHandler } from './$types';

interface ChainStats {
	chain_id: number;
	total_agents: number;
	daily_new_agents: number;
	total_feedbacks: number;
	average_feedback_score: number | null;
}

interface Erc8004Payload {
	ok: boolean;
	global: { totalAgents: number; dailyNewAgents: number; avgScore: number | null };
	bsc: { totalAgents: number; dailyNewAgents: number; totalFeedbacks: number; avgScore: number | null };
}

let cache: { ts: number; body: Erc8004Payload } | null = null;
const TTL = 5 * 60_000;

export const GET: RequestHandler = async ({ fetch, setHeaders }) => {
	setHeaders({ 'cache-control': 'public, max-age=120' });
	if (cache && Date.now() - cache.ts < TTL) return json(cache.body);

	try {
		const headers: Record<string, string> = {};
		if (env.SCAN8004_API_KEY) headers['X-API-Key'] = env.SCAN8004_API_KEY;

		const res = await fetch('https://8004scan.io/api/v1/public/stats', {
			headers,
			signal: AbortSignal.timeout(8000)
		});
		if (!res.ok) throw new Error(`upstream ${res.status}`);

		const raw = (await res.json()) as {
			data: {
				total_agents: number;
				daily_new_agents: number;
				average_feedback_score: number | null;
				chain_stats?: ChainStats[];
				chains_stats?: ChainStats[];
			};
		};

		const chains = raw.data.chain_stats ?? raw.data.chains_stats ?? [];
		const bsc = chains.find((c) => c.chain_id === 56);

		const body: Erc8004Payload = {
			ok: true,
			global: {
				totalAgents: raw.data.total_agents,
				dailyNewAgents: raw.data.daily_new_agents,
				avgScore: raw.data.average_feedback_score
			},
			bsc: {
				totalAgents: bsc?.total_agents ?? 0,
				dailyNewAgents: bsc?.daily_new_agents ?? 0,
				totalFeedbacks: bsc?.total_feedbacks ?? 0,
				avgScore: bsc?.average_feedback_score ?? null
			}
		};
		cache = { ts: Date.now(), body };
		return json(body);
	} catch {
		if (cache) return json(cache.body);
		return json({
			ok: false,
			global: { totalAgents: 0, dailyNewAgents: 0, avgScore: null },
			bsc: { totalAgents: 0, dailyNewAgents: 0, totalFeedbacks: 0, avgScore: null }
		});
	}
};
