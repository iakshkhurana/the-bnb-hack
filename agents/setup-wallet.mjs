/**
 * One-time setup: generates a fresh TESTNET-ONLY agent wallet and writes
 * AGENT_PRIVATE_KEY into .env (created if missing). Prints only the public
 * address, never the key. Safe to run repeatedly: an existing key is kept.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';

const ENV = new URL('../.env', import.meta.url);
let text = existsSync(ENV) ? readFileSync(ENV, 'utf8') : '';

const existing = text.match(/^AGENT_PRIVATE_KEY=(0x[0-9a-fA-F]{64})\s*$/m);

let key;
if (existing) {
	key = existing[1];
	console.log('✓ .env already has an agent key, keeping it.');
} else {
	key = generatePrivateKey();
	if (/^AGENT_PRIVATE_KEY=.*$/m.test(text)) {
		text = text.replace(/^AGENT_PRIVATE_KEY=.*$/m, `AGENT_PRIVATE_KEY=${key}`);
	} else {
		text += (text.endsWith('\n') || text === '' ? '' : '\n') + `AGENT_PRIVATE_KEY=${key}\n`;
	}
	writeFileSync(ENV, text);
	console.log('✓ New testnet agent wallet generated and saved to .env');
}

const account = privateKeyToAccount(key);
console.log('');
console.log('Agent wallet address (public, safe to share):');
console.log(`  ${account.address}`);
console.log('');
console.log('Next steps:');
console.log('  1. Paste this ADDRESS into https://www.bnbchain.org/en/testnet-faucet');
console.log('     (the faucet wants the address, never the private key)');
console.log('  2. Faucet rule: the address must hold 0.002 BNB on MAINNET first.');
console.log('     Send ~0.003 BNB from your main wallet to this address on BSC mainnet, then claim.');
console.log('  3. npm run agent');
