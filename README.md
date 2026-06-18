# Recipe Collection

A small full-stack application for the AVENDIS coding challenge: browse, create,
edit, search, sort and preview recipes, attach photos and personal notes, and
send a recipe to a friend by e-mail — wrapped in a modern, **openITCOCKPIT-inspired
dark/light UI**.

**Stack:** CakePHP 5 (JSON REST API) · Angular 20 + TypeScript · Bootstrap 5.3 ·
MySQL 8.0 · PHP 8.3 · nginx + PHP-FPM · Docker · Mailpit

## Features

| # | Feature (from the brief) | Where / how |
|---|---|---|
| 1 | Browse recipes | Card list + detail view |
| 2 | Create recipes with ingredients | Reactive form with a dynamic ingredient `FormArray` |
| 3 | Send a recipe by e-mail *(optional)* | "Share by e-mail" modal → CakePHP Mailer → Mailpit |
| 4 | Sort the list | Server-side via the ORM (title / created, ASC/DESC) |
| 5 | Search recipes | Server-side `LIKE`, `debounceTime(300)` input, reflected in the URL |
| 6 | AJAX preview on hovering the title | RxJS `switchMap` + per-id cache + dedicated `/preview` endpoint |
| 7 | User-friendly | Loading / empty / error / not-found states, responsive, validation |

**Beyond the brief**

| Extra | Detail |
|---|---|
| Edit & delete | Full update (`PUT`, ingredients replaced) and delete from the detail view |
| Photo upload | Upload / replace / remove a hero image (JPEG/PNG/WebP, ≤ 5 MB), with busy + error states |
| Personal notes | Add and delete notes per recipe (author optional) |
| Temperature | Optional °C field shown as a badge |
| Filter sidebar | Filter by **duration** and **ingredient count** (client-side) alongside search & sort |
| Dark / light theme | Persisted toggle that respects `prefers-color-scheme` |

The work is broken into 15 issues under [`docs/issues/`](docs/issues/README.md)
(the plan, with up-front rationale) and a matching build log under
[`docs/implementation/`](docs/implementation/README.md). The UI redesign has its
own design spec and implementation plan under
[`docs/superpowers/`](docs/superpowers/).

---

## Architecture

In production the SPA and API share a **single origin**: one nginx serves the
built Angular app and proxies `/api` to the backend — so there is no CORS and one
URL to open.

```
                          http://localhost:8080
┌──────────────────────────────────────────────────────────┐
│  frontend (nginx)                                          │
│   /        → Angular SPA (Bootstrap 5, RxJS, signals)      │
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

---

## User interface

The frontend is a dark-first, **openITCOCKPIT-inspired "Cockpit" design** with a
matching light theme:

- **Theme toggle (🌙 / ☀️)** in the top bar. The choice is persisted in
  `localStorage`; on first visit it follows the OS `prefers-color-scheme`. It is a
  `ThemeService` (Angular signal) that flips `data-bs-theme` on `<html>`.
- **Theming is token-driven, not hard-coded.** A single layer in
  `frontend/src/styles.scss` defines design tokens for both themes and maps them
  onto Bootstrap 5.3's `--bs-*` CSS variables, so standard Bootstrap components
  (cards, buttons, modals, badges, list groups) re-theme for free in both modes.
- **Filter sidebar** instead of dead navigation: search, duration buckets
  (`<15 / 15–30 / 30–60 / >60 min`), ingredient-count buckets (`1–5 / 6–10 / 11+`)
  and sort (`Newest / Oldest / A–Z / Z–A`). Search & sort are server-side; duration
  and ingredient filters are applied client-side over the loaded list.
- **Accent semantics:** violet = state/links/active, green = positive actions
  (New / Save / Send), red = destructive.
- **Accessibility:** colour contrast was verified to meet **WCAG 2.1 AA** in both
  themes (incl. an opaque focus ring and dark-ink text on green buttons);
  icon-only controls carry `aria-label` / `aria-pressed`.

The full design rationale lives in
[`docs/superpowers/specs/2026-06-18-cockpit-frontend-redesign-design.md`](docs/superpowers/specs/2026-06-18-cockpit-frontend-redesign-design.md)
and the step-by-step build plan in
[`docs/superpowers/plans/2026-06-18-cockpit-frontend-redesign.md`](docs/superpowers/plans/2026-06-18-cockpit-frontend-redesign.md).

---

## API reference

Base URL: **`http://localhost:8080/api`** (single-origin) or **`http://localhost:8765/api`**
(dev backend). All endpoints consume and produce **JSON** (image upload is the one
exception — `multipart/form-data`).

**Conventions**

