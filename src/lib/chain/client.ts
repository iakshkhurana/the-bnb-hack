/**
 * BSC public clients — keyless, multi-RPC with automatic fallback.
 * Every number HIVE shows as LIVE flows through these clients.
 */
import { createPublicClient, fallback, http } from 'viem';
import { bsc, bscTestnet } from 'viem/chains';

const MAINNET_RPCS = [
	'https://bsc-dataseed.bnbchain.org',
	'https://bsc-dataseed1.defibit.io',
	'https://bsc-dataseed1.ninicoin.io',
	'https://rpc.ankr.com/bsc'
];

export const bscClient = createPublicClient({
	chain: bsc,
	transport: fallback(
		MAINNET_RPCS.map((url) => http(url, { timeout: 8_000, retryCount: 1 })),
		{ rank: false }
	),
	batch: { multicall: { wait: 16 } }
});

export const bscTestnetClient = createPublicClient({
	chain: bscTestnet,
	transport: http('https://data-seed-prebsc-1-s1.bnbchain.org:8545', { timeout: 8_000 })
});
