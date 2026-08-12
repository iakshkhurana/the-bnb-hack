/** Formatting helpers used across HIVE. */

export function usd(n: number, opts: { compact?: boolean; decimals?: number } = {}): string {
	const { compact = false, decimals } = opts;
	if (compact && Math.abs(n) >= 1000) {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: 'USD',
			notation: 'compact',
			maximumFractionDigits: 2
		}).format(n);
	}
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'USD',
		minimumFractionDigits: decimals ?? 2,
		maximumFractionDigits: decimals ?? 2
	}).format(n);
}

export function num(n: number, decimals = 2): string {
	return new Intl.NumberFormat('en-US', {
		minimumFractionDigits: 0,
		maximumFractionDigits: decimals
	}).format(n);
}

export function pct(n: number, decimals = 1): string {
	return `${n >= 0 ? '+' : ''}${n.toFixed(decimals)}%`;
}

export function shortAddr(addr: string): string {
	return addr.length > 12 ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : addr;
}

export function timeAgo(ts: number): string {
	const s = Math.max(1, Math.floor((Date.now() - ts) / 1000));
	if (s < 60) return `${s}s ago`;
	const m = Math.floor(s / 60);
	if (m < 60) return `${m}m ago`;
	const h = Math.floor(m / 60);
	if (h < 24) return `${h}h ago`;
	const d = Math.floor(h / 24);
	return `${d}d ago`;
}

export function countdown(ts: number): string {
	const s = Math.floor((ts - Date.now()) / 1000);
	if (s <= 0) return 'expired';
	const d = Math.floor(s / 86400);
	const h = Math.floor((s % 86400) / 3600);
	const m = Math.floor((s % 3600) / 60);
	if (d > 0) return `${d}d ${h}h`;
	if (h > 0) return `${h}h ${m}m`;
	return `${m}m`;
}

export function bscScanTx(hash: string, testnet = false): string {
	return `https://${testnet ? 'testnet.' : ''}bscscan.com/tx/${hash}`;
}

export function bscScanAddr(addr: string, testnet = false): string {
	return `https://${testnet ? 'testnet.' : ''}bscscan.com/address/${addr}`;
}
