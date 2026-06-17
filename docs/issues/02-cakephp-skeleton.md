# #2 — Initialise CakePHP skeleton

**Epic:** A — Project Setup & Infrastructure
**Feature reference:** —
**Effort:** 1 h
**Dependencies:** #1
**Status:** ⬜ open

## Goal

Install CakePHP 5.x in API-only mode, wire it to the MySQL database, and expose a `GET /status` health-check endpoint — giving all later backend issues a fully working PHP/DB foundation.

## Description

1. Run `composer create-project cakephp/app:^5 api --prefer-dist` inside the project root (or configure an existing skeleton from #1).
2. Configure `config/app_local.php` with the MySQL 8.0 connection (host, port, database name, user, password — values from `.env` or Docker Compose environment variables).
3. Enable CORS middleware for `http://localhost:4200` (the Angular dev server) in `config/app.php`.
4. Register a simple route in `config/routes.php`:
   ```php
   $routes->connect('/status', ['controller' => 'Status', 'action' => 'index']);
   ```
5. Create `src/Controller/StatusController.php` returning `{"status":"ok"}` as JSON.
6. Confirm the endpoint with `curl http://localhost:8765/status` (or nginx equivalent).
7. Add `.env.example` documenting the expected environment variables; add `.env` to `.gitignore`.

## Technical Notes

- Use CakePHP's built-in `$this->response->withType('application/json')` pattern or extend `AppController` with `$this->viewBuilder()->setClassName('Json')` to establish the JSON-only convention for all subsequent controllers.
- The `CorsMiddleware` must allow `Content-Type`, `Authorization`, and `X-Requested-With` headers — Angular's `HttpClient` sends these.
- MySQL 8.0 uses `caching_sha2_password` by default; if the CakePHP MySQL driver complains, set `'flags' => [PDO::MYSQL_ATTR_SSL_VERIFY_SERVER_CERT => false]` or create the DB user with `mysql_native_password` as a fallback.

## Rationale / Decisions

**Why API-only mode (no Bake templates, no Twig views)?**
CakePHP can serve traditional server-rendered HTML or act as a pure JSON API. Since the frontend is Angular (a separate SPA), the backend only ever needs to speak JSON. API-only mode removes view boilerplate, enforces JSON responses at the framework level, and aligns with the "We love JSON" hint in the task. A hybrid approach (CakePHP views + Angular for some parts) was considered and rejected because it would create two rendering paths to maintain.

**Why a `/status` endpoint before any feature code?**
A health-check route proves that routing, middleware, and the DB connection all work before any domain logic is written. It also gives the Angular app (#3) a safe, low-risk target to verify CORS. The alternative — jumping straight to `/recipes` — risks mixing infrastructure problems with application bugs.

**Why `.env` for credentials and not hardcoded `app_local.php`?**
CakePHP 5.x ships with dotenv support. Storing credentials in `.env` (excluded from git) prevents accidental credential commits and mirrors production practice (Docker Compose passes secrets as env vars). `app_local.php` hardcoded values were rejected because they would expose credentials in git history.

**CORS approach:** Adding `CorsMiddleware` directly in `Application.php` middleware stack (not via a separate package) keeps dependencies minimal. The alternative, `mwhite/cakephp-cors`, was considered but rejected to avoid an extra dependency for a single config value.

## Definition of Done

- [ ] `GET /status` returns HTTP 200 with body `{"status":"ok"}`
- [ ] MySQL connection is confirmed (CakePHP does not error on startup)
- [ ] CORS headers present for `http://localhost:4200` on all API responses
- [ ] `.env.example` committed, `.env` excluded via `.gitignore`
- [ ] No hardcoded credentials in any committed file

## Tests

- [ ] **PHPUnit:** the test runner itself executes (`vendor/bin/phpunit` green on the skeleton) — establishes the backend test harness before any feature code.
- [ ] An integration test hits `GET /status` and asserts HTTP 200 + body `{"status":"ok"}` — the first real test in the suite.
