# Partner in Trade — Frontend

Trading journal web app built with **React**, **Vite**, and **Tailwind CSS**. Track trades, review P&L, and explore playbook analytics. Data is stored in the browser (`localStorage`) by default; API hooks are in place for a future backend.

## Features

- **Dashboard** — KPIs, equity curve, daily P&L, recent trades
- **P&L calendar** — Trades and day-level P&L on a month grid
- **Trade log** — Searchable table with detail view and delete
- **Playbooks & edge** — Setup-level performance breakdown
- **Add trade drawer** — Right-side form with market type, USD/INR currency, long/short, prices, risk (R), and review fields (screenshots placeholder)

## Tech stack

| Layer | Choice |
|--------|--------|
| UI | React 18 |
| Build | Vite 5 |
| Styling | Tailwind CSS 3 |
| Charts | Recharts |
| Icons | Lucide React |

Path alias: `@/` → `src/` (see `vite.config.js`).

## Getting started

### Prerequisites

- **Node.js** 18+ recommended
- **npm** (on Arch/Garuda: `sudo pacman -S npm` if `npm` is missing)

### Install and run

```bash
cd pit_web_react
npm install
npm run dev
```

Dev server: [http://localhost:3000](http://localhost:3000)

If `npm run dev` fails, start Vite directly:

```bash
./node_modules/.bin/vite
```

### Other scripts

```bash
npm run build    # production build → dist/
npm run preview  # serve dist locally
```

## Project structure

```
src/
├── app/
│   ├── App.jsx
│   └── providers/TradeContext.jsx   # trades state + localStorage
├── components/layout/               # Sidebar, TopHeader
├── components/ui/                   # KpiCard, OutcomeBadge, Toast
├── data/mockTrades.js               # sample trades, playbooks, currencies
├── features/
│   ├── analytics/
│   ├── calendar/
│   ├── dashboard/
│   └── trades/                      # log, entry drawer, calculations, API
├── lib/apiClient.js
├── index.css
└── main.jsx
```

## Data & environment

- Trades persist under the key `partner_in_trade_trades_v1` in `localStorage`.
- Use **Reset Sample Trades** in the sidebar to reload demo data from `mockTrades.js`.

Optional API configuration (copy `.env.example` to `.env`):

| Variable | Description |
|----------|-------------|
| `VITE_API_BASE_URL` | Backend origin (e.g. `http://localhost:8080`) |
| `VITE_USE_MOCK_DATA` | Set to `false` when wiring a live API |

See **[BACKEND_AND_DATABASE_SPEC.md](./BACKEND_AND_DATABASE_SPEC.md)** for REST shapes and a suggested PostgreSQL schema.

## License

Private project (`package.json` → `"private": true`).
