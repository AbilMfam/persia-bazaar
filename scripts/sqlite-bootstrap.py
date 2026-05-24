#!/usr/bin/env python3
"""Create backend SQLite schema and seed rows (parity with Laravel migrations + DatabaseSeeder).
Use when PHP/Composer is unavailable. Timestamps use the local system clock.

requires: pip install bcrypt
"""

from __future__ import annotations

import argparse
import base64
import random
import re
import secrets
import sqlite3
import sys
from datetime import datetime, timedelta
from pathlib import Path
from urllib.parse import quote as url_quote


def _stamp_now() -> str:
    return datetime.now().strftime("%Y-%m-%d %H:%M:%S")


def ensure_app_key(env_path: Path) -> None:
    if not env_path.is_file():
        return
    txt = env_path.read_text(encoding="utf-8")
    m = re.search(r"(?m)^[\t ]*APP_KEY[\t ]*=([\t ]*.*?)\s*$", txt)
    if m:
        inner = (m.group(1) or "").strip()
        if (inner.startswith('"') and inner.endswith('"')) or (inner.startswith("'") and inner.endswith("'")):
            inner = inner[1:-1].strip()
        if inner.startswith("base64:") and len(inner) > 20:
            return
        if inner and not inner.startswith("base64:"):
            return
    key_val = "base64:" + base64.b64encode(secrets.token_bytes(32)).decode("ascii")
    if re.search(r"(?m)^[\t ]*APP_KEY[\t ]*=", txt):
        next_txt = re.sub(r"(?m)^([\t ]*APP_KEY[\t ]*=).*$", r"\1" + key_val + "\n", txt, count=1)
    else:
        next_txt = f"APP_KEY={key_val}\n\n" + txt
    env_path.write_text(next_txt, encoding="utf-8")


CATEGORIES = (
    ("mobile", "موبایل"),
    ("fashion", "مد و پوشاک"),
    ("home", "خانه"),
    ("beauty", "زیبایی"),
    ("book", "کتاب"),
    ("sport", "ورزش"),
    ("toy", "اسباب‌بازی"),
    ("food", "خوراکی"),
)

SAMPLE_PRODUCTS = (
    ("Samsung Galaxy S24 Ultra 256GB", 58_900_000, "Flagship phone with 200MP camera and Snapdragon 8 Gen 3.", "mobile"),
    ("Apple AirPods Pro 2nd Gen", 9_450_000, "Wireless earbuds with active noise cancellation.", "mobile"),
    ("Nike Air Zoom Pegasus 40", 4_290_000, "Lightweight running shoes with Zoom Air cushioning.", "sport"),
    ("Apple Watch Series 9 45mm", 21_700_000, "Smartwatch with S9 chip and brighter display.", "mobile"),
    ("Nivea Soft Moisturizer 200ml", 285_000, "Light moisturizer with vitamin E and jojoba oil.", "beauty"),
    ("Elif Shafak — The Forty Rules of Love", 320_000, "Novel about Rumi and Shams of Tabriz.", "book"),
    ("Granite Cookware Set 9 pieces", 6_800_000, "Non-stick granite cookware with ergonomic handles.", "home"),
    ("Cotton Crew-neck T-Shirt", 480_000, "100% cotton tee, soft fabric, daily wear.", "fashion"),
)

DEMO_EMAIL = "demo@digimall.test"

MIGRATION_FILES = (
    "2024_01_01_000000_create_users_table",
    "2024_01_01_000001_create_personal_access_tokens_table",
    "2024_01_01_000002_create_products_table",
    "2026_05_21_000003_add_category_and_expand_product_image_url",
    "2026_05_21_000004_create_categories_table",
)