- Success bodies wrap the payload in a named key: `{"recipe": …}`, `{"recipes": […]}`,
  `{"note": …}`, etc.
- **Validation errors** return **`422`** with `{"errors": {"<field>": ["message", …]}}`.
- An **unknown id** returns **`404`** with a JSON error body.
- Create endpoints return **`201`**; reads, updates and deletes return **`200`**.

### Data model

```jsonc
// Recipe
{
  "id": 8,
  "title": "Beef Stew",
  "description": "Sear the beef, then braise low and slow.",   // string | null
  "temperature": 160,                                          // °C, 0–500 | null
  "duration": 150,                                             // minutes, 0–1440 | null
  "image_path": null,                                          // string | null
  "created": "2026-06-18T17:20:00+00:00",                      // ISO-8601
  "ingredients": [
    { "id": 7, "recipe_id": 8, "name": "beef chuck", "amount": "800.00", "unit": "g" }
  ]
}

// Note
{ "id": 3, "recipe_id": 8, "author": "Sam", "body": "Add bay leaf.", "created": "2026-06-18T18:00:00+00:00" }
```

> `amount` is a **decimal string** (`"800.00"`) — the column is `DECIMAL(8,2)`, so
> exact fixed-point values are preserved (no float rounding). On **create/update**
> you send `amount` as a **number**.

### Endpoints

| Method | Path | Purpose | Success | Errors |
|---|---|---|---|---|
| `GET` | `/api/status` | Health check | `200 {"status":"ok"}` | — |
| `GET` | `/api/recipes` | List recipes | `200 {"recipes":[…]}` | — |
| `GET` | `/api/recipes/{id}` | One recipe + ingredients | `200 {"recipe":{…}}` | `404` |
| `GET` | `/api/recipes/{id}/preview` | Trimmed hover-preview payload | `200 {"preview":{…}}` | `404` |
| `POST` | `/api/recipes` | Create recipe + ingredients | `201 {"recipe":{…}}` | `422` |
| `PUT` | `/api/recipes/{id}` | Update recipe + **replace** ingredients | `200 {"recipe":{…}}` | `422`, `404` |
| `DELETE` | `/api/recipes/{id}` | Delete recipe (ingredients cascade) | `200 {"deleted":true}` | `404` |
| `POST` | `/api/recipes/{id}/send-mail` | E-mail the recipe | `200 {"sent":true}` | `422`, `404` |
| `POST` | `/api/recipes/{id}/image` | Upload/replace hero image (`multipart`) | `200 {"recipe":{…}}` | `422`, `404` |
| `DELETE` | `/api/recipes/{id}/image` | Remove hero image | `200 {"deleted":true}` | `404` |
| `GET` | `/api/recipes/{recipeId}/notes` | List notes (newest first) | `200 {"notes":[…]}` | `404` |
| `POST` | `/api/recipes/{recipeId}/notes` | Add a note | `201 {"note":{…}}` | `422`, `404` |
| `DELETE` | `/api/notes/{id}` | Delete a note | `200 {"deleted":true}` | `404` |

**List query parameters** (`GET /api/recipes`)

| Param | Values | Default | Notes |
|---|---|---|---|
| `search` | free text | — | case-insensitive `LIKE` on the title |
| `sort` | `title` \| `created` | `created` | column is whitelisted (SQL-injection safe) |
| `direction` | `ASC` \| `DESC` | `DESC` | — |

**Recipe request body** (`POST` / `PUT`)

```json
{
  "title": "Spaghetti Carbonara",
  "description": "Cook, combine, serve.",
  "temperature": null,
  "duration": 25,
  "ingredients": [
    { "name": "Spaghetti", "amount": 400, "unit": "g" },
    { "name": "Guanciale", "amount": 150, "unit": "g" }
  ]
}
```

Validation: `title` is required (≤ 255 chars); `temperature` 0–500 and `duration`
0–1440 are optional; each ingredient needs `name`, `amount` and `unit`. Out-of-range
or missing values come back as `422 {"errors": …}`.

**Image upload** (`POST /api/recipes/{id}/image`)

`multipart/form-data` with a single `image` field. Accepts JPEG, PNG or WebP up to
**5 MB**; otherwise `422 {"errors":{"image":["…"]}}`.

### Examples

