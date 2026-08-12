/**
 * Client-side live market store, polls /api/market every 15s while any
 * component subscribes. Numbers on screen tick without a refresh.
 */
import { browser } from '$app/environment';
import type { MarketSnapshot } from '$lib/types/market';

const EMPTY: MarketSnapshot = { ok: false, at: 0, block: 0, feeds: [], pools: [], venus: [] };

class MarketStore {
	snapshot = $state<MarketSnapshot>(EMPTY);
	loading = $state(true);

	#timer: ReturnType<typeof setInterval> | null = null;
	#subscribers = 0;

	async refresh(): Promise<void> {
		try {
			const res = await fetch('/api/market');
			if (res.ok) {
				const data = (await res.json()) as MarketSnapshot;
				if (data.ok) this.snapshot = data;
			}
		} catch {
			// keep last snapshot
		} finally {
			this.loading = false;
		}
	}

	/** Call from $effect, returns a cleanup fn. */
	subscribe(): () => void {
		this.#subscribers++;
		if (this.#subscribers === 1 && browser) {
			this.refresh();
			this.#timer = setInterval(() => this.refresh(), 15_000);
		}
		return () => {
			this.#subscribers--;
			if (this.#subscribers === 0 && this.#timer) {
				clearInterval(this.#timer);
				this.#timer = null;
			}
		};
	}

	price(symbol: string): number {
		return this.snapshot.feeds.find((f) => f.symbol === symbol)?.price ?? 0;
	}

	venusApy(symbol: string): number {
		return this.snapshot.venus.find((v) => v.symbol === symbol)?.supplyApy ?? 0;
	}
}

export const market = new MarketStore();