def build_schema(connection: sqlite3.Connection) -> None:
    connection.executescript(
        """
        PRAGMA foreign_keys = OFF;
        DROP TABLE IF EXISTS sessions;
        DROP TABLE IF EXISTS password_reset_tokens;
        DROP TABLE IF EXISTS personal_access_tokens;
        DROP TABLE IF EXISTS products;
        DROP TABLE IF EXISTS categories;
        DROP TABLE IF EXISTS migrations;
        DROP TABLE IF EXISTS users;

        CREATE TABLE migrations (
          id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
          migration VARCHAR NOT NULL,
          batch INTEGER NOT NULL
        );

        CREATE TABLE users (
          id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
          name VARCHAR NOT NULL,
          email VARCHAR NOT NULL,
          email_verified_at DATETIME DEFAULT NULL,
          password VARCHAR NOT NULL,
          remember_token VARCHAR DEFAULT NULL,
          created_at DATETIME DEFAULT NULL,
          updated_at DATETIME DEFAULT NULL
        );
        CREATE UNIQUE INDEX users_email_unique ON users (email);

        CREATE TABLE password_reset_tokens (
          email VARCHAR PRIMARY KEY NOT NULL,
          token VARCHAR NOT NULL,
          created_at DATETIME DEFAULT NULL
        );

        CREATE TABLE sessions (
          id VARCHAR PRIMARY KEY NOT NULL,
          user_id INTEGER DEFAULT NULL,
          ip_address VARCHAR(45) DEFAULT NULL,
          user_agent TEXT DEFAULT NULL,
          payload TEXT NOT NULL,
          last_activity INTEGER NOT NULL
        );
        CREATE INDEX sessions_user_id_index ON sessions (user_id);
        CREATE INDEX sessions_last_activity_index ON sessions (last_activity);

        CREATE TABLE personal_access_tokens (
          id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
          tokenable_type VARCHAR NOT NULL,
          tokenable_id INTEGER NOT NULL,
          name VARCHAR NOT NULL,
          token VARCHAR NOT NULL,
          abilities TEXT DEFAULT NULL,
          last_used_at DATETIME DEFAULT NULL,
          expires_at DATETIME DEFAULT NULL,
          created_at DATETIME DEFAULT NULL,
          updated_at DATETIME DEFAULT NULL
        );
        CREATE INDEX personal_access_tokens_tokenable_type_tokenable_id_index
          ON personal_access_tokens (tokenable_type, tokenable_id);
        CREATE UNIQUE INDEX personal_access_tokens_token_unique ON personal_access_tokens (token);

        CREATE TABLE categories (
          id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
          slug VARCHAR(64) NOT NULL,
          name VARCHAR(128) NOT NULL,
          created_at DATETIME DEFAULT NULL,
          updated_at DATETIME DEFAULT NULL
        );
        CREATE UNIQUE INDEX categories_slug_unique ON categories (slug);

        CREATE TABLE products (
          id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
          user_id INTEGER DEFAULT NULL REFERENCES users(id) ON DELETE SET NULL,
          title VARCHAR NOT NULL,
          description TEXT NOT NULL,
          category VARCHAR(64) DEFAULT NULL,
          price INTEGER NOT NULL DEFAULT 0,
          image_url VARCHAR DEFAULT NULL,
          created_at DATETIME DEFAULT NULL,
          updated_at DATETIME DEFAULT NULL
        );
        CREATE INDEX products_user_id_index ON products (user_id);
        CREATE INDEX products_created_at_index ON products (created_at);

        PRAGMA foreign_keys = ON;
        """
    )


