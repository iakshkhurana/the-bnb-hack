/**
 * Deterministic performance engine.
 * Backtest curves, activity logs and heatmaps are generated from each
 * agent's seed, stable across reloads, honestly labelled BACKTEST in the
 * UI, and shaped by the agent's real risk/return profile. The interfaces
 * here are exactly what a Ponder indexer will feed once agents run on
 * mainnet, swap the generator, keep every component.
 */
import type { Agent, Category } from './types';

/** mulberry32, tiny deterministic PRNG */
function rng(seed: number): () => number {
	let a = seed >>> 0;
	return () => {
		a |= 0;
		a = (a + 0x6d2b79f5) | 0;
		let t = Math.imul(a ^ (a >>> 15), 1 | a);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

export interface EquityPoint {
	time: number; // unix seconds
	value: number; // index, 100 = start
}

/** Daily equity curve for the last `days`, indexed to 100. */
export function equityCurve(agent: Agent, days = 90): EquityPoint[] {
	const rand = rng(agent.seed);
	const dailyDrift = agent.metrics.apr30d / 100 / 365;
	const vol = (0.002 + agent.riskLevel * 0.0035) as number;
	const out: EquityPoint[] = [];
	// anchor to midnight so the curve is stable within a day
	const today = Math.floor(Date.now() / 86_400_000) * 86_400;
	let v = 100;
	for (let i = days; i >= 0; i--) {
		out.push({ time: today - i * 86_400, value: Number(v.toFixed(3)) });
		const shock = (rand() + rand() + rand() - 1.5) * 2 * vol; // ~normal
		v = Math.max(40, v * (1 + dailyDrift + shock));
	}
	return out;
}

export interface ActivityEntry {
	id: string;
	at: number; // ms
	kind: string;
	summary: string;
	detail: string;
	gasUsd: number;
	deltaUsd?: number;
}

const TEMPLATES: Record<Category, { kind: string; summary: string; detail: string }[]> = {
	rebalancing: [
		{
			kind: 'Rebalance',
			summary: 'Recentred liquidity range',
			detail: 'Withdrew position, set new range around live tick, redeposited in one bundle'
		},
		{
			kind: 'Compound',
			summary: 'Compounded earned fees',
			detail: 'Collected pool fees and added them back to the active position'
		},
		{
			kind: 'Widen',
			summary: 'Widened range on volatility spike',
			detail: 'Realised volatility crossed threshold, range width increased to reduce churn'
		}
	],
	grid: [
		{
			kind: 'Fill',
			summary: 'Grid buy filled, sell armed',
			detail: 'Buy level executed; paired sell placed one level above'
		},
		{
			kind: 'Fill',
			summary: 'Grid sell filled, buy re-armed',
			detail: 'Sell level executed; buy re-placed one level below'
		},
		{
			kind: 'Recentre',
			summary: 'Grid rebuilt around new price',
			detail: 'Price exited outer band, all levels cancelled and rebuilt around spot'
		}
	],
	yield: [
		{
			kind: 'Migrate',
			summary: 'Moved liquidity to higher APR venue',
			detail: 'Ranking flipped and spread cleared migration cost, capital rerouted'
		},
		{
			kind: 'Harvest',
			summary: 'Claimed and compounded rewards',
			detail: 'Pending rewards exceeded gas multiple, claimed, swapped, re-deposited'
		},
		{
			kind: 'Scan',
			summary: 'Venue APRs rescanned',
			detail: 'All whitelisted venues polled on-chain; current allocation still optimal'
		}
	],
	health: [
		{
			kind: 'Heartbeat',
			summary: 'Health factor checked, safe',
			detail: 'HF read on-chain, above target floor; no action required'
		},
		{
			kind: 'TopUp',
			summary: 'Collateral topped up',
			detail: 'HF drifted under stage threshold, reserve funds deposited as collateral'
		},
		{
			kind: 'Repay',
			summary: 'Debt partially repaid',
			detail: 'Minimum repayment executed to restore target health factor'
		}
	]
};

/** Recent activity log, most recent first. */
export function activityLog(agent: Agent, count = 14): ActivityEntry[] {
	const rand = rng(agent.seed * 7 + 13);
	const templates = TEMPLATES[agent.category];
	const cadenceH = Math.max(2, (30 * 24) / Math.max(agent.metrics.actions30d, 1));
	const out: ActivityEntry[] = [];
	let t = Date.now() - rand() * cadenceH * 1_800_000;
	for (let i = 0; i < count; i++) {
		const tpl = templates[Math.floor(rand() * templates.length)];
		const gas = agent.metrics.avgGasUsd * (0.7 + rand() * 0.6);
		const delta =
			agent.category === 'health' || tpl.kind === 'Scan' || tpl.kind === 'Heartbeat'
				? undefined
				: Number(((rand() - 0.28) * 60).toFixed(2));
		out.push({
			id: `${agent.id}-${i}`,
			at: Math.floor(t),
			kind: tpl.kind,
			summary: tpl.summary,
			detail: tpl.detail,
			gasUsd: Number(gas.toFixed(3)),
			deltaUsd: delta
		});
		t -= (0.5 + rand()) * cadenceH * 3_600_000;
	}
	return out;
}

/** Weekly activity heatmap, `weeks` columns × 7 rows, action counts. */
export function activityHeatmap(agent: Agent, weeks = 18): number[][] {
	const rand = rng(agent.seed * 31 + 7);
	const perDay = agent.metrics.actions30d / 30;
	return Array.from({ length: weeks }, () =>
		Array.from({ length: 7 }, () => {
			const burst = rand() < 0.12 ? 2.5 : 1;
			return Math.max(0, Math.round(perDay * burst * (rand() * 1.6 + 0.2)));
		})
	);
}

/** Headline stats derived from the equity curve, for a given window. */
export function curveStats(points: EquityPoint[]): {
	totalReturn: number;
	maxDrawdown: number;
} {
	if (points.length < 2) return { totalReturn: 0, maxDrawdown: 0 };
	const first = points[0].value;
	const last = points[points.length - 1].value;
	let peak = -Infinity;
	let mdd = 0;
	for (const p of points) {
		peak = Math.max(peak, p.value);
		mdd = Math.min(mdd, (p.value / peak - 1) * 100);
	}
	return { totalReturn: (last / first - 1) * 100, maxDrawdown: mdd };
}
