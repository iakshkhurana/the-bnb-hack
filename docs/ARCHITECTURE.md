# Architecture

```
Browser (Svelte 5 runes)
│
├─ market store ── polls /api/market every 15s ──┐
├─ wallet store ── injected provider (viem)      │
├─ session store ─ leash grants (localStorage,   │        SvelteKit server
│                  Keystore-shaped)              ├──►  /api/market ── viem multicall ──► BSC mainnet
│                                                │        15s cache        │  Chainlink feeds
└─ pages: / /marketplace /agents/[id]            │        stale-fallback   │  PancakeSwap V3 slot0
          /dashboard /proof                      │                         │  Venus vToken rates
                                                 └──►  /api/klines ──► keyless spot candles
                                                          60s cache, whitelisted symbols
```

## Module map

| Path | Responsibility |
|---|---|
| `src/lib/chain/` | viem clients (multi-RPC fallback), contract addresses + ABIs |
| `src/lib/server/market.ts` | one multicall snapshot: prices, pool state, Venus rates; 15s in-memory cache, serves stale over failing |
| `src/lib/agents/` | domain types, the 12-agent registry, deterministic performance engine |
| `src/lib/sessions/` | the leash: grant / revoke / spend tracking, Altana Keystore session shape |
| `src/lib/wallet/` | injected connector with demo-mode fallback (no dead ends) |
| `src/lib/proof/` | Agent Advantage Report dataset |
| `src/lib/components/` | UI kit, charts (lightweight-charts + SVG), hire wizard, agent cards |
| `src/routes/` | landing, marketplace, agent resume, Mission Control, proof, API |

## Design decisions

**One multicall, one cache.** Every LIVE number flows through a single batched `eth_call` per 15s window regardless of concurrent viewers — judging traffic can't rate-limit the public RPCs. If a refresh fails, the last snapshot serves rather than erroring.

**Provenance as a first-class type.** `'live' | 'onchain' | 'backtest' | 'claimed'` is part of the agent domain model, rendered as a badge beside every number it qualifies. Honest data beats impressive data.

**Deterministic simulation, indexer-shaped.** Backtest curves and work logs derive from each agent's seed (mulberry32) — stable across reloads, shaped by the agent's real risk/return profile, and typed identically to what a Ponder indexer will emit from mainnet events. Swapping the generator for the indexer touches zero components.

**Sessions mirror Altana Keystore.** A grant stores `sessionKey`, spend cap, allowlist, expiry, owner — the exact fields the on-chain registry holds. The localStorage transport is the MVP stand-in; the wizard's `personal_sign` step becomes the Keystore registration transaction.

**Zero-key deployment.** Public BSC RPCs + keyless market data = nothing to expire or leak. Deploys on any Node host or Vercel with `npm run build`.

## Verification status

- `svelte-check`: 0 errors, 0 warnings
- Vitest: 23/23 (registry integrity, leash invariants, deterministic engine, formatters)
- Live reads verified against BSC: Chainlink BNB/USD and PancakeSwap WBNB/USDT pool price agree to ~0.1%
- All routes return 200; unknown agents 404 to a branded error page
