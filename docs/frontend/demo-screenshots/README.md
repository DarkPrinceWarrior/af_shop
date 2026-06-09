# Shop Meraj — Demo Screenshots

Снимки клиентской части и админ‑панели для демо заказчику. Снято автоматически
через Playwright против локального стека (`docker compose up -d` из `shop_meraj/`).

---

## Storefront (без аккаунта)

| # | File | Что |
|---|---|---|
| 01 | [01_catalog_en_AFN.png](01_catalog_en_AFN.png) | Каталог, English / AFN |
| 02 | [02_catalog_ps_RTL.png](02_catalog_ps_RTL.png) | Каталог, پښتو, RTL раскладка |
| 03 | [03_catalog_zh_CNY.png](03_catalog_zh_CNY.png) | Каталог, 简体中文 / CNY |
| 04 | [04_cart_drawer.png](04_cart_drawer.png) | Открытая корзина (Sheet drawer) |
| 05 | [05_checkout_guest.png](05_checkout_guest.png) | Checkout в режиме Guest |

## Auth

| # | File | Что |
|---|---|---|
| 06 | [06_checkout_signed_in.png](06_checkout_signed_in.png) | Checkout с залогиненным юзером (имя prefill, "Signed in as …") |
| 07 | [07_order_success.png](07_order_success.png) | Success view с pill "Saved to your account" |
| 08 | [08_login_signin.png](08_login_signin.png) | `/login` → Sign in |
| 09 | [09_login_signup.png](09_login_signup.png) | `/login` → Sign up |

## Личный кабинет (`/account/*`)

| # | File | Что |
|---|---|---|
| 10 | [10_account_home.png](10_account_home.png) | Overview + последние 3 заказа |
| 11 | [11_account_orders.png](11_account_orders.png) | Список заказов |
| 12 | [12_account_order_detail.png](12_account_order_detail.png) | Детальная карточка заказа (items, customer, status history) |
| 13 | [13_account_profile.png](13_account_profile.png) | Профиль (email/name + смена пароля + logout) |

## Админ‑панель (`/admin/*`, only superuser)

| # | File | Что |
|---|---|---|
| 14 | [14_admin_dashboard.png](14_admin_dashboard.png) | Дашборд с 7 метриками (products / stock / orders) |
| 15 | [15_admin_orders.png](15_admin_orders.png) | Список заказов с фильтрами (status / search / date range) |
| 16 | [16_admin_order_detail.png](16_admin_order_detail.png) | Детальная карточка с change‑status / complete / cancel / admin comment |
| 17 | [17_admin_products.png](17_admin_products.png) | Список товаров |
| 18 | [18_admin_product_edit.png](18_admin_product_edit.png) | Форма редактирования товара (Sheet drawer, multilingual поля + image upload) |
| 19 | [19_admin_categories.png](19_admin_categories.png) | Категории CRUD |
| 20 | [20_admin_delivery_places.png](20_admin_delivery_places.png) | Точки доставки CRUD |
| 21 | [21_admin_users.png](21_admin_users.png) | Пользователи CRUD (is_active / is_superuser) |

---

**Дизайн‑система**: лифт от `alma_servie` ("Аномалии Альма") — нейтральная палитра
`#f9f9f9 → #222226`, primary `#4b4ce6`, шрифты Commissioner (display) + Geist (body),
радиусы 8/16/32/pill, frosted backdrop‑blur поверхности.

**Стек**: Vite 6 + React 19 + TypeScript 5.6 + Tailwind 4 + shadcn/Radix + lucide‑react +
React Router 7 + Vitest + Playwright.

**Тесты**: 16/16 unit (Vitest) + 12/12 e2e (Playwright chromium) — все зелёные.
