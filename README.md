# SHADOWBOOK

Agents rehearse overnight on a **live-priced shadow twin** of your Bitget rToken book. At cash open you **promote or discard** each sized leg. No promote = the night never hit your holdings.

**Author:** [XElvolution](https://github.com/xElvolution)

## Unique verb

Promote shadow fills to live (line-item, dual-ack). Overnight agents write **ShadowFill only**. Live orders only via Promote.

## Product

| Route | Purpose |
|---|---|
| `/` | Landing |
| `/enter` | Operator cookie session |
| `/onboarding` | Import Bitget book → spawn shadow twin |
| `/home` | Live read-only + shadow P&L + N waiting |
| `/shadow` | Tonight's sized moves |
| `/promote` | Accept / reject + dual-ack |
| `/markets` | Session-aware rToken quotes |
| `/history` | Sealed receipt hash chain |
| `/settings` | Operators, promote policy, alerts |

## Modules for Rick

- `src/lib/shadow` — ledger, matcher, lived-in night seed
- `src/lib/promote` — engine + policy rails
- `src/lib/receipts` — seal + hash chain

## Develop

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build   # next build --webpack
npm start
```

## Verify

1. Open `/` — one-breath verb + CTA.
2. `/enter` as an operator → `/onboarding` import + spawn twin.
3. `/home` shows live read-only book, shadow P&L, waiting legs.
4. `/shadow` lists sized rToken legs with receipts.
5. `/promote` select greens → dual-ack → promote; or discard.
6. `/history` shows hash-chained receipts; `/markets` session strip; `/settings` policy.

See [ARCHITECTURE.md](./ARCHITECTURE.md).
