/**
 * Wallet store: real injected wallets via EIP-6963 multi-provider discovery
 * (MetaMask, Trust, Binance Wallet, Phantom EVM, OKX, Rabby...) with a
 * clearly-labelled demo mode so the journey never dead-ends. Network is
 * BNB Smart Chain; we offer to switch/add it after connect.
 */
import { browser } from '$app/environment';
import type { Address } from 'viem';
import { bsc } from 'viem/chains';

const DEMO_ADDRESS = '0xd3b0c0ffee0000000000000000000000000000d1' as Address;

export type EthProvider = {
	request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
	on?: (event: string, cb: (...args: unknown[]) => void) => void;
};

export interface WalletOption {
	info: { uuid: string; name: string; icon: string; rdns: string };
	provider: EthProvider;
}

class Wallet {
	address = $state<Address | null>(null);
	connecting = $state(false);
	demo = $state(false);
	chainId = $state<number | null>(null);
	walletName = $state<string | null>(null);
	walletIcon = $state<string | null>(null);
	/** wallets announced via EIP-6963 */
	options = $state<WalletOption[]>([]);
	modalOpen = $state(false);

	#active: EthProvider | null = null;

	constructor() {
		if (browser) this.#discover();
	}

	#discover(): void {
		window.addEventListener('eip6963:announceProvider', (e) => {
			const detail = (e as CustomEvent<WalletOption>).detail;
			if (detail?.info?.uuid && !this.options.some((o) => o.info.uuid === detail.info.uuid)) {
				this.options = [...this.options, detail];
			}
		});
		window.dispatchEvent(new Event('eip6963:requestProvider'));
	}

	get injected(): EthProvider | null {
		if (!browser) return null;
		return (window as unknown as { ethereum?: EthProvider }).ethereum ?? null;
	}

	/** the provider backing the current session (for signing) */
	get provider(): EthProvider | null {
		return this.#active ?? this.injected;
	}

	get connected(): boolean {
		return this.address !== null;
	}

	get onBsc(): boolean {
		return this.chainId === bsc.id || this.demo;
	}

	/** entry point for connect buttons: opens the chooser */
	requestConnect(): void {
		this.modalOpen = true;
	}

	async connectWith(option: WalletOption): Promise<boolean> {
		return this.#connect(option.provider, option.info.name, option.info.icon);
	}

	/** legacy single-injected fallback (no EIP-6963 wallets announced) */
	async connectInjected(): Promise<boolean> {
		const eth = this.injected;
		if (!eth) return false;
		return this.#connect(eth, 'Injected wallet', null);
	}

	connectDemo(): void {
		this.demo = true;
		this.address = DEMO_ADDRESS;
		this.chainId = bsc.id;
		this.walletName = 'Demo account';
		this.walletIcon = null;
		this.#active = null;
		this.modalOpen = false;
	}

	async #connect(eth: EthProvider, name: string, icon: string | null): Promise<boolean> {
		if (this.connecting) return false;
		this.connecting = true;
		try {
			const accounts = (await eth.request({ method: 'eth_requestAccounts' })) as Address[];
			if (!accounts.length) return false;
			this.#active = eth;
			this.address = accounts[0];
			this.demo = false;
			this.walletName = name;
			this.walletIcon = icon;
			const hex = (await eth.request({ method: 'eth_chainId' })) as string;
			this.chainId = Number(hex);
			eth.on?.('accountsChanged', (accs) => {
				const a = accs as Address[];
				this.address = a.length ? a[0] : null;
			});
			eth.on?.('chainChanged', (id) => {
				this.chainId = Number(id as string);
			});
			if (this.chainId !== bsc.id) await this.switchToBsc();
			this.modalOpen = false;
			return true;
		} catch {
			return false; // user rejected
		} finally {
			this.connecting = false;
		}
	}

	async switchToBsc(): Promise<void> {
		const eth = this.provider;
		if (!eth || this.demo) return;
		try {
			await eth.request({
				method: 'wallet_switchEthereumChain',
				params: [{ chainId: '0x38' }]
			});
		} catch {
			try {
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
			} catch {
				/* user declined, banner in the wallet menu offers retry */
			}
		}
	}

	disconnect(): void {
		this.address = null;
		this.demo = false;
		this.chainId = null;
		this.walletName = null;
		this.walletIcon = null;
		this.#active = null;
	}
}

export const wallet = new Wallet();
