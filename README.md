# Shop Meraj

Multi-language storefront for Shop Meraj. Single Docker Compose stack:

- `shop-meraj-db` — Postgres 17
- `shop-meraj-backend` — FastAPI (`./back`) on `:8000`
- `shop-meraj-front` — Vite + React + nginx (`./front`) on `:5173`

## Quick start

```bash
cp .env.example .env       # adjust passwords / Telegram tokens
docker compose up --build -d
```

- Storefront: <http://localhost:5173>
- API: <http://localhost:8000>
- API health: <http://localhost:8000/api/v1/utils/health-check/>

Stop the stack:

```bash
docker compose down        # keeps volumes
docker compose down -v     # also drops postgres + media volumes
```

## Layout

```text
shop_meraj/
├── compose.yaml           # root stack — entry point for the whole app
├── .env.example
├── back/                  # FastAPI backend (own git repo + own compose.yaml for standalone use)
└── front/                 # Vite storefront (own git repo + own compose.yaml for standalone use)
```

The per-service `back/compose.yaml` and `front/compose.yaml` still work for
isolated development. The root `compose.yaml` is the unified entry point.

## Configuration highlights

- `VITE_API_BASE_URL` is **baked into the frontend bundle at build time**. To
  retarget a different backend, change it in `.env` and rebuild:
  `docker compose up --build -d frontend`.
- The backend auto-runs Alembic migrations and seeds initial catalog data
  (`back/app/initial_data.py`) on first boot. Seeding is idempotent.
- Set `SHOP_SEED_FILE=/app/seed/shop_seed.example.json` to use the example
  seed JSON instead of the built-in defaults.
- Telegram notifications fire only when both `TELEGRAM_BOT_TOKEN` and
  `TELEGRAM_OWNER_CHAT_ID` are set.

## Verification

```bash
docker compose config --quiet
docker compose up --build -d
docker ps --filter "name=shop-meraj-"
curl -s http://localhost:8000/api/v1/utils/health-check/
curl -sI http://localhost:5173 | head -1
```

## Docs

All project documentation is consolidated under `docs/`:

- `docs/PROJECT.md` — full project reference (architecture, API, data model,
  scenarios, config, testing).
- `docs/backend/` — `api_frontend.md`, `product_spec.md`, `seed_data.md`.
- `docs/frontend/` — `roadmap.md`, `screenshots/`, `demo-screenshots/`.

Per-service quick refs: `back/README.md`, `back/AGENTS.md`, `front/README.md`,
`front/CLAUDE.md`.
