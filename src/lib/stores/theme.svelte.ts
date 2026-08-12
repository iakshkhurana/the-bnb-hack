/** Theme store, light (default) / dark (Binance black & yellow). */
import { browser } from '$app/environment';

class Theme {
	mode = $state<'light' | 'dark'>('dark');

	constructor() {
		if (browser) {
			// dark is the default; light only when explicitly chosen
			this.mode = localStorage.getItem('hive.theme') === 'light' ? 'light' : 'dark';
			this.#apply();
		}
	}

	toggle(): void {
		const apply = () => {
			this.mode = this.mode === 'light' ? 'dark' : 'light';
			if (browser) {
				localStorage.setItem('hive.theme', this.mode);
				this.#apply();
			}
		};
		// PowerPoint-style top-to-bottom wipe between themes (View Transitions API)
		const doc = browser ? (document as Document & { startViewTransition?: (cb: () => void) => void }) : null;
		const reduced = browser && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (doc?.startViewTransition && !reduced) {
			doc.startViewTransition(apply);
		} else {
			apply();
		}
	}

	#apply(): void {
		document.documentElement.dataset.theme = this.mode;
	}
}

export const theme = new Theme();
