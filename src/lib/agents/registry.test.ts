import { describe, expect, it } from 'vitest';
import { AGENTS, byCategory } from './registry';
import { CATEGORIES } from './types';
import { equityCurve, activityLog, activityHeatmap, curveStats } from './performance';

describe('registry integrity', () => {
	it('carries 12 agents', () => {
		expect(AGENTS).toHaveLength(12);
	});

	it('gives every category equal depth — 3 agents each', () => {
		for (const c of CATEGORIES) {
			expect(byCategory(c), `category ${c}`).toHaveLength(3);
		}
	});

	it('has unique ids and seeds', () => {
		expect(new Set(AGENTS.map((a) => a.id)).size).toBe(AGENTS.length);
		expect(new Set(AGENTS.map((a) => a.seed)).size).toBe(AGENTS.length);
	});

	it('uses valid lowercase hex for every wallet and allowlist address', () => {
		const hex = /^0x[0-9a-f]{40}$/;
		for (const a of AGENTS) {
			expect(a.wallet, `${a.id} wallet`).toMatch(hex);
			for (const item of a.leash.allowlist) {
				expect(item.address, `${a.id} allowlist ${item.label}`).toMatch(hex);
			}
		}
	});

	it('always scopes the leash to at least one contract', () => {
		for (const a of AGENTS) {
			expect(a.leash.allowlist.length, a.id).toBeGreaterThan(0);
			expect(a.leash.spendCapBnb, a.id).toBeGreaterThan(0);
			expect(a.leash.expiryDays, a.id).toBeGreaterThan(0);
		}
	});
});

describe('performance engine', () => {
	const agent = AGENTS[0];

	it('is deterministic — same seed, same curve', () => {
		expect(equityCurve(agent, 30)).toEqual(equityCurve(agent, 30));
	});

	it('produces one point per day plus the anchor', () => {
		expect(equityCurve(agent, 90)).toHaveLength(91);
	});

	it('starts curves at index 100', () => {
		expect(equityCurve(agent, 30)[0].value).toBe(100);
	});

	it('keeps drawdown non-positive', () => {
		for (const a of AGENTS) {
			expect(curveStats(equityCurve(a, 90)).maxDrawdown).toBeLessThanOrEqual(0);
		}
	});

	it('emits activity entries newest-first', () => {
		const log = activityLog(agent, 10);
		expect(log).toHaveLength(10);
		for (let i = 1; i < log.length; i++) {
			expect(log[i].at).toBeLessThanOrEqual(log[i - 1].at);
		}
	});

	it('shapes the heatmap as weeks × 7', () => {
		const heat = activityHeatmap(agent, 18);
		expect(heat).toHaveLength(18);
		for (const week of heat) expect(week).toHaveLength(7);
	});
});
