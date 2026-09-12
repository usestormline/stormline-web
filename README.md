# Stormline Web

[![CI](https://github.com/usestormline/stormline-web/actions/workflows/ci.yml/badge.svg)](https://github.com/usestormline/stormline-web/actions/workflows/ci.yml) [![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE)

The public React interface for **Stormline**, an independent political, geopolitical, and macro intelligence platform for DeFi and canonical Robinhood Stock Tokens. It presents verified events, geographic risk, economic calendars, market context, user-authored strategies, and non-custodial wallet-aware workflows.

## Principles
- Evidence and source provenance before prediction
- Canonical chain-4663 contract identity before ticker matching
- UTC timestamps and explicit provider degradation
- User-authored decisions; no guaranteed returns or automatic execution

## Quick start
```bash
pnpm install
cp .env.example .env
PORT=4173 BASE_PATH=/ pnpm build
pnpm typecheck
```
Run the API separately from [stormline-api](https://github.com/usestormline/stormline-api). Contract clients live in [stormline-sdk](https://github.com/usestormline/stormline-sdk). Safe fixtures live in [stormline-intelligence-samples](https://github.com/usestormline/stormline-intelligence-samples).

## Community
Read [CONTRIBUTING.md](CONTRIBUTING.md), [SECURITY.md](SECURITY.md), and [GOVERNANCE.md](GOVERNANCE.md). Support: support@usestormline.com · Updates: https://x.com/UseStormLine

## Independence
Stormline is not affiliated with, endorsed by, or sponsored by Robinhood Markets, Inc. Market information is context, not financial advice or a Stock Token pricing oracle.
