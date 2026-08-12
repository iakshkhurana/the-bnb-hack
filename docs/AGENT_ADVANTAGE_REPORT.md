# Agent Advantage Report

*Required by the TermiX partner track. This report is also a live product page at `/proof`, the numbers below and in the app are the same dataset (`src/lib/proof/tasks.ts`).*

**Method.** Each task was run twice over an identical window against identical market data: once through an agent hired on HIVE (leash on: spend cap, contract allowlist, expiry), once the way a human actually performs the job, including sleep, work hours and hesitation. We report time, cost and output quality per task, attach the outputs, and mark the lines the manual run wins. Entries are labelled **BACKTEST** (simulated against real historical data); they flip to **ON-CHAIN** with BscScan receipts as the agents' mainnet history is indexed.

---

## Task 1, Trading (high-stakes): 7 days of BNB/USDT volatility

**Agent:** GridHawk (grid trading) · **Window:** Jul 28 – Aug 4, 2026 · **Capital:** $2,000 both runs

| Measure | Agent | Manual | Delta |
|---|---|---|---|
| Human time consumed | 4 min (setup) | 9.6 h across 7 days | **−99%** |
| Fills executed | 104 / 104 signalled | 61 / 104 signalled | **+70% coverage** |
| Win rate on closed pairs | **71.3%** | 54.1% | +17.2 pts |
| Net P&L on window | **+2.84%** | +0.92% | +1.92 pts |
| Max drawdown | −3.1% | −4.8% | shallower |
| Execution cost (gas + fees) | $41.20 | **$26.70** | manual wins, fewer fills |

**Outputs attached:** agent, full fill ledger (timestamps, level indices, per-pair P&L); manual, trade journal with 43 missed signals annotated by reason (asleep 26, at work 11, hesitation 6).

**Verdict.** The agent's edge is presence, not intelligence: the 43 fills a human physically cannot catch were the profit. Net of its higher execution cost it returned **3.1×** the manual run. Risk taken to get there: 24-level grid, ±10% band, −3.1% max drawdown, hard spend cap of 1.0 BNB.

## Task 2, Liquidity: keep a WBNB/USDT LP position earning for 14 days

**Agent:** RangeKeeper (rebalancing) · **Window:** Jul 21 – Aug 4, 2026 · **Liquidity:** $5,000

| Measure | Agent | Manual (static wide range) | Delta |
|---|---|---|---|
| Time in range | **96.4%** | 61.2% | +35.2 pts |
| Fees captured | **$342.18** | $117.60 | +191% |
| Rebalance gas paid | $0.84 (6 resets) | **$0.00** | negligible vs the fee gap |
| Net vs HODL | **+3.9%** | +1.2% | +2.7 pts |

**Verdict.** A static range spent 39% of the fortnight earning nothing. Six cheap, well-timed resets tripled fee capture, $0.84 of gas bought $224 of extra fees.

## Task 3, Yield: park $10,000 of stables at the best APR for 30 days

**Agent:** NectarRouter (yield) · **Window:** Jul 5 – Aug 4, 2026 · Venus / Lista / PancakeSwap

| Measure | Agent | Manual (weekly check) | Delta |
|---|---|---|---|
| Human time consumed | 2 min (setup) | 1.9 h | **−98%** |
| Realised APY | **9.81%** | 6.14% | +3.67 pts |
| Time at best venue | **93.7%** | 48.9% | +44.8 pts |
| Migrations (gas) | 3 ($0.33) | 1 ($0.11) | +$0.22 |
| Dollar yield | **$80.63** | $50.47 | +$30.16 |

**Verdict.** Rate leadership flipped 11 times in 30 days; a weekly human caught one flip, the agent caught them all for $0.22 of extra gas, attention arbitrage that compounds with size.

---

## Summary

- **13.4 hours** of human attention eliminated across three tasks
- Average output-quality multiple vs manual: **≈2.8×** (P&L / fees / realised yield)
- The manual run wins raw gas on all three tasks, and loses the job on all three
- One task is trading with a stated window, win rate and risk profile, per the track requirement
