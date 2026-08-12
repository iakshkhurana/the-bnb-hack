/**
 * On-chain sources of truth on BNB Smart Chain (mainnet).
 * Chainlink price feeds, PancakeSwap V3 pools, Venus core-pool vTokens.
 */
import { parseAbi, type Address } from 'viem';

export const chainlinkAbi = parseAbi([
	'function latestRoundData() view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)',
	'function decimals() view returns (uint8)'
]);

export const pancakeV3PoolAbi = parseAbi([
	'function slot0() view returns (uint160 sqrtPriceX96, int24 tick, uint16 observationIndex, uint16 observationCardinality, uint16 observationCardinalityNext, uint32 feeProtocol, bool unlocked)',
	'function liquidity() view returns (uint128)',
	'function fee() view returns (uint24)'
]);

export const vTokenAbi = parseAbi([
	'function supplyRatePerBlock() view returns (uint256)',
	'function borrowRatePerBlock() view returns (uint256)',
	'function totalSupply() view returns (uint256)',
	'function exchangeRateStored() view returns (uint256)',
	'function getCash() view returns (uint256)'
]);

/** Chainlink feeds (8 decimals) */
export const FEEDS: Record<string, { address: Address; label: string }> = {
	BNB: { address: '0x0567F2323251f0Aab15c8dFb1967E4e8A7D42aee', label: 'BNB / USD' },
	CAKE: { address: '0xB6064eD41d4f67e353768aA239cA86f4F73665a1', label: 'CAKE / USD' },
	BTC: { address: '0x264990fbd0A4796A3E3d8E37C4d5F87a3aCa5Ebf', label: 'BTC / USD' },
	ETH: { address: '0x9ef1B8c0E4F7dc8bF5719Ea496883DC6401d5b2e', label: 'ETH / USD' }
];

/** PancakeSwap V3 pools the rebalancing / grid agents operate on */
export const POOLS: Record<
	string,
	{ address: Address; label: string; token0: string; token1: string; feeTier: string }
> = {
	'wbnb-usdt': {
		address: '0x36696169C63e42cd08ce11f5deeBbCeBae652050',
		label: 'WBNB / USDT',
		token0: 'WBNB',
		token1: 'USDT',
		feeTier: '0.05%'
	},
	'cake-wbnb': {
		address: '0x133B3D95bAD5405d14d53473671200e9342896BF',
		label: 'CAKE / WBNB',
		token0: 'CAKE',
		token1: 'WBNB',
		feeTier: '0.25%'
	}
};

/** Venus core-pool vTokens the yield / health agents read */
export const VTOKENS: Record<string, { address: Address; label: string; underlying: string }> = {
	vBNB: {
		address: '0xA07c5b74C9B40447a954e1466938b865b6BBea36',
		label: 'Venus BNB',
		underlying: 'BNB'
	},
	vUSDT: {
		address: '0xfD5840Cd36d94D7229439859C0112a4185BC0255',
		label: 'Venus USDT',
		underlying: 'USDT'
	},
	vUSDC: {
		address: '0xecA88125a5ADbe82614ffC12D0DB554E2e2867C8',
		label: 'Venus USDC',
		underlying: 'USDC'
	}
};

/**
 * BSC produces a block every ~0.75s since the Maxwell hardfork (June 2025).
 * Venus per-block rates are annualised against this cadence, then
 * sanity-clamped — see market service.
 */
export const BSC_BLOCKS_PER_YEAR = 42_048_000;