def seed(connection: sqlite3.Connection) -> None:
    try:
        import bcrypt as _bcrypt
    except ModuleNotFoundError as exc:
        raise RuntimeError(
            "برای این اسکریپت لازم است: pip install bcrypt\n"
            "یا با PHP: composer install در backend و بعد php artisan migrate --seed"
        ) from exc

    now_str = _stamp_now()
    cur = connection.cursor()

    cur.executemany(
        "INSERT INTO categories (slug, name, created_at, updated_at) VALUES (?, ?, ?, ?)",
        [(s, n, now_str, now_str) for s, n in CATEGORIES],
    )

    password_hash_raw = _bcrypt.hashpw(b"password", _bcrypt.gensalt(rounds=10)).decode("utf-8")
    # PHP/Laravel پیش‌وند $2y$ را تشخیص می‌دهد
    password_hash = password_hash_raw.replace("$2b$", "$2y$", 1)

    cur.execute(
        """
        INSERT INTO users (name, email, password, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?)
        """,
        ("Demo Seller", DEMO_EMAIL, password_hash, now_str, now_str),
    )
    demo_id = int(cur.lastrowid)

    base_dt = datetime.now()
    slug_list = list({c for c, _ in CATEGORIES})
    rnd = random.Random(4242)

    n_sample = len(SAMPLE_PRODUCTS)
    rows: list[tuple] = []

    def pic_url(seed: str) -> str:
        return f"https://picsum.photos/seed/{url_quote(seed, safe='')}/600/600"

    sample_titles = {t for t, _, _, _ in SAMPLE_PRODUCTS}

    for idx, row in enumerate(SAMPLE_PRODUCTS):
        title, price, description, cat = row
        stamp = base_dt - timedelta(seconds=n_sample - idx)
        tstamp = stamp.strftime("%Y-%m-%d %H:%M:%S")
        rows.append((demo_id, title, description, cat, price, pic_url(title), tstamp, tstamp))

    for i in range(20):
        title = rnd.choice(("Sample", "Demo", "Lorem")) + f" gadget {i + 1}-{rnd.randint(1000, 9999)}"
        while title in sample_titles:
            title += f"x{rnd.randint(1, 9)}"
        sample_titles.add(title)
        stamp = base_dt - timedelta(seconds=40 + i)
        tstamp = stamp.strftime("%Y-%m-%d %H:%M:%S")
        cat = rnd.choice(slug_list)
        price = rnd.randint(100_000, 50_000_000)
        desc = "Factory-style placeholder description for seeded catalog browsing."
        rows.append((demo_id, title, desc, cat, price, pic_url(title), tstamp, tstamp))

    cur.executemany(
        """
        INSERT INTO products (
          user_id, title, description, category, price, image_url,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """,
        rows,
    )

    batch = 1
    cur.executemany(
        "INSERT INTO migrations (migration, batch) VALUES (?, ?)",
        [(m, batch) for m in MIGRATION_FILES],
    )

    connection.commit()


def main(argv: list[str]) -> int:
    repo = Path(__file__).resolve().parent.parent
    default_db = repo / "backend" / "database" / "database.sqlite"

    # Windows console UTF-8 (برای پیام فارسی)
    if hasattr(sys.stdout, "reconfigure"):
        try:
            sys.stdout.reconfigure(encoding="utf-8")
            sys.stderr.reconfigure(encoding="utf-8")  # type: ignore[union-attr]
        except (OSError, ValueError):
            pass
    p = argparse.ArgumentParser(description="Bootstrap SQLite matching Laravel migrations + seeds")
    p.add_argument(
        "--db",
        default=str(default_db),
        help=f"SQLite file path (default: {default_db})",
    )
    args = p.parse_args(argv)

    db_path = Path(args.db).resolve()
    db_path.parent.mkdir(parents=True, exist_ok=True)

    try:
        con = sqlite3.connect(db_path)
    except sqlite3.Error as exc:
        print(f"خطا در اتصال به SQLite: {exc}", file=sys.stderr)
        return 1

    try:
        build_schema(con)
        seed(con)
    except RuntimeError as err:
        print(str(err), file=sys.stderr)
        return 2
    except Exception as exc:  # noqa: BLE001
        print(f"خطا در bootstrap: {exc}", file=sys.stderr)
        return 3
    finally:
        con.close()

    print(f"SQLite آماده شد: {db_path}")
    print("ورود دمو Laravel: demo@digimall.test / password")
    print("اطمینان حاصل کن که در backend/.env خط DB_CONNECTION=sqlite و DB_DATABASE اشاره به همین مسیر باشد.")

    ensure_app_key(repo / "backend" / ".env")
    print("در صورت خالی بودن، APP_KEY در backend/.env پر شد تا بتوان Laravel را با php artisan روشن کرد.")

    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv[1:]))
