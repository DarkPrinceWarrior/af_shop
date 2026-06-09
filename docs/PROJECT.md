# Shop Meraj — полная документация проекта

> Единый сводный документ по всему проекту: назначение, архитектура, стек,
> модель данных, API, сценарии, конфигурация, запуск и тестирование.
> Частные документы лежат рядом в этой же папке (`docs/backend/`, `docs/frontend/`).

**Оглавление**

1. [Назначение](#1-назначение)
2. [Архитектура и репозитории](#2-архитектура-и-репозитории)
3. [Технологический стек](#3-технологический-стек)
4. [Структура модулей](#4-структура-модулей)
5. [Модель данных](#5-модель-данных)
6. [API — полный справочник](#6-api--полный-справочник)
7. [Локализация и валюты](#7-локализация-и-валюты)
8. [Пользовательские сценарии](#8-пользовательские-сценарии)
9. [Сидинг каталога](#9-сидинг-каталога)
10. [Конфигурация (.env)](#10-конфигурация-env)
11. [Запуск](#11-запуск)
12. [Тестирование](#12-тестирование)
13. [Инструменты разработки (MCP)](#13-инструменты-разработки-mcp)
14. [Скриншоты](#14-скриншоты)
15. [Статус дорожной карты](#15-статус-дорожной-карты)
16. [Нюансы окружения](#16-нюансы-окружения)

---

## 1. Назначение

Shop Meraj — простой интернет-магазин для локальных покупателей с доставкой.
Главный приоритет — быстрый сценарий заказа: покупатель находит товар, визуально
выбирает место доставки и оформляет заказ **без обязательной регистрации**.
Владелец видит новые заказы в админ-панели в реальном времени и получает
уведомление в Telegram.

- Оплата: только наличными/при доставке (первая версия).
- Конвертация валют не требуется — цены и стоимость доставки задаются вручную
  по каждой валюте.
- Хранение изображений: локальная файловая система (`/media`), позже — объектное
  хранилище при необходимости.

Полное ТЗ: [`backend/product_spec.md`](backend/product_spec.md).

---

## 2. Архитектура и репозитории

Проект — это тонкая обёртка-оркестрация над двумя независимо версионируемыми
сервисами. **Три отдельных git-репозитория:**

| Часть | Git-репо | Содержимое |
|---|---|---|
| корень | `af_shop` | оркестрация: `compose.yaml`, `.env(.example)`, `README.md`, `docs/`, `CLAUDE.md`, `AGENTS.md` |
| `back/` | `af_shop_back` | FastAPI backend |
| `front/` | `af_shop_front` | Vite + React storefront |

Единый стек поднимается из корневого `compose.yaml`:

```text
                 ┌──────────────────────────────┐
   браузер ─────▶│ shop-meraj-front  (nginx :80) │  публикуется на :5173
                 └───────────────┬──────────────┘
                                 │  REST /api/v1 + /media (VITE_API_BASE_URL,
                                 │  вшит в бандл на этапе сборки)
                 ┌───────────────▼──────────────┐
                 │ shop-meraj-backend (FastAPI)  │  :8000
                 │  prestart: alembic + seed     │
                 └───────────────┬──────────────┘
                                 │  SQLModel / psycopg
                 ┌───────────────▼──────────────┐
                 │ shop-meraj-db (Postgres 17)   │  :5432
                 └──────────────────────────────┘
```

Тома: `postgres_data` (БД), `media_data` (загруженные изображения, монтируется в
backend на `/app/media`). Зависимости старта: `db` (healthcheck) → `backend`
(healthcheck `/api/v1/utils/health-check/`) → `frontend`.

Ключевые особенности:

- backend на старте сам прогоняет миграции Alembic и **идемпотентно засевает**
  каталог (`app/initial_data.py`).
- `VITE_API_BASE_URL` (по умолчанию `http://localhost:8000`) **вшивается в
  фронтенд-бандл во время сборки** — смена backend-URL требует пересборки образа
  фронта.
- Per-service `back/compose.yaml` и `front/compose.yaml` сохранены для
  изолированной разработки; корневой `compose.yaml` — единая точка входа.

---

## 3. Технологический стек

### Backend (`back/`)

- Python 3.10+ (база — `fastapi/full-stack-fastapi-template`)
- FastAPI (`fastapi[standard]`), Starlette, Uvicorn
- Pydantic v2 + `pydantic-settings`
- SQLModel поверх SQLAlchemy 2.0, PostgreSQL через `psycopg[binary]`
- Alembic (миграции), JWT-аутентификация (`pyjwt`, `pwdlib[argon2,bcrypt]`)
- WebSocket для realtime-заказов в админке
- Telegram Bot API (уведомления владельцу)
- `httpx`, `tenacity`, `emails`/`jinja2`, `sentry-sdk`
- Управление окружением: **uv**
- Качество: `pytest`, `ruff`, `mypy` (strict), `ty`, `prek`

### Frontend (`front/`)

- Vite 6 + React 19 + TypeScript 5.6 (SPA, library-mode React Router 7)
- Tailwind 4 (`@theme inline`, oklch design-токены, без `tailwind.config.js`)
- shadcn-style примитивы на Radix UI (`button`, `input`, `textarea`, `label`,
  `sheet`, `select`, `dialog`)
- `lucide-react` (иконки), `class-variance-authority` + `clsx` + `tailwind-merge`
- i18n собственный (`src/i18n/dict.ts`), RTL для Pashto
- Тесты: Vitest + React Testing Library + jsdom; e2e — Playwright
- Пакетный менеджер: **npm** (не pnpm)
- Раннер прод-бандла: nginx (multi-stage Docker: node build → nginx)

### Инфраструктура

- Docker Compose (Postgres 17, backend, frontend)
- nginx (раздача SPA + проксирование статики)

---

## 4. Структура модулей

### Backend

```text
back/
├── app/
│   ├── main.py                 # FastAPI app, CORS, монтирование /media, роутер
│   ├── api/
│   │   ├── main.py             # сборка api_router
│   │   ├── deps.py             # зависимости (сессия БД, текущий пользователь)
│   │   └── routes/             # catalog, admin, auth/login, users, utils
│   ├── core/
│   │   ├── config.py           # Settings (pydantic-settings)
│   │   ├── db.py               # engine / сессии
│   │   └── security.py         # JWT, хэш паролей
│   ├── models.py               # SQLModel-модели + API-схемы
│   ├── crud.py                 # доступ к данным
│   ├── services/
│   │   ├── orders.py           # расчёт цены, создание/quote заказа, сток
│   │   ├── telegram.py         # уведомления владельцу
│   │   └── realtime.py         # WebSocket-шина admin-событий
│   ├── initial_data.py         # идемпотентный сидер (SHOP_SEED_FILE или дефолт)
│   ├── backend_pre_start.py    # ожидание готовности БД
│   └── alembic/                # миграции
├── seed/                       # JSON-шаблоны сид-данных
├── scripts/                    # prestart.sh и пр.
├── tests/                      # pytest (api/routes, crud, startup)
├── media/                      # локальные изображения (том media_data)
├── Dockerfile, compose.yaml, compose.prod.yaml
└── pyproject.toml, alembic.ini, uv.lock
```

Точка входа приложения: `app.main:app`. Префикс API: `/api/v1`.

### Frontend

```text
front/src/
├── main.tsx                    # createBrowserRouter + RouterProvider
├── Layout.tsx                  # TopBar + <Outlet> + CartDrawer; scroll-to-top
├── api/
│   ├── client.ts               # fetch-обёртка, ApiError, resolveMediaUrl, ~25 методов
│   └── types.ts                # типы, дублируют backend enum'ы (Currency/Language)
├── state/
│   ├── store.tsx               # ShopProvider (язык, валюта, bootstrap, корзина)
│   ├── context.ts              # ShopState, CartLine + createContext
│   ├── useShop.ts              # хук (вынесен ради react-refresh)
│   ├── auth.tsx / authContext.ts / useAuth.ts   # AuthProvider, токен в localStorage
├── components/
│   ├── ui/                     # shadcn-примитивы (Radix)
│   ├── RouteGuards.tsx         # RequireAuth, RequireSuperuser
│   └── features/
│       ├── catalog/            # ProductCard, ProductGrid, CategoryFilter, SearchBar
│       ├── cart/               # CartDrawer (на Sheet)
│       ├── checkout/           # Checkout, DeliveryPlaceCard, OrderSuccess, AuthPanel
│       ├── layout/             # TopBar, Image (с placeholder-fallback)
│       └── admin/              # SidebarNav, OrderStatusBadge
├── layouts/                    # AccountLayout, AdminLayout (с guard'ами)
├── pages/
│   ├── CatalogPage, CheckoutPage, SuccessPage, LoginPage, MyOrdersPage
│   ├── account/                # AccountHome, AccountOrders, AccountOrderDetail, AccountProfile
│   └── admin/                  # AdminDashboard, AdminOrders, AdminOrderDetail,
│                               #   AdminProducts, AdminCategories, AdminDeliveryPlaces, AdminUsers
├── i18n/dict.ts                # TranslationKey union × Record<LanguageCode, Dict>
├── styles/globals.css          # Tailwind + design-токены (Альма)
├── lib/utils.ts                # cn()
├── utils/format.ts             # formatPrice (Intl.NumberFormat)
└── test/setup.ts               # jest-dom matchers
```

Маршруты: `/` (каталог) · `/checkout` · `/orders/:orderNumber/success` ·
`/login` · `/account/*` (RequireAuth) · `/admin/*` (RequireSuperuser).
Alias `@/*` → `./src/*`.

---

## 5. Модель данных

Таблицы БД (`public`): `category`, `product`, `product_image`,
`delivery_place`, `shop_order`, `order_item`, `order_status_history`, `user`,
`alembic_version`.

| Сущность | Назначение | Ключевые поля |
|---|---|---|
| **Category** | категория товаров | мультиязычное `name` (en/ps/zh-CN), `is_active`, `sort_order` |
| **Product** | товар | мультиязычные `name`/`description`, цены `price_afn/cny/usd`, `stock_quantity`, `is_active`, `category_id`, изображения |
| **ProductImage** | изображения товара | `product_id`, `image_path` (`/media/...`), `sort_order` |
| **DeliveryPlace** | предустановленное место доставки (≈10 шт.) | мультиязычные `name`/`description`, `delivery_fee_afn/cny/usd`, фото, `is_active`, `sort_order` |
| **Order** (`shop_order`) | заказ | `order_number` (`SM-YYYYMMDDHHMMSS-XXXXXX`), `customer_name/phone/telegram/comment`, `language`, `currency`, `delivery_place_id`, `delivery_fee`, `subtotal`, `total`, `status`, `user_id` (null для гостя), `created_at`, `stock_returned_at` |
| **OrderItem** | позиция заказа | `order_id`, `product_id`, `quantity`, цена позиции на момент заказа |
| **OrderStatusHistory** | история смены статуса | `order_id`, `status`, `admin_comment`, отметка времени |
| **User** | админ/покупатель | `email`, хэш пароля, `full_name`, `is_active`, `is_superuser` |

Статусы заказа: `new` → `accepted` → `preparing` → `delivering` → `completed`,
а также `cancelled`. Деньги передаются строками (`Decimal`), напр. `"220.00"`.

Точные поля и схемы — в `back/app/models.py`.

---

## 6. API — полный справочник

База: `http://localhost:8000`, префикс `/api/v1`. Подробные примеры тел запросов
и ответов — в [`backend/api_frontend.md`](backend/api_frontend.md).

### Публичный магазин

| Метод | Путь | Назначение |
|---|---|---|
| GET | `/catalog/bootstrap?language=&currency=` | первый запрос витрины: язык/валюта + списки + активные категории/товары/места |
| GET | `/catalog/categories/view?language=` | локализованные категории |
| GET | `/catalog/products/view?language=&currency=&category_id=&q=` | локализованные товары + фильтры |
| GET | `/catalog/delivery-places/view?language=&currency=` | локализованные места доставки |
| GET | `/catalog/{categories,products,delivery-places}` | сырые мультиязычные объекты |
| POST | `/catalog/orders/quote` | расчёт subtotal/delivery/total без списания стока |
| POST | `/catalog/orders` | создание заказа (Bearer опционален); `200`/`404`/`409` |
| GET | `/catalog/orders/me?skip=&limit=` | история заказов покупателя (токен) |
| GET | `/catalog/orders/me/{order_id}` | заказ покупателя (`404` если чужой) |

`POST /catalog/orders` валидирует и **списывает сток**, сохраняет заказ,
рассылает admin-событие по WebSocket и отправляет Telegram-уведомление (если
настроено). Коды: `200` создан, `404` товар/место не найдены/неактивны,
`409` недостаточно стока.

### Аутентификация

| Метод | Путь | Назначение |
|---|---|---|
| POST | `/login/access-token` | form-urlencoded `username`/`password` → JWT |
| POST | `/users/signup` | регистрация покупателя (JSON) |
| GET | `/users/me` | текущий пользователь (токен) |
| PATCH | `/users/me`, `/users/me/password` | профиль / смена пароля |

### Админ (Bearer суперпользователя)

| Метод | Путь | Назначение |
|---|---|---|
| GET | `/admin/dashboard` | счётчики товаров/мест/заказов |
| GET | `/admin/orders?skip=&limit=&status=&q=&date_from=&date_to=` | список заказов (новые сверху) |
| GET | `/admin/orders/{id}` | детали (`status_history`, `admin_comment`, `stock_returned_at`) |
| PATCH | `/admin/orders/{id}/status` | смена статуса |
| POST | `/admin/orders/{id}/cancel` | отмена + возврат стока (однократно) |
| POST | `/admin/orders/{id}/complete` | завершение |
| PATCH | `/admin/orders/{id}/comment` | только admin-комментарий |
| WS | `/admin/orders/ws?token=` | realtime-событие `order.created` |
| GET/POST/PATCH/DELETE | `/admin/{products,categories,delivery-places}` | CRUD каталога |
| POST | `/admin/products/{id}/images` | изображения товара |
| POST | `/admin/media/images` | загрузка файла → `{ "image_path": "/media/images/..." }` |
| GET/POST/PATCH/DELETE | `/users/` | управление пользователями |

### Служебное

| Метод | Путь | Назначение |
|---|---|---|
| GET | `/utils/health-check/` | healthcheck (используется в compose) → `true` |

---

## 7. Локализация и валюты

- **Языки:** `en` (по умолчанию), `ps` (پښتو, RTL), `zh-CN` (简体中文). На фронте
  `RTL_LANGUAGES` переключает `<html dir="rtl">` и `lang`.
- **Валюты:** `AFN`, `CNY`, `USD`. Цены и стоимость доставки хранятся отдельно
  по каждой валюте, конвертации нет. Форматирование — `Intl.NumberFormat` в
  `front/src/utils/format.ts`.
- Все клиентские названия (товары, категории, места) и ключевые UI-лейблы
  поддерживают три языка. Добавление i18n-ключа требует обновить union
  `TranslationKey` **и** все три словаря — иначе падает TS-сборка.
- Enum'ы валют/языков продублированы по имени в `front/src/api/types.ts` и
  должны соответствовать backend `CurrencyCode`/`LanguageCode` в
  `back/app/models.py`.

---

## 8. Пользовательские сценарии

### Покупатель (без аккаунта)

1. Открывает магазин — первый экран всегда каталог (без landing).
2. Выбирает язык интерфейса (`en/ps/zh-CN`) и валюту (`AFN/CNY/USD`).
3. Просматривает каталог / ищет товары (фильтрация клиентская по
   `bootstrap.products`).
4. Фильтрует по категории.
5. Добавляет товары в корзину. Инвариант: позиции корзины авто-обрезаются по
   текущему `stock_quantity`, `+` блокируется на пределе стока.
6. Открывает checkout, вводит имя/телефон/Telegram/комментарий, выбирает место
   доставки по фото. На каждое изменение дозапрашивается `POST /orders/quote`
   (последний запрос выигрывает по sequence-счётчику).
7. Видит стоимость доставки и итог, подтверждает заказ.
8. Получает success-view с `order_number`. Опционально регистрируется/входит —
   тогда заказ привязывается к аккаунту (`user_id`), иначе остаётся гостевым.

### Владелец / админ

1. Вход (`/login` → `/admin` для суперпользователя).
2. Дашборд: счётчики товаров, стока, новых и активных заказов.
3. Realtime-список новых заказов (WebSocket) + Telegram-уведомление.
4. Детали заказа, смена статуса, complete/cancel (с возвратом стока),
   admin-комментарий.
5. CRUD: товары (мультиязычные поля + загрузка фото), категории, места доставки,
   пользователи.

---

## 9. Сидинг каталога

- На старте `app/initial_data.py` смотрит `SHOP_SEED_FILE`; если пусто — пробует
  `seed/shop_seed.json`; если файла нет — использует встроенные демо-данные.
- Встроенный дефолт: **3 категории, 10 мест доставки, 4 товара**.
- Сид **идемпотентен по таблицам** (существующие записи не пересоздаются).
- Формат JSON: корневые ключи `categories`, `delivery_places`, `products`; товары
  связываются с категорией по `category_name_en`; деньги — строками; пути картинок
  — URL под `/media/...` (загрузчик файлы не копирует).
- Пересоздать с нуля локально: `docker compose down -v && docker compose up --build -d`
  (на проде `down -v` не запускать — удалит том БД).

Подробно: [`backend/seed_data.md`](backend/seed_data.md).

---

## 10. Конфигурация (.env)

Корневой `.env` (см. `.env.example`) питает все три сервиса. Значимые переменные:

| Переменная | Назначение |
|---|---|
| `POSTGRES_DB/USER/PASSWORD` | параметры БД (по умолчанию `shop_meraj`/`postgres`/`changethis`) |
| `SECRET_KEY` | подпись JWT |
| `FIRST_SUPERUSER`, `FIRST_SUPERUSER_PASSWORD` | админ (по умолчанию `admin@example.com`/`changethis`) |
| `FRONTEND_HOST`, `BACKEND_CORS_ORIGINS` | CORS / ссылки |
| `VITE_API_BASE_URL` | backend-URL, **вшивается в бандл фронта на сборке** |
| `TELEGRAM_BOT_TOKEN`, `TELEGRAM_OWNER_CHAT_ID` | уведомления (оба обязательны, иначе тихий режим) |
| `SHOP_SEED_FILE` | путь к JSON-сиду (иначе дефолт) |
| `SMTP_*`, `SENTRY_DSN` | почта / мониторинг (опционально) |

> Безопасность: `.env`, токены, пароли, дампы БД и загруженные медиа **не
> коммитить**. Для прода заменить дефолтные секреты и использовать
> `back/compose.prod.yaml`.

---

## 11. Запуск

### Весь стек (из корня)

```bash
cp .env.example .env                 # настроить пароли / Telegram
docker compose up --build -d         # db + backend + frontend
docker compose down                  # остановить (тома сохраняются)
docker compose down -v               # + удалить тома (БД и медиа)

docker compose config --quiet        # валидация compose
docker ps --filter "name=shop-meraj-"
curl -s http://localhost:8000/api/v1/utils/health-check/   # -> true
curl -sI http://localhost:5173 | head -1                   # -> HTTP/1.1 200 OK
```

- Витрина: <http://localhost:5173>
- API: <http://localhost:8000>
- Пересборка фронта под другой backend:
  `VITE_API_BASE_URL=http://host:8000 docker compose up --build -d frontend`

### Backend локально (`back/`)

```bash
uv sync
uv run fastapi dev                   # dev-сервер
uv run pytest                        # тесты
uv run ruff check app tests          # линт
docker compose -f compose.prod.yaml config --quiet
```

### Frontend локально (`front/`)

```bash
npm install
npm run dev                          # Vite на :5173 (HMR)
npm run build                        # tsc -b && vite build -> dist/
npm run lint && npm run typecheck && npm run build && npm run test:run   # pre-commit gate
npm run test:e2e                     # Playwright (требует поднятый стек на :5173)
```

---

## 12. Тестирование

Прогон от **2026-06-09** против локального стека (`docker compose up --build -d`),
все три контейнера `healthy`:

| Набор | Команда | Результат |
|---|---|---|
| Backend unit/api | `uv run pytest -q` | **62 passed** |
| Backend API-сценарии (live) | сценарный смоук по контракту | **15/15 passed** |
| Frontend unit | `npm run test:run` (Vitest) | **16 passed** (4 файла) |
| Frontend e2e | `npm run test:e2e` (Playwright, chromium) | **12 passed** |

**Покрытые live-сценарии API:** bootstrap (en/AFN: 3 кат / 4 тов / 10 мест) →
локализованные view (zh-CN/en/ps) → quote (220+80=300) → создание гостевого
заказа (`user_id=null`, `order_number=SM-...`) → списание стока (18→17) →
`409` при нехватке стока → `404` на несуществующий товар → admin-логин →
dashboard → список заказов содержит новый → смена статуса `accepted` →
`complete` → регистрация покупателя + привязка заказа + история `/orders/me`.

**Покрытые e2e (Playwright):** a11y корзины (Escape/focus-trap/scroll-lock),
admin (доступ + access-denied для не-админа), auth (регистрация на checkout +
гостевой checkout), checkout (каталог→корзина→success), login-page (редиректы),
rtl (переключение на `ps` → `dir=rtl`), stock-cap (блокировка `+` на пределе).

Pre-commit gate фронта: `lint → typecheck → build → test:run` (e2e отдельно,
требует поднятый стек).

> ⚠️ Backend `pytest` использует **тот же** dev-DB (`POSTGRES_SERVER=localhost`),
> и его фикстуры очищают каталог. После прогона backend-тестов локально нужно
> пересеять данные: `docker compose restart backend` или
> `docker exec shop-meraj-backend python app/initial_data.py`. Для CI выделять
> отдельную тестовую БД.

---

## 13. Инструменты разработки (MCP)

Навигация и редактирование кода идут через MCP-серверы с разделением ролей —
`fff` (поиск) → `codegraph` (структура) → `serena` (символьное чтение/правки).
Полные правила, codegraph-sync и память (Honcho) описаны в корневых
[`CLAUDE.md`](../CLAUDE.md) и [`AGENTS.md`](../AGENTS.md).

Важное по этому проекту:

- **codegraph индексируется по-сервисно** (`back/.codegraph`, `front/.codegraph`),
  не в корне (вложенные git-репо). В MCP-вызовах передавать `projectPath` на
  нужный сервис; из CLI — `cd back`/`cd front`.
  - back: ~697 узлов / 1167 рёбер (Python). front: ~614 узлов / 1290 рёбер (TS/TSX).
- **Serena** настроена `languages: [python, typescript]`; смена языков применяется
  только после перезапуска Serena MCP-сервера.

---

## 14. Скриншоты

Сняты автоматически Playwright против локального стека.

- **Демо для заказчика** — [`frontend/demo-screenshots/`](frontend/demo-screenshots/)
  ([README](frontend/demo-screenshots/README.md)): витрина (каталог en/AFN,
  ps/RTL, zh/CNY, корзина, checkout), auth (вход/регистрация, success),
  личный кабинет (`/account/*`), админ-панель (`/admin/*`).
- **Технические снимки этапов** — [`frontend/screenshots/`](frontend/screenshots/):
  редизайн каталога, polished checkout, auth-панель, admin dashboard и др.

---

## 15. Статус дорожной карты

Полная карта с деталями — [`frontend/roadmap.md`](frontend/roadmap.md).

| # | Этап | Статус |
|---|---|---|
| 0 | MVP storefront (Vite+React+TS, i18n, корзина, checkout, Docker) | ✅ |
| 0.5 | Tailwind 4 + shadcn + Router 7 + Vitest + lucide + alias + рестрактур | ✅ |
| 1 | Единый Docker Compose в корне | ✅ |
| 2 | Визуальная проверка end-to-end (Playwright) | ✅ |
| 3 | Telegram-уведомления | ✅ |
| 4 | Реальные изображения товаров и мест | ✅ |
| 5 | Тесты фронта (Vitest + Playwright) | ✅ |
| 6 | A11y / UX-полировка | ✅ |
| 7 | Re-skin под Альма design system | ✅ |
| 8 | Customer auth (login / register / guest) | ✅ |
| 9 | Account & admin dashboards | ✅ |
| 10 | План production-деплоя | ⚪ later |

---

## 16. Нюансы окружения

- **Docker на этой WSL-машине:** интеграция Docker Desktop с дистрибутивом
  выключена — нативный `docker` в WSL не работает. Использовать Windows-бинарь
  `docker.exe` (и `docker.exe compose`). Демон может быть остановлен — стартовать
  через `"/mnt/c/Program Files/Docker/Docker/Docker Desktop.exe"` и ждать
  `docker.exe info`.
- Первая сборка может упасть на транзиентном таймауте Docker Hub
  (`registry-1.docker.io`) — повторить.
- Backend pytest очищает dev-DB (см. раздел 12) — пересевать каталог после
  локального прогона тестов.

---

*Документ собран из частных docs (`back/docs`, `front/docs`), которые были
консолидированы в эту папку. Дизайн-система — лифт от sister-проекта
`alma_servie` («Аномалии Альма»): нейтральная палитра `#f9f9f9 → #222226`,
primary `#4b4ce6`, шрифты Commissioner + Geist.*
