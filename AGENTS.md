# Repository instructions

Root orchestration repo for **Shop Meraj**. MCP/tooling rules below are ported
from the `alma_servie` repo and adapted to this project. Per-service files take
precedence inside their subtree (`back/AGENTS.md`, `front/CLAUDE.md`).

## Project purpose

Multi-language e-commerce storefront, shipped as a single Docker Compose stack
over two independently versioned services:

- `back/` — FastAPI backend (git repo `af_shop_back`), API on `:8000`.
- `front/` — Vite 6 + React 19 + TypeScript SPA (git repo `af_shop_front`),
  nginx on `:5173`.
- root — orchestration only: `compose.yaml`, `.env(.example)`, `README.md`
  (git repo `af_shop`).

Stack services: `shop-meraj-db` (Postgres 17), `shop-meraj-backend`,
`shop-meraj-front`. Backend auto-migrates (Alembic) and idempotently seeds the
catalog on first boot. `VITE_API_BASE_URL` is baked into the frontend bundle at
build time — rebuild the frontend image to retarget. Languages `en | ps | zh-CN`
(Pashto RTL); currencies `AFN | CNY | USD`.

## Memory and context

Use Honcho as the memory layer. Consult it for project preferences, working
rules, prior decisions, and remembered context. Current tools: `get_peer_card`,
`set_peer_card`, `list_conclusions`, `create_conclusions`, `chat`,
`schedule_dream`. Separate confirmed facts (files, command output) from
inference (memory, architectural guesses) until verified locally.

## Tooling rules

Three MCP servers with a strict division of labour: `fff` to locate, `codegraph`
to understand structure, `serena` to read a symbol precisely and edit it. Do not
duplicate them — each owns one job.

### fff — locate files and literal text

Use fff first for any file search or grep in a git repo; do not use shell
`find`/`grep`/`rg` when fff can express the query. One bare identifier per query;
after two grep calls, read the code instead of grepping variations.

### codegraph — structural questions over the symbol graph

Tree-sitter knowledge graph (SQLite) of every symbol, edge, and file.

- `codegraph_context "<task>"` / `codegraph_explore` — PRIMARY: entry points +
  related symbols + code in one call. Start here for any feature/bug/unfamiliar
  area; explore source sections include line numbers for `file:line` citations.
- `codegraph_search` — symbol by name; prefer over `fff grep` for symbol lookup.
- `codegraph_callers` / `codegraph_callees` — who calls / what is called.
- `codegraph_impact <symbol>` — blast radius before a refactor.
- `codegraph_node` — a symbol's source / signature.

Trust codegraph results (full AST parse); do not re-verify with grep. Do not
query the index in the same turn as a file edit (~500 ms watcher debounce).

**Per-service indexes (important).** `back/` and `front/` are nested independent
git repos, so codegraph is initialized inside each, not at the root:

- `back/.codegraph` (Python) and `front/.codegraph` (TypeScript/TSX).
- With the MCP server rooted at the repo root, pass
  `projectPath: /home/ruslan_safaev/shop_meraj/back` (or `.../front`) on each
  call. From the CLI, `cd` into the service first.

### serena — symbolic navigation and symbol-level edits

After fff/codegraph identify the area, use Serena for LSP-precise navigation and
the only symbol-level *edits*: `get_symbols_overview`, `find_symbol`,
`find_referencing_symbols` (final check before `rename_symbol`),
`replace_symbol_body`, `insert_before_symbol`, `insert_after_symbol`,
`rename_symbol`, `safe_delete_symbol`. Prefer Serena over reading/rewriting full
files. Note: the Serena project is configured `languages: [python]` — it covers
the backend; for `front/` TypeScript symbol work, add `typescript` to
`.serena/project.yml` (restarts language servers) or fall back to codegraph+fff.

### codegraph index sync

The MCP server auto-syncs (~2 s debounce). Still keep it fresh: run
`codegraph status` at the start of a session and `codegraph sync` after bulk
changes (`git pull`, branch switch, mass file generation). If a result
contradicts a file, the index is stale — `codegraph sync` and re-query. On slow
or WSL `/mnt/*` filesystems use `codegraph serve --mcp --no-watch` and rely on
explicit `codegraph sync`.

Standard cycle: locate (`fff` / `codegraph_search`) → understand
(`codegraph_context`, then `codegraph_explore`) → assess risk
(`codegraph_impact`) → read and edit (`serena`) → verify (run checks;
`playwright` smoke for UI).

### Other MCP

- **context7** — version-sensitive framework/library docs (FastAPI, Starlette,
  Pydantic, SQLModel/SQLAlchemy, Alembic, React 19, Vite 6, Tailwind 4); prefer
  over web search and memory.
- **tavily** — fresh external web research.
- **playwright** — browser smoke-checks after UI changes (`front/e2e/`).
- **fastapi skill** — FastAPI routes, deps, schemas, Pydantic models,
  startup/lifespan, auth/RBAC, API design in `back/`.

## Key commands

```bash
# Whole stack (repo root)
cp .env.example .env
docker compose up --build -d
docker compose down
docker ps --filter "name=shop-meraj-"
curl -s http://localhost:8000/api/v1/utils/health-check/

# Backend (back/)
uv sync && uv run fastapi dev
uv run pytest && uv run ruff check app tests

# Frontend (front/)
npm install && npm run dev
npm run lint && npm run typecheck && npm run build && npm run test:run
```

## Scope discipline

Before changing code, briefly state what was found, what will change, and why.
Prefer minimal, localized edits over broad refactors. Do not rename files, move
modules, change public interfaces, install dependencies, or edit secrets unless
explicitly required. Never edit the backend from `front/` or vice versa — they
are separate repos. Never commit `.env`, tokens, passwords, DB dumps, or
uploaded media.
