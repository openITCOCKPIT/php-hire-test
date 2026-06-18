# Implementation Log — #1 Repository & development environment

**Issue:** [docs/issues/01-repository-setup.md](../issues/01-repository-setup.md)
**Status:** ✅ done · **Date:** 2026-06-17

---

## What was built

```
docker-compose.yml          # nginx + php-fpm 8.3 + mysql 8.0
docker/php/Dockerfile       # PHP 8.3 image with the extensions CakePHP needs
docker/nginx/default.conf   # FastCGI vhost, document root = api/webroot
api/webroot/index.php       # temporary placeholder front controller
.env / .env.example         # environment variables (.env git-ignored)
.gitignore                  # repo-level ignores
README.md                   # setup (Docker + Ubuntu), architecture, browser, MIT
```

The fork and the local `Psheikomaniac` branch already existed from the initial
setup; this issue added the runtime environment and documentation.

## Decisions made during implementation, and why

### 1. Docker Compose over a native macOS install
The host runs PHP 8.5 and only a MariaDB *client* (no MySQL 8 server). A native
setup would have meant installing MySQL 8 via Homebrew and accepting a PHP
version mismatch. Docker Compose instead provisions the **exact** required
versions and runs identically on the reviewer's Ubuntu 26.04 target. The cost —
a Docker dependency — is acceptable because the alternative is non-reproducible.

### 2. PHP version pinned to 8.3, not the host's 8.5
The image is `php:8.3-fpm`. The requirement is "PHP >= 8.3", and the deployment
target is 8.3. Pinning means the evaluation environment sees 8.3 regardless of
what any developer has installed locally — which is the entire reproducibility
argument for containers. 8.5 would *probably* work, but "probably" is not a
guarantee worth shipping.

### 3. PHP extensions chosen for CakePHP 5
`pdo_mysql` (DB driver), `intl` (CakePHP's I18n/validation requires it),
`mbstring` (string handling), `zip` (Composer package extraction). Each needs a
system `-dev` library to compile (`libicu-dev`, `libonig-dev`, `libzip-dev`),
installed in the same `RUN` layer and cleaned up afterwards to keep the image
small. Composer is copied from the official `composer:2` image rather than
piped from a `curl | sh` script — reproducible and tamper-resistant.

### 4. A placeholder front controller that tests the *whole* chain
Issue #1's DoD is "empty app reachable", but a static HTML page would only prove
nginx works. Instead the placeholder `index.php` opens a real `PDO` connection
and runs `SELECT 1`. A single `curl http://localhost:8765` therefore verifies
nginx → PHP-FPM → MySQL end to end and reports the live PHP version. It is
explicitly throwaway code, replaced by CakePHP in #2.

### 5. `depends_on: service_healthy` + a MySQL healthcheck
MySQL's container is "running" several seconds before it actually accepts
connections (first-boot initialisation). Without gating, the first request after
`docker compose up` would intermittently fail with a connection error. The
healthcheck (`mysqladmin ping`) plus `condition: service_healthy` makes PHP wait
until the database is genuinely ready.

### 6. nginx exposed on host port 8765
Chosen deliberately to match the `environment.apiBaseUrl` the Angular app will
use in #3. Picking the port now keeps that later config honest instead of
retrofitting it.

## Deviation from the plan

**MySQL host port moved 3306 → 3307.** A local `mariadbd` already listens on
3306, so the first `docker compose up` failed with `address already in use`.
Rather than stop the host service, only the **host-side** port mapping was
changed to 3307; the container-internal port stays 3306, so the application
config (`DB_HOST=mysql`, `DB_PORT=3306`) is unaffected. This is exactly what
Compose port mappings are for — decoupling host and container ports. Documented
in `.env.example` with the reasoning.

## Verification

```
$ curl http://localhost:8765
HTTP 200
{ "status": "ok", "php": "8.3.31", "database": { "connected": true }, ... }

$ docker compose exec mysql mysql -N -e "SELECT VERSION();"   # → 8.0.46
$ docker compose exec php php -v                              # → PHP 8.3.31
```

All three containers come up cleanly; MySQL reports `healthy`; the HTTP chain and
database connectivity are confirmed in one request.

## Notes carried into #2

- `api/webroot/index.php` is a placeholder — #2 replaces `api/` with the real
  CakePHP 5 skeleton.
- The `DB_*` environment variables are already injected into the `php` service,
  so #2 can wire CakePHP's datasource straight to them with no hardcoding.
- The CakePHP skeleton ships its own `api/.gitignore`; the root `.gitignore`'s
  `/api/*` entries should be trimmed in #2 to avoid double-ignoring the app's
  `tmp/` and `logs/` directory structure.
