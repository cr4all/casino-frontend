# Casino Frontend

React SPA (Vite + TypeScript) for the casino player experience.

## API Contract

OpenAPI spec is vendored at `contracts/player-v1.yaml` (from [casino-api-contract](https://github.com/cr4all/casino-api-contract)).

Sync from contract repo when a new tag is released:

```bash
# download tagged player-v1.yaml into contracts/
npm run sync:contract
npm run generate:api
```

## Setup

```bash
cp .env.example .env
npm install
npm run generate:api
npm run dev
```

Dev server: `http://localhost:5173`  
API proxy: `/api` → `http://localhost:8000`

## Environment

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_URL` | `http://localhost:8000/api/v1` | Backend API base URL |
| `VITE_TAWK_PROPERTY_ID` | — | tawk.to Property ID (Chat Widget embed) |
| `VITE_TAWK_WIDGET_ID` | — | tawk.to Widget ID (Chat Widget embed) |

## Build

```bash
npm run build
```

Runs type generation from OpenAPI, then TypeScript check and Vite build.

## Related repos

- [casino-backend](https://github.com/cr4all/casino-backend) — Laravel API
- [casino-api-contract](https://github.com/cr4all/casino-api-contract) — OpenAPI spec

UI/design docs: `docs/`