```bash
# List, searched + sorted
curl 'http://localhost:8080/api/recipes?search=beef&sort=title&direction=ASC'

# Create a recipe
curl -X POST http://localhost:8080/api/recipes \
  -H 'Content-Type: application/json' \
  -d '{"title":"Avocado Toast","duration":10,"ingredients":[{"name":"Bread","amount":2,"unit":"slice"}]}'

# Update (replaces ingredients)
curl -X PUT http://localhost:8080/api/recipes/8 \
  -H 'Content-Type: application/json' \
  -d '{"title":"Beef Stew","duration":150,"temperature":160,"ingredients":[{"name":"Beef","amount":800,"unit":"g"}]}'

# Upload a photo
curl -X POST http://localhost:8080/api/recipes/8/image -F 'image=@stew.jpg'

# Share by e-mail (captured by Mailpit at http://localhost:8025)
curl -X POST http://localhost:8080/api/recipes/8/send-mail \
  -H 'Content-Type: application/json' -d '{"email":"friend@example.com"}'

# Add a note
curl -X POST http://localhost:8080/api/recipes/8/notes \
  -H 'Content-Type: application/json' -d '{"author":"Sam","body":"Add a bay leaf."}'
```

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

# 2. Build and start everything (MySQL, PHP-FPM, the API nginx, the SPA, Mailpit)
docker compose up -d --build
#    On first start the API container automatically applies the migrations and
#    seeds a set of demo recipes — no manual database step needed.

# 3. Open the app — a single URL, SPA + proxied API:
#    http://localhost:8080
#    Captured e-mails (Mailpit):  http://localhost:8025
```

> The seed runs once on a fresh database (tracked in `cake_seeds`), so recipes you
> create later are preserved across restarts. To start from clean demo data again,
> run `docker compose down -v && docker compose up -d`.

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
cd frontend && npm test -- --watch=false --browsers=ChromeHeadless   # 53 specs

# Cross-browser smoke test of all core flows in Firefox + Chromium
cd frontend && npm run e2e                        # requires the app running
```

The frontend specs cover the recipe list, detail, create/edit form, the
`ThemeService` (persistence + system-preference fallback), and the
`RecipeFilterService` (duration / ingredient buckets and the search-preserving
navigation). The backend specs cover the controllers, the recipe model and the
mailer.

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
| Frontend | **Angular 20 + Bootstrap 5.3** | Required stack. Standalone components + signals (the modern Angular default). |
| Theming | **Bootstrap `--bs-*` CSS variables + a token layer** | One source of truth themes every component in dark *and* light without per-component overrides; a second theme is a variable swap, not a re-style. |
| Dev environment | **Docker Compose** | Reproducible, version-exact (PHP 8.3 pinned even though the host runs a different version). |
| `ingredients.amount` | **`DECIMAL(8,2)`** | Exact fixed-point values — no float rounding; supports fractional amounts (`1.5 l`). Validation bounds it to the column range so an out-of-range value is a clean 422, not a DB 500. |
| `ingredients.unit` | **`VARCHAR`** (free text) | A new unit needs no migration, unlike an `ENUM`. |
| Foreign key | **`ON DELETE CASCADE`** | Ingredients (and notes) have no meaning without their recipe. |
| Sorting & search | **Server-side via the ORM** | Works across the whole dataset; sort columns are whitelisted (a column name can't be a bound parameter → SQL-injection safety). |
| Duration / ingredient filters | **Client-side** over the loaded list | No new API surface; instant feedback. Search & sort stay server-side. |
| Search input | **`debounceTime(300)` + `switchMap`** | One request per pause in typing; `switchMap` cancels stale requests so a slow earlier response never overwrites a newer one. |
| Hover preview | **`switchMap` + cache + dedicated `/preview` endpoint** | The centrepiece. Debounce avoids requests for titles merely passed over; `switchMap` cancels superseded requests; a `Map` cache means re-hovering makes no second request; the dedicated endpoint keeps the high-frequency payload small. |
| CORS | **Outermost middleware** | So error responses (404/400/500) also carry CORS headers — otherwise the browser blocks them cross-origin. Only needed for the dev workflow; the container is single-origin. |
| Deployment | **Single origin** — one nginx serves the SPA and proxies `/api` | One URL, no CORS in production. The API lives under `/api` so client routes (`/recipes/5`) and API endpoints (`/api/recipes/5`) never collide; deep-link refresh works via `try_files … /index.html`. |
| E-mail transport | **Env-driven (Mailpit in dev)** | Verifiable in dev without a real mail server; a `.env` switch enables real SMTP in production. |

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
app uses only standard web APIs (no engine-specific code), supports dark and light
themes, and is responsive down to a 375 px (mobile) viewport (the sidebar collapses
to a horizontal filter bar below the `lg` breakpoint).

---

## Project layout

```
api/         CakePHP 5 JSON API (controllers, models, migrations, mailer, tests)
frontend/    Angular SPA (components, services, models, specs, e2e/)
docker/      nginx + PHP-FPM images and MySQL init
docs/        issues/ (the plan) · implementation/ (the build log)
             superpowers/ (UI redesign design spec + implementation plan)
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
