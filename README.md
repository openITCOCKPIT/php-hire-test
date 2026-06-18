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

In production the SPA and API share a **single origin**: one nginx serves the
built Angular app and proxies `/api` to the backend — so there is no CORS and one
URL to open.

```
                          http://localhost:8080
┌──────────────────────────────────────────────────────────┐
│  frontend (nginx)                                          │
│   /        → Angular SPA (Bootstrap 5, RxJS)               │
│   /api/... → proxied ─────────────┐                        │
└───────────────────────────────────┼────────────────────────┘
                                     ▼
                        ┌──────────────────────────┐
                        │  nginx → PHP-FPM 8.3       │
                        │  CakePHP JSON API (/api)   │
                        └────────────┬──────────────┘
                                     │ PDO
                          ┌──────────▼───────────┐
                          │  MySQL 8.0            │
                          └──────────────────────┘
```

- **`api/`** — CakePHP 5 as a **pure JSON REST API** under `/api`. It speaks only
  JSON; the backend root returns a small JSON index, not a web page.
- **`frontend/`** — the Angular single-page app. In the container it is served by
  nginx, which also proxies `/api` to the backend (single origin, no CORS).

> **Which URL do I open?** The whole app is **`http://localhost:8080`**.
> During development you can instead run the Angular dev server on
> `http://localhost:4200`, which talks cross-origin to the backend on
> `http://localhost:8765/api`.

### Endpoints (under `/api`)

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/status` | health check → `{"status":"ok"}` |
| GET | `/api/recipes` | list, supports `?search=`, `?sort=title\|created`, `?direction=ASC\|DESC` |
| GET | `/api/recipes/{id}` | one recipe with ingredients |
| GET | `/api/recipes/{id}/preview` | trimmed payload for the hover preview |
| POST | `/api/recipes` | create a recipe + ingredients |
| PUT | `/api/recipes/{id}` | update a recipe + replace ingredients |
| DELETE | `/api/recipes/{id}` | delete a recipe (ingredients cascade) |
| POST | `/api/recipes/{id}/send-mail` | e-mail the recipe to an address |

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

# 2. Build and start everything (MySQL, PHP-FPM, the API nginx and the SPA)
docker compose up -d --build

# 3. Set up the database
docker compose exec php composer install
docker compose exec php bin/cake.php migrations migrate
docker compose exec php bin/cake.php seeds run RecipesSeed   # the chocolate-cake example

# 4. Open the app — a single URL, SPA + proxied API:
#    http://localhost:8080
```

For **frontend development** (live reload), run the Angular dev server instead of
using the container:

```bash
cd frontend && npm install && npm start   # http://localhost:4200 → API on :8765/api
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
docker compose exec php vendor/bin/phpunit      # 44 tests
docker compose exec php vendor/bin/phpcs

# Frontend (Karma + Jasmine, headless Chrome)
cd frontend && npm test                          # 30 specs

# Cross-browser smoke test of all core flows in Firefox + Chromium
cd frontend && npm run e2e                        # requires the app running
```

**Trying the e-mail feature:** the Docker stack includes **Mailpit**, a local mail
catcher. Open a recipe → *Share by e-mail* → enter an address → *Send*, then view
the captured e-mail (full HTML, subject, recipient) at **http://localhost:8025**.
Without Mailpit (leave `EMAIL_TRANSPORT_DEFAULT_URL` empty), the Debug transport
logs each send to `logs/debug.log` instead.

The backend (PHPUnit + phpcs) and frontend (Karma) unit tests run on every push
via GitHub Actions ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)); the
cross-browser e2e smoke test is run locally (it needs the full stack running).

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
| CORS | **Outermost middleware** | So error responses (404/400/500) also carry CORS headers — otherwise the browser blocks them cross-origin. Only needed for the dev workflow; the container is single-origin. |
| Deployment | **Single origin** — one nginx serves the SPA and proxies `/api` | One URL, no CORS in production. The API lives under `/api` so client routes (`/recipes/5`) and API endpoints (`/api/recipes/5`) never collide; deep-link refresh works via `try_files … /index.html`. |
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
