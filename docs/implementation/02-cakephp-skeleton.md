# Implementation Log — #2 CakePHP skeleton & `/status` endpoint

**Issue:** [docs/issues/02-cakephp-skeleton.md](../issues/02-cakephp-skeleton.md)
**Status:** ✅ done · **Date:** 2026-06-17

---

## What was built

```
api/                                  # CakePHP 5.3.6 application skeleton
api/src/Controller/StatusController.php   # GET /status -> {"status":"ok"}
api/src/Middleware/CorsMiddleware.php     # CORS headers + OPTIONS preflight
api/config/routes.php                     # + /status route
api/src/Application.php                    # + CorsMiddleware, - CSRF middleware
docker-compose.yml                         # php service env -> DATABASE_URL etc.
.env / .env.example                        # DATABASE_URL, SECURITY_SALT, CORS_ALLOW_ORIGIN
.gitignore                                 # trimmed (CakePHP owns api/.gitignore)
```

## Decisions made during implementation, and why

### 1. Installed CakePHP inside the PHP container, not on the host
Composer was not available on the host, and the host PHP is 8.5. Running
`composer create-project cakephp/app:^5` **inside the php-fpm container** uses
the container's Composer and PHP 8.3, so the dependency resolution matches the
runtime exactly. The skeleton was installed to a temp directory and copied into
the bind-mounted `api/`, which also cleanly replaced the issue #1 placeholder.

### 2. Database configured via `DATABASE_URL`, not hardcoded credentials
The CakePHP skeleton's `config/app_local.php` already reads
`env('DATABASE_URL', null)` for the default datasource, and a DSN URL overrides
the `localhost`/`my_app` defaults. So the connection is wired by setting a single
`DATABASE_URL` environment variable on the `php` service
(`mysql://recipes:recipes_secret@mysql/recipes`). Secrets live only in `.env`
(git-ignored); the committed `app_local.example.php` and `.env.example` contain
no real credentials. The alternative — editing `app_local.php` with literal
host/user/password — was rejected because `app_local.php` is git-ignored (so it
wouldn't reach the reviewer) and would bake credentials into a file.

### 3. Cookie CSRF middleware removed (the key API-only decision)
The skeleton ships `CsrfProtectionMiddleware`. It was **removed deliberately**:
CSRF protection defends against attacks that abuse *ambient cookie credentials*,
and this API has no session or cookie authentication at all — recipes are public.
The token requirement would, however, block the Angular SPA's cross-origin POST
requests in issues #6/#9. Removing it is the correct choice for a stateless JSON
API. Consequence: the skeleton's two CSRF tests (`testCsrfAppliedError`,
`testCsrfAppliedOk`) test behaviour that no longer exists by design, so they were
removed (not "made to pass") with an explanatory comment in the test file.

### 4. CORS handled by a small custom middleware
Rather than add a third-party package, a ~30-line `CorsMiddleware` sets the
`Access-Control-Allow-*` headers and short-circuits preflight `OPTIONS` requests
with an empty 200 before they reach routing. The allowed origin is env-driven
(`CORS_ALLOW_ORIGIN`, default `http://localhost:4200`) so it is not hardcoded.
It sits right after the error handler so even error responses carry CORS headers.

### 5. `/status` returns JSON directly, independent of the database
`StatusController::index()` builds the JSON response straight from the response
object (no view layer, no serialize step). It intentionally touches nothing else,
so the health check stays green even if MySQL is down — which is what a health
check is for. The DB connection is verified separately (see below).

### 6. Minimal change: the skeleton `Pages` controller was kept
"API-only" fully materialises in #5 when domain controllers return JSON. For #2,
ripping out the default `Pages`/home route would be churn for no benefit, so it
was left in place. Only the `/status` route was added.

## Deviations / notes

- **Transient 502 on first request after `docker compose up`.** The first GET
  fired before the freshly recreated php-fpm worker was ready and returned a
  one-off 502; the immediate retry returned 200. Not a code issue — a startup
  race. Worth knowing for the browser tests later.
- **PHPStan is not installed** by the skeleton (only `phpcs` via
  `cakephp-codesniffer`). `phpstan.neon` ships as a convenience but the binary is
  not a default dependency, so static analysis here means phpcs. Adding PHPStan
  was treated as out of scope for #2.
- Root `.gitignore` was trimmed: the CakePHP app ships its own `api/.gitignore`
  that already ignores `vendor/`, `tmp/*`, `logs/*` and `config/app_local.php`.

## Verification

```
$ curl -s http://localhost:8765/status                 # → {"status":"ok"}, 200, application/json, CORS headers
$ docker compose exec php php bin/cake.php migrations status   # → connects to MySQL, "no migrations"
$ docker compose exec php vendor/bin/phpunit           # → OK, 9 tests, 25 assertions
$ docker compose exec php vendor/bin/phpcs <files>     # → no violations
```

## Notes carried into #4 / #5

- Migrations are next (#4): `bin/cake bake migration` against the connected DB.
- The PHPUnit `test` connection still defaults to SQLite (`DATABASE_TEST_URL`).
  When DB-backed tests arrive (#5+), point it at a dedicated MySQL test database
  so the tests exercise the same engine and data types (DECIMAL etc.) as prod.
