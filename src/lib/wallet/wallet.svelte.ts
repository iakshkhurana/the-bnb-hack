/**
 * Wallet store, injected connector (MetaMask, Rabby, Trust) via viem.
 * Falls back to a deterministic demo account when no provider is installed,
 * so the full hire → monitor → revoke journey works for every judge.
 */
import { browser } from '$app/environment';
import { createWalletClient, custom, type Address, type WalletClient } from 'viem';
import { bsc } from 'viem/chains';

const DEMO_ADDRESS = '0xd3b0c0ffee0000000000000000000000000000d1' as Address;

type EthProvider = {
	request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
	on?: (event: string, cb: (...args: unknown[]) => void) => void;
};

class Wallet {
	address = $state<Address | null>(null);
	connecting = $state(false);
	demo = $state(false);
	chainId = $state<number | null>(null);

	#client: WalletClient | null = null;

	get provider(): EthProvider | null {
		if (!browser) return null;
		return (window as unknown as { ethereum?: EthProvider }).ethereum ?? null;
	}

	get connected(): boolean {
		return this.address !== null;
	}

	async connect(): Promise<void> {
		if (this.connecting) return;
		this.connecting = true;
		try {
			const eth = this.provider;
			if (!eth) {
				// No injected wallet, demo mode keeps the journey dead-end free.
				this.demo = true;
				this.address = DEMO_ADDRESS;
				this.chainId = bsc.id;
				return;
			}
			const accounts = (await eth.request({ method: 'eth_requestAccounts' })) as Address[];
			if (accounts.length === 0) return;
			this.address = accounts[0];
			this.demo = false;
			const hex = (await eth.request({ method: 'eth_chainId' })) as string;
			this.chainId = Number(hex);
			this.#client = createWalletClient({ chain: bsc, transport: custom(eth) });
			eth.on?.('accountsChanged', (accs) => {
				const a = accs as Address[];
				this.address = a.length ? a[0] : null;
			});
			eth.on?.('chainChanged', (id) => {
				this.chainId = Number(id as string);
			});
		} finally {
			this.connecting = false;
		}
	}

	async switchToBsc(): Promise<void> {
		const eth = this.provider;
		if (!eth) return;
		try {
			await eth.request({
				method: 'wallet_switchEthereumChain',
				params: [{ chainId: '0x38' }]
			});
		} catch {
			await eth.request({
				method: 'wallet_addEthereumChain',
				params: [
					{
						chainId: '0x38',
						chainName: 'BNB Smart Chain',
						nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
						rpcUrls: ['https://bsc-dataseed.bnbchain.org'],
						blockExplorerUrls: ['https://bscscan.com']
					}
				]
			});
		}
	}

	disconnect(): void {
		this.address = null;
		this.demo = false;
		this.chainId = null;
		this.#client = null;
	}

	get onBsc(): boolean {
		return this.chainId === bsc.id || this.demo;
	}
}

export const wallet = new Wallet();
