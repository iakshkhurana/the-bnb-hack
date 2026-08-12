<div align="center">

# 🐝 HIVE

### Hire agents. Keep the keys.

**The agent labor market for BNB Chain.** Every agent carries a verifiable resume, works inside a leash you set, and proves it beats doing the job yourself.

[![CI](https://github.com/iakshkhurana/the-bnb-hack/actions/workflows/ci.yml/badge.svg)](https://github.com/iakshkhurana/the-bnb-hack/actions)
[![Svelte 5](https://img.shields.io/badge/Svelte-5-ff3e00?logo=svelte&logoColor=white)](https://svelte.dev)
[![BNB Chain](https://img.shields.io/badge/BNB%20Chain-mainnet%20data-f0b90b?logo=binance&logoColor=black)](https://www.bnbchain.org)
[![Tests](https://img.shields.io/badge/tests-29%20passing-2ea44f)](src/lib)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

**[Live demo](https://the-bnb-hack.vercel.app)** · [Architecture](docs/ARCHITECTURE.md) · [Agent Advantage Report](docs/AGENT_ADVANTAGE_REPORT.md)

</div>

---

## The idea

Most agent marketplaces are directories: a grid of cards, a star rating, a hire button. You are asked to trust a stranger with your money because its card says "+31% APR".

HIVE treats hiring an agent like hiring a professional, built on three trust primitives:

| Primitive | What it means | Where |
|---|---|---|
| 📄 **Resume** | Every metric declares its provenance. `LIVE` is read from BSC right now, `ON-CHAIN` is decoded history, `BACKTEST` is simulation against real market data, `CLAIMED` is unverified. No anonymous stars. | any agent page |
| 🔒 **Leash** | Hiring is a scoped session: a hard spend cap the agent cannot exceed, a contract allowlist outside which every call reverts, and an expiry. Revoke in one click, effective immediately. | hire wizard, `/dashboard` |
| 📊 **Proof** | The same job measured twice, with an agent and by hand, over identical windows: time, cost, quality, outputs attached. Honest about the lines the human wins. | `/proof` |

## Four categories, equal depth

Twelve agents, three per category, one identical page layout, so equal depth is architectural rather than aspirational:

- 🎯 **Rebalancing** · PancakeSwap V3 concentrated liquidity ranges, recentred automatically
- 📐 **Grid trading** · buy/sell ladders on BNB, CAKE and BTC pairs, rebuilt around live price
- 🌱 **Yield optimisation** · stables and BNB routed to the best APR across Venus, Lista and PancakeSwap
- ❤️ **Health factor** · Venus lending positions defended from liquidation, staged and automatic

## Live data, zero API keys

Everything badged `LIVE` is read on-chain from BSC mainnet in a single multicall, cached 15 seconds, and ticks on screen without a refresh:

| Source | Data |
|---|---|
| Chainlink feeds | BNB, CAKE, BTC, ETH / USD |
| PancakeSwap V3 pools | `slot0` price, tick, liquidity |
| Venus core pool | supply and borrow APY for vBNB, vUSDT, vUSDC |
| Public spot mirror | real candles for the trading charts |

Cross-verification is a feature: the Chainlink price and the live pool price render side by side and agree to about 0.1%, and every contract address links to BscScan.

## The judge's two-minute journey

1. **Land**: live BNB chart, category doors, count-up stats
2. **Marketplace**: filter by category, sort, compare up to three agents side by side
3. **Agent resume**: plain-English strategy, provenance-labelled performance, live venue data at the current block, work log
4. **Hire**: connect a real wallet (MetaMask, Trust, Binance Wallet, OKX, Phantom via EIP-6963) or the demo account, set the leash, sign once
5. **Mission Control**: watch the budget bar burn in real time, then **revoke**, gone instantly

No documentation needed, no dead ends: unknown routes land on a branded page, missing wallets fall back to demo mode, failed data refreshes serve the last snapshot.

## Stack

| Layer | Choice |
|---|---|
| Framework | SvelteKit 2 + Svelte 5 runes (compiled reactivity, no virtual DOM) |
| Chain | viem 2: multicall reads, EIP-6963 wallet discovery, BSC mainnet + chapel |
| Charts | TradingView lightweight-charts + hand-rolled SVG sparklines and heatmaps |
| Styling | Tailwind CSS v4 design tokens: electric blue light theme, mint green dark theme, PowerPoint-style wipe on toggle |
| Icons | Lucide (vendored via the Iconify API) + official token brand marks |
| Quality | TypeScript strict, svelte-check clean, 29 Vitest unit tests, GitHub Actions CI |

## Quickstart

```sh
npm install
npm run dev        # http://localhost:5173
```

```sh
npm test           # 29 unit tests: registry integrity, leash invariants,
                   # deterministic engine, proof-report honesty guards
npm run check      # svelte-check, 0 errors
npm run build      # production build
```

Deploying: push to GitHub and import into Vercel. Works with zero environment variables; two optional keys unlock more (copy `.env.example` to `.env`):

| Variable | What it unlocks |
|---|---|
| `SCAN8004_API_KEY` | 8004scan Pro tier rate limits for the ERC-8004 stats feed (free for participants via the Developer Hub) |
| `AGENT_PRIVATE_KEY` | runs a HIVE agent live on BSC testnet: `npm run agent` reads real mainnet market data every cycle and writes verifiable heartbeat transactions from the agent's own wallet (`npm run agent gridhawk` for others) |

## Honesty model

Agent performance curves and work logs are generated by a deterministic seeded engine and labelled `BACKTEST` / `TESTNET`, never passed off as mainnet history. The interfaces match what a [Ponder](https://ponder.sh) indexer emits once the agent fleet (BNB Agent Studio CLI workers on Altana self-custodial wallets) runs on mainnet: swapping the generator for the indexer touches zero components. Session grants mirror the Altana Keystore shape (`sessionKey`, cap, allowlist, expiry), so on-chain registration and ERC-8183 hiring drop into the existing flow.

## Partner ecosystem

How HIVE maps to each hackathon partner, honestly labelled shipped vs planned:

| Partner | Status |
|---|---|
| **BNB Chain / Agent Studio** | Marketplace shipped for the main track. Agent fleet scaffolding via the BNB Agent Studio CLI is the build-period roadmap; the registry and work-log interfaces are already shaped for it. |
| **Altana** | Every agent declares which of Altana's ten production skills it is composed from (PancakeSwap Liquidity, PancakeSwap Trading, Venus Lending, Lista Liquid Staking, Token Radar, Wallet Tracker, x402 API Payments), shown on its resume. Sessions mirror the Keystore shape: cap, allowlist, expiry, instant revoke. ERC-8183 and x402 capability flags are first-class agent fields. SDK wiring lands with the mainnet fleet. |
| **8004scan (AltLayer)** | **Shipped**: live ERC-8004 economy stats on the landing page straight from the 8004scan public API (254k+ agents on BNB Chain, daily registrations, reputation averages). Add `SCAN8004_API_KEY` in `.env` for the hackathon Pro tier. Per-agent identity and feedback rendering lands with mainnet registration. |
| **TermiX** | The required Agent Advantage Report ships in-product at `/proof` and in [`docs/AGENT_ADVANTAGE_REPORT.md`](docs/AGENT_ADVANTAGE_REPORT.md), with the high-stakes trading task, honest deltas and attached outputs. |
| **PancakeSwap** | Six of twelve agents work PancakeSwap venues directly: V3 range management that triples fee capture in the measured task, and grid trading with live pool prices on every page. |

## Docs

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md): system design, data flow, module map, design decisions
- [`docs/AGENT_ADVANTAGE_REPORT.md`](docs/AGENT_ADVANTAGE_REPORT.md): the TermiX-required report, also live at `/proof`

## License

MIT © Aksh Khurana. Built for The Smart Money Era hackathon (BNB Chain, 2026).
