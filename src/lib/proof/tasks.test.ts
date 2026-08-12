import { describe, expect, it } from 'vitest';
import { PROOF_TASKS } from './tasks';
import { byId } from '../agents/registry';

describe('agent advantage report (TermiX requirements)', () => {
	it('measures at least 3 tasks', () => {
		expect(PROOF_TASKS.length).toBeGreaterThanOrEqual(3);
	});

	it('includes a high-stakes trading task', () => {
		expect(PROOF_TASKS.some((t) => t.highStakes && t.category === 'Trading')).toBe(true);
	});

	it('reports time, cost and quality on every task', () => {
		for (const task of PROOF_TASKS) {
			expect(task.metrics.length, task.id).toBeGreaterThanOrEqual(4);
			const labels = task.metrics.map((m) => m.label.toLowerCase()).join(' ');
			expect(labels, `${task.id} must measure time or coverage`).toMatch(/time|fills|range|venue/);
			expect(labels, `${task.id} must measure cost`).toMatch(/gas|cost|migrations/);
		}
	});

	it('attaches outputs for both runs and a verdict', () => {
		for (const task of PROOF_TASKS) {
			expect(task.outputs.agent.length, task.id).toBeGreaterThan(20);
			expect(task.outputs.manual.length, task.id).toBeGreaterThan(20);
			expect(task.verdict.length, task.id).toBeGreaterThan(40);
		}
	});

	it('is honest: every task admits at least one line the manual run wins', () => {
		for (const task of PROOF_TASKS) {
			expect(
				task.metrics.some((m) => m.winner === 'manual'),
				`${task.id} should not read as pure advertising`
			).toBe(true);
		}
	});

	it('references real agents from the registry', () => {
		for (const task of PROOF_TASKS) {
			expect(byId(task.agentId), `${task.id} -> ${task.agentId}`).toBeDefined();
		}
	});
});
