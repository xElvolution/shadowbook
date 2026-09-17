# SHADOWBOOK — Bitget AI Hackathon S2

**Author:** XElvolution (team build)  
**Track:** Bitget AI Hackathon S2 — Agent Trading (tokenized US stocks / Bitget rTokens only)  
**Not:** Solana · Stocklana · any non-Bitget venue  
**Status:** Production build — promote shadow fills to live  
**Bar:** Uniswap-simple. Real org pain. No blotter cosplay. Bitget-only branding.

---

## 1. One sentence

Overnight, agents never touch your live Bitget book. They trade a **live-priced shadow twin**. At cash open you **promote** (or discard) each sized rToken move into the real book, with sealed receipts. No promote = the night never happened to your holdings.

**Unique verb:** *promote shadow fills to live.*

---

## 2. Why this is not CURFEW or WAKE

| | **CURFEW (Bender)** | **WAKE (Rika)** | **SHADOWBOOK (Rick)** |
|---|---|---|---|
| Trust model | Agents trade **live** under a signed mandate | Agents fill one **sealed package in escrow**; morning accept/reject **all** | Agents trade a **shadow twin** all night; morning **line-item promote** |
| Live book overnight | Moves (bounded) | Untouched | Untouched |
| Morning action | Review what already hit the book | Open one package | Diff board: promote / discard each leg |
| Failure mode if wrong | Real P&L damage overnight | Package rejected; book clean | Same: live book clean until you promote |
| Unique verb | Lock night under mandate | Morning open of sealed package | Promote shadow → live |

Same pain space (Lagos / remote desks, rAAPL–rAMZN overnight, naked agents). Different product heart.

---

## 3. Real problem (org / humanity scale)

- US cash closes ~21:00 Lagos. Bitget rTokens keep trading.
- Small desks and remote operators cannot babysit all night.
- They do **not** trust agents with live authority (CURFEW’s hard sell).
- They also do **not** want a single all-or-nothing morning blob if half the night was good (WAKE’s weakness).
- What they want: agents that **work the night against real prices**, zero live risk, then a **simple morning desk** to take the good legs and burn the bad ones.

That is a sustainable AI + venue product: autonomy without custody of the live book until a human (or dual-ack) promotes.

---

## 4. Product surface (Uniswap-simple)

No analytics wall. No Bloomberg cosplay. Core builds only:

1. **Landing** — one breath: “Agents rehearse overnight. You promote at open.”
2. **Onboarding** — connect / import Bitget book → spawn shadow twin (same lots, live quotes).
3. **Home** — live book (read-only overnight) + shadow P&L + “N legs waiting to promote.”
4. **Shadow** — tonight’s sized moves (rAAPL / rNVDA / rTSLA / rMSFT / rAMZN), plain English why, confidence, risk flags.
5. **Promote** — morning board: each leg Accept / Reject; batch “Accept all green”; dual-ack before live submit.
6. **Markets** — session-aware rToken quotes (hours, staleness). Autonom steal: respect market hours.
7. **History** — sealed receipts for shadow fills + promotions (hash chain). No receipt = never happened.
8. **Settings** — operators, promote policy (auto-promote only if confidence ≥ τ and risk pass), alerts, session keys for the *shadow* agent only.

Navigation a stranger gets in 10 seconds. No guided tour required if the Home verb is obvious.

---

## 5. Architecture

### 5.1 Domains

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────────┐
│ Bitget Live │────▶│ Mirror Sync      │────▶│ Shadow Ledger   │
│ Book + API  │     │ (positions only) │     │ (agent fills)   │
└─────────────┘     └──────────────────┘     └────────┬────────┘
       ▲                                              │
       │              ┌──────────────────┐            │
       └──────────────│ Promote Engine   │◀───────────┘
                      │ dual-ack + rails │
                      └────────┬─────────┘
                               ▼
                      ┌──────────────────┐
                      │ Receipt Store    │
                      │ seal + bundle    │
                      └──────────────────┘
