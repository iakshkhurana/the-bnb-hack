import { describe, expect, it } from 'vitest';
import { usd, pct, num, shortAddr, countdown, bscScanTx, bscScanAddr } from './format';

describe('usd', () => {
	it('formats plain currency', () => {
		expect(usd(1234.5)).toBe('$1,234.50');
	});
	it('compacts large values when asked', () => {
		expect(usd(2_140_000, { compact: true })).toBe('$2.14M');
	});
	it('respects decimals', () => {
		expect(usd(0.14, { decimals: 2 })).toBe('$0.14');
	});
});

describe('pct', () => {
	it('signs positives explicitly', () => {
		expect(pct(31.4)).toBe('+31.4%');
	});
	it('keeps negative sign', () => {
		expect(pct(-8.25)).toBe('-8.3%');
	});
});

describe('num', () => {
	it('groups thousands', () => {
		expect(num(42048000, 0)).toBe('42,048,000');
	});
});

describe('shortAddr', () => {
	it('truncates long addresses', () => {
		expect(shortAddr('0xa07c5b74c9b40447a954e1466938b865b6bbea36')).toBe('0xa07c…ea36');
	});
	it('leaves short strings alone', () => {
		expect(shortAddr('0xabc')).toBe('0xabc');
	});
});

describe('countdown', () => {
	it('reports expired for past timestamps', () => {
		expect(countdown(Date.now() - 1000)).toBe('expired');
	});
	it('reports days and hours for long spans', () => {
		expect(countdown(Date.now() + 3 * 86_400_000 + 5 * 3_600_000)).toBe('3d 5h');
	});
});

describe('bscscan links', () => {
	it('builds mainnet tx links', () => {
		expect(bscScanTx('0xdead')).toBe('https://bscscan.com/tx/0xdead');
	});
	it('builds testnet address links', () => {
		expect(bscScanAddr('0xbeef', true)).toBe('https://testnet.bscscan.com/address/0xbeef');
	});
});
