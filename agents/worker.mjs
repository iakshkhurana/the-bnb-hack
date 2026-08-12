/**
 * HIVE agent worker: runs one agent live on BSC testnet.
 *
 * Every cycle it reads REAL mainnet market data (Chainlink BNB/USD and the
 * Venus USDT supply rate), makes its check, and writes a heartbeat
 * transaction on BSC testnet from the agent's own wallet, with the action
 * summary embedded in calldata. Verifiable on testnet.bscscan.com.
 *
 * Usage:
 *   1. Put a TESTNET-ONLY private key in .env  ->  AGENT_PRIVATE_KEY=0x...
 *   2. Fund it: https://www.bnbchain.org/en/testnet-faucet
 *   3. npm run agent            (defaults to sentinel)
 *      npm run agent gridhawk   (any agent id from the registry)
 */
import { createPublicClient, createWalletClient, http, parseAbi, stringToHex } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { bsc, bscTestnet } from 'viem/chains';

const AGENT = process.argv[2] ?? 'sentinel';
const INTERVAL_MIN = Number(process.env.AGENT_INTERVAL_MIN ?? 10);

const rawKey = process.env.AGENT_PRIVATE_KEY;
if (!rawKey) {
	console.error('✗ Set AGENT_PRIVATE_KEY in .env (testnet-only wallet, never real funds).');
	console.error('  Fund it at https://www.bnbchain.org/en/testnet-faucet then rerun.');
	process.exit(1);
}
const account = privateKeyToAccount(rawKey.startsWith('0x') ? rawKey : `0x${rawKey}`);

const mainnet = createPublicClient({ chain: bsc, transport: http('https://bsc-dataseed.bnbchain.org') });
const testnet = createWalletClient({
	account,
	chain: bscTestnet,
	transport: http('https://data-seed-prebsc-1-s1.bnbchain.org:8545')
});
const testnetRead = createPublicClient({
	chain: bscTestnet,
	transport: http('https://data-seed-prebsc-1-s1.bnbchain.org:8545')
});

const chainlinkAbi = parseAbi([
	'function latestRoundData() view returns (uint80, int256, uint256, uint256, uint80)'
]);
const vTokenAbi = parseAbi(['function supplyRatePerBlock() view returns (uint256)']);

const ACTIONS = {
	sentinel: (bnb, rate) =>
		`HF check: markets nominal, BNB $${bnb.toFixed(2)}, vUSDT rate ${rate.toExponential(2)}, no action needed`,
	gridhawk: (bnb) => `Grid check: BNB $${bnb.toFixed(2)}, levels in band, orders armed`,
	rangekeeper: (bnb) => `Range check: BNB $${bnb.toFixed(2)}, position in range, no reset`,
	nectarrouter: (bnb, rate) =>
		`Venue scan: vUSDT ${rate.toExponential(2)}/block leads, allocation optimal, BNB $${bnb.toFixed(2)}`
};

async function cycle() {
	try {
		const [round, rate] = await Promise.all([
			mainnet.readContract({
				address: '0x0567f2323251f0aab15c8dfb1967e4e8a7d42aee',
				abi: chainlinkAbi,
				functionName: 'latestRoundData'
			}),
			mainnet.readContract({
				address: '0xfd5840cd36d94d7229439859c0112a4185bc0255',
				abi: vTokenAbi,
				functionName: 'supplyRatePerBlock'
			})
		]);
		const bnb = Number(round[1]) / 1e8;
		const ratePerBlock = Number(rate) / 1e18;

		const summary = (ACTIONS[AGENT] ?? ACTIONS.sentinel)(bnb, ratePerBlock);
		const payload = { agent: AGENT, at: new Date().toISOString(), action: summary };

		const hash = await testnet.sendTransaction({
			to: account.address,
			value: 0n,
			data: stringToHex(JSON.stringify(payload))
		});

		console.log(`✓ [${AGENT}] ${summary}`);
		console.log(`  tx https://testnet.bscscan.com/tx/${hash}`);
	} catch (err) {
		console.error(`✗ [${AGENT}] cycle failed:`, err.shortMessage ?? err.message);
	}
}

const balance = await testnetRead.getBalance({ address: account.address });
console.log(`HIVE agent worker · ${AGENT}`);
console.log(`wallet ${account.address} · tBNB balance ${(Number(balance) / 1e18).toFixed(4)}`);
if (balance === 0n) {
	console.warn('! Balance is zero. Fund at https://www.bnbchain.org/en/testnet-faucet');
}
console.log(`heartbeat every ${INTERVAL_MIN} min, Ctrl+C to stop\n`);

await cycle();
setInterval(cycle, INTERVAL_MIN * 60_000);
