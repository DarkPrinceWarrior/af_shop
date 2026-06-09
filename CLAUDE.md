# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working in this
repository. MCP/tooling rules below are ported from the `alma_servie` repo and
adapted to Shop Meraj.

## Project overview

**Shop Meraj** — multi-language e-commerce storefront. The repo is a thin Docker
orchestration wrapper over two independently versioned services:

- `back/` — FastAPI backend (own git repo `af_shop_back`), API on `:8000`.
- `front/` — Vite 6 + React 19 + TypeScript storefront SPA (own git repo
  `af_shop_front`), served by nginx on `:5173`.
- root — orchestration only: `compose.yaml`, `.env(.example)`, `README.md` (own
  git repo `af_shop`).

Single stack via `compose.yaml`: `shop-meraj-db` (Postgres 17) +
`shop-meraj-backend` (FastAPI `:8000`) + `shop-meraj-front` (nginx `:5173`).
The backend auto-runs Alembic migrations and idempotently seeds catalog data on
first boot. `VITE_API_BASE_URL` is **baked into the frontend bundle at build
time** — rebuild the frontend image to retarget the backend.

Languages/currencies: `en | ps | zh-CN` (Pashto is RTL), `AFN | CNY | USD`.

Full documentation is consolidated under `docs/` (`docs/PROJECT.md` is the master
reference; `docs/backend/` and `docs/frontend/` hold the source docs). Per-service
quick refs still apply inside their subtree: `back/README.md`, `back/AGENTS.md`,
`front/README.md`, `front/CLAUDE.md`.

## Tooling

Code navigation uses three MCP servers, each with one job — do not duplicate them:

- **fff** — locate files and literal text (strings, comments, log messages).
  Use fff instead of shell `find`/`grep`/`rg`. One bare identifier per query;
  after two greps, read the code.
- **codegraph** — structural questions over a tree-sitter symbol graph.
  `codegraph_context "<task>"` / `codegraph_explore` is the primary tool (entry
  points + related symbols + code in one call). Also `codegraph_search` (symbol
  by name — prefer over `fff grep`), `codegraph_callers`/`codegraph_callees`,
  `codegraph_impact` (blast radius before a refactor), `codegraph_node`. Source
  sections include line numbers for direct `file:line` citations. Trust its
  results — full AST parse; do not re-verify with grep.
- **serena** — LSP-precise symbol navigation and the only tool that *edits* at
  symbol level (`find_symbol`, `get_symbols_overview`, `find_referencing_symbols`,
  `replace_symbol_body`, `insert_*`, `rename_symbol`, `safe_delete_symbol`).
  Prefer over reading whole files.

Cycle: locate (fff / `codegraph_search`) → understand (`codegraph_context`, then
one precise `codegraph_explore` for deep architecture questions) → assess risk
(`codegraph_impact`) → read and edit (serena) → verify.

### codegraph is indexed per service, not at the root

Because `back/` and `front/` are **nested independent git repos**, codegraph at
the repo root indexes nothing useful. Two separate indexes exist:

- `back/.codegraph` — Python backend (FastAPI/SQLModel).
- `front/.codegraph` — TypeScript/TSX storefront.

When the codegraph MCP server is rooted at the repo root, pass the explicit
service path to query the right index:

```text
codegraph_* … projectPath: /home/ruslan_safaev/shop_meraj/back
codegraph_* … projectPath: /home/ruslan_safaev/shop_meraj/front
```

From the CLI, `cd` into `back/` or `front/` first. Re-init a service with
`codegraph init .` inside it; keep fresh with `codegraph sync` after bulk
changes (`git pull`, branch switch, mass file generation). If a codegraph
answer contradicts the file, the index is stale — `codegraph sync` and re-query.
Do not query the index in the same turn as an edit (~500 ms watcher lag).

### Serena scope

The Serena project is rooted at the repo root with `languages: [python]`, so
symbolic navigation/editing covers the **backend** out of the box. For
TypeScript symbol-level work in `front/`, add `typescript` to
`.serena/project.yml` `languages:` (restarts the language servers). Until then,
use codegraph (`front/.codegraph`) + fff for the frontend.

### Other MCP

- **context7** — version-sensitive library docs (FastAPI, Starlette, Pydantic,
  SQLAlchemy/SQLModel, Alembic, React 19, Vite 6, Tailwind 4); prefer over web
  search and over memory for actively changing libraries.
- **tavily** — fresh external web research (releases, changelogs, comparisons).
- **playwright** — browser smoke-checks after UI changes; `front/e2e/` already
  has Playwright specs that run against the live stack on `:5173`.
- **fastapi skill** — use when changing routes, dependencies, schemas, Pydantic
  models, startup/lifespan logic, auth/RBAC, or API behavior in `back/`.

## Memory (Honcho)

Use Honcho as the memory layer. Before answering questions about project
preferences, working rules, prior decisions, or remembered context, consult
Honcho in addition to this file and local repo docs. Current Honcho MCP tools:
`get_peer_card`, `set_peer_card`, `list_conclusions`, `create_conclusions`,
`chat`, `schedule_dream`. Save key decisions/conventions via `create_conclusions`
rather than relying on the context window.

Separate confirmed facts from inference: treat files and command outputs as
confirmed; treat Honcho memory and architectural guesses as inference until
verified locally.

## Commands

```bash
# Whole stack (from repo root)
cp .env.example .env
docker compose up --build -d            # db + backend + frontend
docker compose down                     # keeps volumes
docker ps --filter "name=shop-meraj-"
curl -s http://localhost:8000/api/v1/utils/health-check/
curl -sI http://localhost:5173 | head -1

# Backend (back/)
uv sync
uv run fastapi dev
uv run pytest
uv run ruff check app tests

# Frontend (front/)
npm install
npm run dev                             # Vite on :5173 (HMR)
npm run lint && npm run typecheck && npm run build && npm run test:run
npm run test:e2e                        # Playwright (needs the docker stack up)
```

## Scope discipline

Before changing code, briefly state what was found, what will change, and why.
Prefer minimal, localized edits. Do not rename files, move modules, change
public APIs, install dependencies, or edit secrets unless the task requires it.
Never edit the backend from `front/` or vice versa — they are separate repos.
Never commit `.env`, tokens, passwords, DB dumps, or uploaded media.
