# Recipe Collection

A small full-stack application for the AVENDIS coding challenge: browse, create,
search, sort and preview recipes, and send a recipe to a friend by e-mail.

**Stack:** CakePHP 5 (JSON REST API) · Angular + TypeScript · Bootstrap 5 ·
MySQL 8.0 · PHP 8.3 · nginx + PHP-FPM · Docker

| Feature (from the brief) | Where |
|---|---|
| 1. Browse recipes | recipe list (cards) + detail view |
| 2. Create recipes with ingredients | reactive form with dynamic ingredient rows |
| 3. Send a recipe by e-mail *(optional)* | "Share by e-mail" modal on the detail page |
| 4. Sort the list | server-side via the ORM (title / created) |
| 5. Search recipes | server-side `LIKE`, debounced input |
| 6. AJAX preview on hovering the title | RxJS `switchMap` + cache + dedicated endpoint |
| 7. User friendly | loading / empty / error states, responsive, validation |

The work is broken into 15 issues under [`docs/issues/`](docs/issues/README.md)
(the plan, with up-front rationale) and a matching build log under
[`docs/implementation/`](docs/implementation/README.md) (what was actually built
and why, including bugs found during review and how they were fixed).

---

## Architecture

```
┌─────────────────────────┐        JSON / HTTP        ┌──────────────────────────┐
│  Angular SPA (frontend)  │  ───────────────────────▶ │  CakePHP API (api)        │
│  http://localhost:4200   │  ◀─────────────────────── │  http://localhost:8765    │
│  Bootstrap 5, RxJS       │      CORS                  │  nginx + PHP-FPM 8.3      │
└─────────────────────────┘                            └────────────┬─────────────┘
                                                                     │ PDO
                                                          ┌──────────▼───────────┐
                                                          │  MySQL 8.0            │
                                                          └──────────────────────┘
```

Two separate parts, talking JSON over HTTP:

- **`api/`** — CakePHP 5 as a **pure JSON REST API**. It speaks only JSON; opening
  it in a browser returns a small JSON index, not a web page.
- **`frontend/`** — the Angular single-page app. **This is the user interface** —
  open `http://localhost:4200` to use the application. It fetches its data from
  the API.

> **Which URL do I open?** The website is **`http://localhost:4200`** (Angular).
> `http://localhost:8765` is the backend API — useful for `curl`, not for browsing.

### Endpoints

| Method | Path | Purpose |
|---|---|---|
| GET | `/status` | health check → `{"status":"ok"}` |
| GET | `/recipes` | list, supports `?search=`, `?sort=title\|created`, `?direction=ASC\|DESC` |
| GET | `/recipes/{id}` | one recipe with ingredients |
| GET | `/recipes/{id}/preview` | trimmed payload for the hover preview |
| POST | `/recipes` | create a recipe + ingredients |
| POST | `/recipes/{id}/send-mail` | e-mail the recipe to an address |

---

## Setup

The recommended path is **Docker Compose** — it provisions the exact required
versions (PHP 8.3, MySQL 8.0, nginx) and runs identically on any machine,
including the Ubuntu 26.04 target. A native Ubuntu setup is documented below as
the production-equivalent alternative.

### Option A — Docker Compose (recommended)

```bash
# 1. Provide environment variables (credentials, ports)
cp .env.example .env

# 2. Build and start nginx + PHP-FPM 8.3 + MySQL 8.0
docker compose up -d --build

# 3. Install backend dependencies and set up the database
docker compose exec php composer install
docker compose exec php bin/cake.php migrations migrate
docker compose exec php bin/cake.php seeds run RecipesSeed   # the chocolate-cake example

# 4. Start the frontend (Angular dev server)
cd frontend
npm install
npm start

# 5. Open the app
#    Frontend (the website):  http://localhost:4200
#    API (JSON):              http://localhost:8765
```

> If `localhost:3306` is already taken by a local MySQL/MariaDB, change
> `MYSQL_PORT` in `.env` (e.g. to 3307). The container-internal port stays 3306,
> so nothing else changes.

### Option B — Ubuntu 26.04 LTS (native, production-like)

The deployment target is an Ubuntu 26.04 VM with nginx + PHP-FPM. The numbered
commands below install the full stack natively:

```bash
# 1.  System packages up to date
sudo apt update && sudo apt upgrade -y

# 2.  Tooling for adding PHP repositories
sudo apt install -y software-properties-common

# 3.  PHP 8.3 repository
sudo add-apt-repository ppa:ondrej/php -y && sudo apt update

# 4.  PHP 8.3 + the extensions CakePHP 5 needs
sudo apt install -y php8.3 php8.3-fpm php8.3-mysql php8.3-mbstring \
    php8.3-intl php8.3-xml php8.3-curl php8.3-zip

# 5.  nginx web server
sudo apt install -y nginx

# 6.  MySQL 8.0 server
sudo apt install -y mysql-server-8.0

# 7.  Enable and start the services
sudo systemctl enable --now php8.3-fpm nginx mysql

# 8.  Backend dependencies, migrations and seed (run inside ./api)
cd api && composer install
bin/cake migrations migrate && bin/cake seeds run RecipesSeed

# 9.  Fallback dev server if you don't want to configure an nginx vhost:
#     bin/cake server -p 8765

# 10. Node.js 22 for the Angular frontend
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -

# 11. Install Node.js
sudo apt install -y nodejs

# 12. Angular CLI, then build/serve the frontend
sudo npm install -g @angular/cli
cd ../frontend && npm install && npm start
```

