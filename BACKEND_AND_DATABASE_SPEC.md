# Backend & database spec (Partner in Trader)

This document describes the API and persistence model expected by the frontend (`src/features/trades/api/tradesApi.js`, `src/lib/apiClient.js`).

## Environment

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_BASE_URL` | `''` | API origin (e.g. `http://localhost:8080`) |
| `VITE_USE_MOCK_DATA` | `true` (unset) | Set to `false` to call the real API |

## Trade entity

```json
{
  "id": "uuid",
  "symbol": "AAPL",
  "side": "long",
  "entryDate": "2026-10-01T09:35:00.000Z",
  "exitDate": "2026-10-01T14:20:00.000Z",
  "entryPrice": 178.5,
  "exitPrice": 181.2,
  "quantity": 50,
  "fees": 2.5,
  "outcome": "win",
  "notes": "Optional journal text",
  "tags": ["momentum", "earnings-week"]
}
```

### Fields

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | string (UUID) | server | Primary key |
| `symbol` | string | yes | Ticker, uppercase recommended |
| `side` | `long` \| `short` | yes | |
| `entryDate` | ISO 8601 datetime | yes | |
| `exitDate` | ISO 8601 datetime \| null | no | Null when position is open |
| `entryPrice` | decimal | yes | |
| `exitPrice` | decimal \| null | no | |
| `quantity` | integer | yes | Shares/contracts |
| `fees` | decimal | yes | Default `0` |
| `outcome` | `win` \| `loss` \| `breakeven` \| `open` | yes | May be derived server-side |
| `notes` | text | no | |
| `tags` | string[] | no | |

### P&L (computed)

- **Gross P&L**: `(exitPrice - entryPrice) * quantity` for long; inverted for short.
- **Net P&L**: gross P&L minus `fees`.
- **Outcome**: `open` if no exit; otherwise win/loss/breakeven from net P&L (±$0.01 tolerance for breakeven).

## REST API

Base path: `/api/trades`

### `GET /api/trades`

Returns all trades for the authenticated user, newest first.

**Response:** `200` — `Trade[]`

### `GET /api/trades/:id`

**Response:** `200` — `Trade` | `404`

### `POST /api/trades`

**Body:** trade fields without `id` (outcome optional if server derives).

**Response:** `201` — created `Trade`

### `PATCH /api/trades/:id`

Partial update.

**Response:** `200` — updated `Trade` | `404`

### `DELETE /api/trades/:id`

**Response:** `204` | `404`

### Errors

```json
{
  "message": "Human-readable error"
}
```

## Suggested database schema (PostgreSQL)

```sql
CREATE TABLE trades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  symbol VARCHAR(16) NOT NULL,
  side VARCHAR(8) NOT NULL CHECK (side IN ('long', 'short')),
  entry_at TIMESTAMPTZ NOT NULL,
  exit_at TIMESTAMPTZ,
  entry_price NUMERIC(18, 6) NOT NULL,
  exit_price NUMERIC(18, 6),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  fees NUMERIC(18, 6) NOT NULL DEFAULT 0,
  outcome VARCHAR(16) NOT NULL CHECK (outcome IN ('win', 'loss', 'breakeven', 'open')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE trade_tags (
  trade_id UUID NOT NULL REFERENCES trades(id) ON DELETE CASCADE,
  tag VARCHAR(64) NOT NULL,
  PRIMARY KEY (trade_id, tag)
);

CREATE INDEX idx_trades_user_entry ON trades (user_id, entry_at DESC);
CREATE INDEX idx_trade_tags_tag ON trade_tags (tag);
```

## Future endpoints (not wired in UI yet)

- `GET /api/analytics/summary` — server-side aggregates for large journals
- `GET /api/trades?from=&to=&symbol=` — filtered list for calendar/export
