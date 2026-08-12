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
	BNB: { address: '0x0567f2323251f0aab15c8dfb1967e4e8a7d42aee', label: 'BNB / USD' },
	CAKE: { address: '0xb6064ed41d4f67e353768aa239ca86f4f73665a1', label: 'CAKE / USD' },
	BTC: { address: '0x264990fbd0a4796a3e3d8e37c4d5f87a3aca5ebf', label: 'BTC / USD' },
	ETH: { address: '0x9ef1b8c0e4f7dc8bf5719ea496883dc6401d5b2e', label: 'ETH / USD' }
};

/**
 * PancakeSwap V3 pools the rebalancing / grid agents operate on.
 * token0/token1 follow on-chain address sort order; `usd` says how to turn
 * the raw token1-per-token0 price into a USD quote for the pool's headline
 * asset ('invert' → 1/price is already USD; 'in-bnb' → price × BNB/USD).
 */
export const POOLS: Record<
	string,
	{
		address: Address;
		label: string;
		token0: string;
		token1: string;
		feeTier: string;
		usd: 'invert' | 'in-bnb';
	}
> = {
	'wbnb-usdt': {
		address: '0x36696169c63e42cd08ce11f5deebbcebae652050',
		label: 'WBNB / USDT',
		token0: 'USDT',
		token1: 'WBNB',
		feeTier: '0.05%',
		usd: 'invert'
	},
	'cake-wbnb': {
		address: '0x133b3d95bad5405d14d53473671200e9342896bf',
		label: 'CAKE / WBNB',
		token0: 'CAKE',
		token1: 'WBNB',
		feeTier: '0.25%',
		usd: 'in-bnb'
	}
};

/** Venus core-pool vTokens the yield / health agents read */
export const VTOKENS: Record<string, { address: Address; label: string; underlying: string }> = {
	vBNB: {
		address: '0xa07c5b74c9b40447a954e1466938b865b6bbea36',
		label: 'Venus BNB',
		underlying: 'BNB'
	},
	vUSDT: {
		address: '0xfd5840cd36d94d7229439859c0112a4185bc0255',
		label: 'Venus USDT',
		underlying: 'USDT'
	},
	vUSDC: {
		address: '0xeca88125a5adbe82614ffc12d0db554e2e2867c8',
		label: 'Venus USDC',
		underlying: 'USDC'
	}
};

/**
 * BSC produces a block every ~0.75s since the Maxwell hardfork (June 2025).
 * Venus per-block rates are annualised against this cadence, then
 * sanity-clamped, see market service.
 */
export const BSC_BLOCKS_PER_YEAR = 42_048_000;