For native setups, point `api/`'s `DATABASE_URL` (via `.env` or
`config/app_local.php`) at the local MySQL instance.

---

## Testing

```bash
# Backend (PHPUnit + CodeSniffer) — runs against a separate MySQL test database
docker compose exec php vendor/bin/phpunit      # 35 tests
docker compose exec php vendor/bin/phpcs

# Frontend (Karma + Jasmine, headless Chrome)
cd frontend && npm test                          # 25 specs

# Cross-browser smoke test of all core flows in Firefox + Chromium
cd frontend && npm run e2e                        # requires the app running
```

Tests run on every push via GitHub Actions ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)).

---

## Architecture decisions

The reasoning behind each decision lives in the issue and implementation logs;
the key ones in brief:

| Decision | Choice | Why |
|---|---|---|
| Backend framework | **CakePHP 5** (not plain PHP) | It is the framework openITCOCKPIT itself uses; routing, ORM, validation and JSON come built in. |
| API shape | **JSON-only REST** | Clean separation from the Angular SPA; matches the "We love JSON" hint. The root and all errors return JSON. |
| Frontend | **Angular 20 + Bootstrap 5** | Required stack. Standalone components (the modern Angular default). Angular 20 (not 22) to match the local Node version; any recent Angular works. |
| Dev environment | **Docker Compose** | Reproducible, version-exact (PHP 8.3 pinned even though the host runs a different version). |
| `ingredients.amount` | **`DECIMAL(8,2)`** | Exact fixed-point values — no float rounding (`1.4999…`), and supports fractional amounts (`1.5 l`). Validation bounds it to the column range so an out-of-range value is a clean 422, not a DB 500. |
| `ingredients.unit` | **`VARCHAR`** (free text) | A new unit needs no migration, unlike an `ENUM`. |
| Foreign key | **`ON DELETE CASCADE`** | Ingredients have no meaning without their recipe. |
| Sorting & search | **Server-side via the ORM** | Works across the whole dataset (not just rendered rows); sort columns are whitelisted (a column name can't be a bound parameter → SQL-injection safety). |
| Search input | **`debounceTime(300)` + `switchMap`** | One request per pause in typing; `switchMap` cancels stale requests so a slow earlier response never overwrites a newer one. |
| Hover preview | **`switchMap` + cache + dedicated `/preview` endpoint** | The centrepiece. Debounce avoids requests for titles merely passed over; `switchMap` cancels superseded requests; a `Map` cache means re-hovering makes no second request; the dedicated endpoint keeps the high-frequency payload small. |
| CORS | **Outermost middleware** | So error responses (404/400/500) also carry CORS headers — otherwise the browser blocks them cross-origin. |
| E-mail transport | **Debug transport (env-driven)** | Verifiable in dev without a mail server (logged to `logs/debug.log`); a `.env` switch enables real SMTP in production. |

### A note on Symfony → CakePHP

**No Symfony is used in this project.** A "PHP developer" might be expected to
reach for Symfony (the dominant enterprise PHP framework), so this is worth
stating explicitly: the framework here is **CakePHP 5**, chosen deliberately
because the task offers CakePHP as an option *and* because **openITCOCKPIT — the
product this role works on — is built on CakePHP**. Using the same framework
means the code mirrors the team's actual stack rather than a generic default.

---

## Browser support

Core flows verified end-to-end (automated, via `npm run e2e`) in:

| Flow | Firefox 151 | Chrome / Edge 149 *(Chromium engine)* |
|---|---|---|
| Browse list | ✓ | ✓ |
| Search | ✓ | ✓ |
| Sort | ✓ | ✓ |
| Hover preview | ✓ | ✓ |
| Detail view | ✓ | ✓ |
| Create recipe | ✓ | ✓ |
| Send by e-mail | ✓ | ✓ |
| No console errors | ✓ | ✓ |

Chrome and Edge share the Chromium engine, so the Chromium run covers both. The
app uses only standard web APIs (no engine-specific code) and is responsive down
to a 375 px (mobile) viewport.

---

## Project layout

```
api/         CakePHP 5 JSON API (controllers, models, migrations, mailer, tests)
frontend/    Angular SPA (components, services, models, specs, e2e/)
docker/      nginx + PHP-FPM images and MySQL init
docs/        issues/ (the plan) and implementation/ (the build log)
docker-compose.yml
```

---

## License

[MIT](LICENSE)

---

<details>
<summary>Original challenge brief (AVENDIS)</summary>

Create a recipe collection where a user can browse existing recipes or create a
new one. Recipes can be sent by e-mail to a given address. Use plain PHP or
CakePHP, plus TypeScript and Angular.

**Features:** (1) browse recipes, (2) create recipes with ingredients,
(3) send a recipe by e-mail (optional), (4) sort the list, (5) search recipes,
(6) load a recipe preview via AJAX on hover of the title, (7) make it user
friendly.

**Requirements:** PHP >= 8.3 · MySQL >= 8.0 · Bootstrap 5.x · TypeScript and
Angular · HTML5 · supported browsers Firefox, Chrome, Microsoft Edge.

**Workflow:** fork the repository, create a branch named after your GitHub
username, and open a pull request when done. License: MIT.

</details>