```

### 5.2 Services (production shape)

| Service | Job |
|---|---|
| **Auth / Operators** | Enter, roles, settings, audit who promoted |
| **Book Sync** | Pull Bitget positions → shadow starting state at cash close |
| **Quote / Session** | Live rToken quotes + session flags (open/closed/stale) |
| **Night Agent** | Research → sized **shadow** intents only (never live order API overnight) |
| **Shadow Matcher** | Apply fills on shadow ledger using live mid/ask rules; paper slippage model transparent |
| **Risk Gate** | Pre-intent: caps, allowlist, Proof-of-Risk score (Shield steal) |
| **Promote Engine** | Morning: map accepted shadow legs → live Bitget sized orders; fail-closed |
| **Receipt / Audit** | sealReceipt + bundleHash per night; promotion receipts link shadow→live ids |
| **Notify** | Lagos morning digest: N legs, shadow P&L, one deep link to Promote |

### 5.3 Data model (minimal)

- `Operator`, `BookSnapshot`, `ShadowAccount`, `ShadowFill`, `LiveFill`
- `Intent` (ticker, side, sizedQty, confidence, riskScore, rationale)
- `Receipt` (id, hash, kind: shadow_fill | promote | reject | block, payloadHash, ts)
- `NightBundle` (bundleHash, shadowFills[], promotions[])
- `PromotePolicy` (autoThreshold, maxNotional, allowlist, dualAckRequired)

### 5.4 Overnight loop (hard rules)

1. At **cash close**: freeze sync → open NightBundle → agent may only write ShadowFill.
2. Every signal → **sized rToken action on shadow** + receipt. Soft signals die.
3. Risk gate fail → blocked receipt, no shadow fill.
4. Live Bitget **order API disabled** for agent role until Promote.
5. At **cash open**: Home shows Promote board. Dual-ack (operator + policy seal) required to send live.
6. Rejected legs sealed as reject receipts; never touch live.

### 5.5 Steals from winners (Rick’s ten)

1. Agentropolis — typed proposal before any size  
2. AgentFabric — session keys only on shadow agent  
3. Cronos Shield — Proof-of-Risk on each intent  
4. Intent Firewall — promote policy outside the model  
5. CroIgnite / Onchor — no receipt = did not happen; night = content-addressed bundle  
6. Faktory — auto-promote only above confidence τ  
7. Keryx — live quotes only; no mock markets in the demo path  

### 5.6 Tech sketch (shippable)

- Next.js app (App Router), TypeScript  
- Postgres (or SQLite→Postgres) for ledger + receipts  
- Bitget API for book sync + live promote orders  
- Job runner for overnight cycle (cron at close / open Lagos)  
- Hash-chained receipts (reuse NightDesk seal/bundle patterns where useful, **new product shell**)  
- Author: XElvolution; no AI co-author credit; no em-dash UI slop  

---

## 6. Why this wins Bitget judges

- **Unique:** not “another AI desk.” Verb is promote-from-shadow.  
- **Safe story:** live book untouched overnight (orgs and Lagos remotes care).  
- **Flexible morning:** line-item control beats all-or-nothing WAKE packages.  
- **Still agentic:** agents work all night on real prices (not a empty mandate UI).  
- **Production shape:** onboarding, home, settings, history, logging, dual-ack.  
- **Demo in one breath:** Close → shadow trades tick → Open → Promote three greens → live receipts.

---

## 7. Build plan (if this wins the star)

**Week slice (production, not stub):**

1. New repo or hard fork rename → `shadowbook` (burn NightDesk chrome; don’t lipstick it).  
2. Landing + Enter + Onboarding (import book → shadow twin).  
3. Home + Shadow board + sealed shadow fills.  
4. Promote board + dual-ack + live submit path.  
5. Markets session strip + History receipts + Settings policy.  
6. Submit Bitget with real demo script + female VO if video required.

**Kill list:** blotter-as-home, analytics dash, risk page as product, NightDesk name/chrome, mandate-as-wallpaper.

---

## 8. Ask to Elvis

SHADOWBOOK is my star entry. Different trust model from CURFEW and WAKE.  
Pick the winner. Winner’s architecture becomes the team build. We work as one after that.

