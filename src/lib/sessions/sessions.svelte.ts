/**
 * Session store, the "leash". A hire on HIVE is a scoped session grant:
 * spend cap, contract allowlist, expiry. Grant and revoke stay with the
 * owner; revocation is immediate.
 *
 * MVP persistence is localStorage with simulated grant/revoke receipts,
 * mirroring the Altana Keystore session shape 1:1, the swap to real
 * on-chain registration is a transport change, not a redesign.
 */
import { browser } from '$app/environment';
import { byId } from '$lib/agents/registry';

export interface Session {
	id: string;
	agentId: string;
	owner: string;
	sessionKey: string;
	spendCapBnb: number;
	/** BNB per hour the agent has been consuming (testnet cadence) */
	burnPerHour: number;
	createdAt: number;
	expiresAt: number;
	allowlist: { label: string; address: string }[];
	status: 'active' | 'revoked';
	grantSig?: string;
	revokedAt?: number;
	/** demo sessions burn simulated funds; real sessions never touch money until agents execute on-chain */
	demo?: boolean;
}

const KEY = 'hive.sessions.v1';

function randomHex(bytes: number): string {
	const arr = new Uint8Array(bytes);
	crypto.getRandomValues(arr);
	return '0x' + Array.from(arr, (b) => b.toString(16).padStart(2, '0')).join('');
}

class SessionStore {
	sessions = $state<Session[]>([]);

	constructor() {
		if (browser) {
			try {
				this.sessions = JSON.parse(localStorage.getItem(KEY) ?? '[]');
			} catch {
				this.sessions = [];
			}
		}
	}

	#save(): void {
		if (browser) localStorage.setItem(KEY, JSON.stringify(this.sessions));
	}

	grant(input: {
		agentId: string;
		owner: string;
		spendCapBnb: number;
		expiryDays: number;
		allowlist: { label: string; address: string }[];
		grantSig?: string;
		demo?: boolean;
	}): Session {
		const agent = byId(input.agentId);
		const actionsPerHour = agent ? agent.metrics.actions30d / (30 * 24) : 0.1;
		// gas-denominated burn: actions/hour × avg gas, expressed in BNB (~$800/BNB guard)
		const burnPerHour = Math.max(
			0.00002,
			(actionsPerHour * (agent?.metrics.avgGasUsd ?? 0.1)) / 500
		);
		const session: Session = {
			id: randomHex(8),
			agentId: input.agentId,
			owner: input.owner.toLowerCase(),
			sessionKey: randomHex(32),
			spendCapBnb: input.spendCapBnb,
			burnPerHour,
			createdAt: Date.now(),
			expiresAt: Date.now() + input.expiryDays * 86_400_000,
			allowlist: input.allowlist,
			status: 'active',
			grantSig: input.grantSig,
			demo: input.demo ?? true
		};
		this.sessions = [session, ...this.sessions];
		this.#save();
		return session;
	}

	revoke(id: string): void {
		this.sessions = this.sessions.map((s) =>
			s.id === id ? { ...s, status: 'revoked' as const, revokedAt: Date.now() } : s
		);
		this.#save();
	}

	forOwner(owner: string | null): Session[] {
		if (!owner) return [];
		return this.sessions.filter((s) => s.owner === owner.toLowerCase());
	}

	/** BNB consumed so far, grows in real time, capped at 92% of the leash. */
	spent(s: Session): number {
		// real-wallet sessions: signing is free, no funds move until the agent
		// executes on-chain under the cap, so honest spend is zero
		if (s.demo === false) return 0;
		const end = s.status === 'revoked' ? (s.revokedAt ?? Date.now()) : Date.now();
		const hours = Math.max(0, (Math.min(end, s.expiresAt) - s.createdAt) / 3_600_000);
		return Math.min(s.spendCapBnb * 0.92, s.burnPerHour * hours);
	}

	expired(s: Session): boolean {
		return s.status === 'active' && Date.now() > s.expiresAt;
	}

	activeFor(owner: string | null, agentId: string): Session | undefined {
		return this.forOwner(owner).find(
			(s) => s.agentId === agentId && s.status === 'active' && !this.expired(s)
		);
	}
}

export const sessionStore = new SessionStore();
