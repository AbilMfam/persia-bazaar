# DigiMall Backend (Laravel 11 + Sanctum + MySQL)

REST API for the DigiMall marketplace mobile app (React + Capacitor Android).

## Requirements

- PHP 8.2+
- Composer 2
- MySQL 5.7+ / MariaDB 10.3+

## Setup

```bash
composer install
cp .env.example .env
php artisan key:generate
# edit .env — set DB_DATABASE, DB_USERNAME, DB_PASSWORD
php artisan db:ensure-created   # creates MySQL schema from .env if missing (handy without mysql CLI on PATH)
php artisan migrate --seed
php artisan serve   # http://localhost:8000
```

Seeded demo account: `demo@digimall.test` / `password`.

## Authentication

Token-based via **Laravel Sanctum** (`Bearer <token>`).

| Method | Endpoint            | Body                                       | Auth |
|--------|---------------------|--------------------------------------------|------|
| POST   | `/api/auth/register`| `name, email, password, password_confirmation, device_name?` | — |
| POST   | `/api/auth/login`   | `email, password, device_name?`            | — |
| POST   | `/api/auth/logout`  | —                                          | ✅ |
| GET    | `/api/auth/me`      | —                                          | ✅ |

Response includes `token` — store it on the device and send as
`Authorization: Bearer <token>` on subsequent requests.

## Categories

Slug values match storefront category ids (e.g. `mobile`, `fashion`). Use `slug` when filtering `/api/products?category=...`.

| Method | Endpoint         | Body | Auth |
|--------|-----------------|------|------|
| GET    | `/api/categories` | —   | —    |

## Products

| Method | Endpoint                 | Body                                  | Auth |
|--------|--------------------------|---------------------------------------|------|
| GET    | `/api/products?per_page=15&q=...&page=2` | —                          | — |
| GET    | `/api/products/{id}`     | —                                      | — |
| POST   | `/api/products`          | `title, description, price, category? (existing slug), image_url?`| ✅ |
| PUT    | `/api/products/{id}`     | any subset of the above                | ✅ owner |
| DELETE | `/api/products/{id}`     | —                                      | ✅ owner |

## Response envelope

Success:
```json
{ "status": "success", "data": { ... }, "meta": { "current_page": 1, "per_page": 15, "total": 28, "last_page": 2 } }
```

Error:
```json
{ "status": "error", "message": "...", "errors": { "field": ["..."] } }
```

## CORS

Set allowed origins in `.env`:
```
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:8080,http://localhost:8081,https://localhost,capacitor://localhost
```
Capacitor Android requests come from `https://localhost` (or `capacitor://localhost`)
by default — both are pre-configured.

## Deploy (shared hosting / DirectAdmin)

Use **[`DEPLOYMENT_DIRECTADMIN.md`](DEPLOYMENT_DIRECTADMIN.md)** for a **step‑by‑step checklist**, **HTTPS / proxy tuning**, **CORS (Capacitor)**, and **Sanctum Bearer** verification.

Synopsis:

1. Upload **`backend/`**; document root → **`public/`**.
2. `composer install --no-dev --optimize-autoloader`
3. `cp .env.production.example .env` → set `APP_KEY`, `APP_URL` (HTTPS), `DB_*`, `CORS_*`, optionally `APP_FORCE_HTTPS` + `TRUST_ALL_PROXIES`.
4. `php artisan key:generate` (once); `php artisan migrate --force` (optional `--seed`).
5. `chmod -R 775 storage bootstrap/cache`
6. `php artisan config:cache && php artisan route:cache` (after `.env` is stable; see doc for clearing).

## React (Capacitor) usage

```ts
const API = "https://api.example.com/api";

async function login(email: string, password: string) {
  const r = await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Accept": "application/json" },
    body: JSON.stringify({ email, password, device_name: "android" }),
  });
  const json = await r.json();
  if (json.status !== "success") throw new Error(json.message);
  localStorage.setItem("token", json.data.token);
}

async function listProducts(page = 1) {
  const r = await fetch(`${API}/products?page=${page}`);
  return r.json();
}

async function createProduct(p: { title: string; description: string; price: number; image_url?: string }) {
  const token = localStorage.getItem("token");
  const r = await fetch(`${API}/products`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(p),
  });
  return r.json();
}
```
