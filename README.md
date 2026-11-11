# Partner in Trade — Frontend

The React web application for **Partner in Trade**, a trading journal and performance workspace. The frontend provides authentication, subscription onboarding, trade journaling, analytics, market and strategy views, and plan-based feature visibility.

## Product areas

- **Authentication** — Sign in and account registration; API requests use the stored bearer token.
- **Subscription onboarding** — Free-trial activation, BASIC/PRO plan selection, Razorpay checkout, and subscription status synchronization with the backend.
- **Dashboard** — Trading overview and key performance information.
- **Trade journal** — Trade log, trade entry and detail flows, journal views, and P&L calendar.
- **Analytics** — Performance and trade analytics.
- **Markets and strategies** — Market selection and strategy views.
- **News calendar** — Calendar view for market-related news.

Feature visibility is controlled by centralized plan capabilities (FREE, TRIAL, BASIC, and PRO). Frontend gating is for presentation; backend authorization remains authoritative. A client-side payment callback does not itself grant paid access—the verified subscription state is loaded from the backend.

## Tech stack

| Area | Technology |
| --- | --- |
| UI | React 18 |
| Build and dev server | Vite 5 |
| Styling | Tailwind CSS 3 |
| State management | Redux Toolkit and React Redux |
| HTTP client | Axios |
| Charts | Recharts |
| Icons | Lucide React |
| Tests | Vitest, Testing Library, and MSW |

The `@/` import alias resolves to `src/` (configured in `vite.config.js`).

## Requirements

- Node.js (18 or newer recommended)
- npm

## Local setup

From the frontend repository root:

```bash
npm install
```

Create a local `.env` file if you need to override the API configuration:

```bash
cp .env.example .env
```

Start the Vite development server:

```bash
npm run dev
```

The app is served at [http://localhost:3000](http://localhost:3000).

### Backend connection

The frontend selects its API base URL from the Vite build environment:

- **Development / staging (`npm run dev`):** always uses `http://localhost:8080/api/v1`.
- **Production build (`npm run build`):** uses `VITE_API_BASE_URL_PROD`, set to the deployed backend URL including `/api/v1`.

The Vite development server also proxies requests beginning with `/api` to `http://localhost:8080`. This proxy is only used by the development server.

Set `VITE_API_BASE_URL_PROD` in the environment that runs the production build (for example, your frontend hosting provider's build environment). If it is missing, a production build fails fast rather than silently sending API requests to localhost. Restart the dev server after changing environment variables.

## Environment variables

| Variable | Purpose | Default |
| --- | --- | --- |
| `VITE_API_BASE_URL_PROD` | Production backend API base URL, including the `/api/v1` prefix. Required for production builds. | `https://partner-in-trade.onrender.com/api/v1` |
| `VITE_API_TIMEOUT_MS` | API request timeout in milliseconds | `90000` |

See [`.env.example`](./.env.example) for the checked-in example configuration. Do not commit secrets or personal credentials to `.env`.

## Available commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Create the production build in `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm test` | Start Vitest |
| `npm run test:run` | Run the test suite once (CI-friendly) |

## Project layout

```
src/
├── app/
│   ├── App.jsx                 # App shell and route-like tab rendering
│   ├── AppEffects.jsx          # Authentication and data bootstrap effects
│   └── store/                  # Redux store, slices, and selectors
├── components/
│   ├── layout/                 # Sidebar and top header
│   └── ui/                     # Shared UI components
├── features/
│   ├── analytics/
│   ├── auth/
│   ├── calendar/
│   ├── dashboard/
│   ├── journal/
│   ├── markets/
│   ├── news/
│   ├── strategies/
│   ├── subscription/           # Plans, onboarding, checkout, API integration
│   └── trades/                 # Trade log, entry/detail UI, and trade flows
├── lib/                        # API client and data mappers
├── test/                       # Shared test setup and mocks
├── constants/
├── index.css
└── main.jsx                    # React entry point and Redux Provider
```

## Authentication and API behavior

- The Axios client attaches the JWT from browser storage as a `Bearer` token.
- A non-development `401 Unauthorized` response triggers the registered session logout handler.
- Authenticated workspace, trade, analytics, and subscription data are loaded through the backend API.
- Subscription context is loaded before the main workspace is shown. If loading fails, the UI offers a retry state.
- Razorpay checkout completion is synchronized against backend subscription status; the frontend does not treat checkout dismissal, failure, or an unverified callback as proof of paid access.

For API contract and integration details, see the backend project and the integration documentation in the parent repository (if available).

## Testing and production build

Run the automated tests and production build before submitting frontend changes:

```bash
npm run test:run
npm run build
```

## Repository visibility

This is a private project. Do not publish credentials, production tokens, customer data, or environment files.
