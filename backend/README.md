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

## Deploy (shared hosting)

1. Upload the whole folder.
2. Point your domain document root to **`public/`** (or copy `public/.htaccess` to root).
3. Run `composer install --no-dev --optimize-autoloader`.
4. Create the MySQL DB and update `.env`.
5. Run `php artisan key:generate && php artisan migrate --force --seed`.
6. Make `storage/` and `bootstrap/cache/` writable (`chmod -R 775`).
7. Cache for prod: `php artisan config:cache && php artisan route:cache`.

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
