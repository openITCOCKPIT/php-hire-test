# Implementation Log — #18 Containerise the frontend (single origin)

**Issue:** [docs/issues/18-containerise-frontend.md](../issues/18-containerise-frontend.md)
**Status:** ✅ done · **Date:** 2026-06-18

---

## What was built

```
docker/frontend/Dockerfile     # multi-stage: node build → nginx
docker/frontend/nginx.conf     # serve SPA + proxy /api to the backend
docker-compose.yml             # + frontend service on :8080
api/config/routes.php          # all resources under /api
api/src/Controller/StatusController.php  # index lists /api/* endpoints
frontend/src/environments/*    # apiBaseUrl '/api' (prod) | :8765/api (dev)
api/tests/.../*ControllerTest.php  # request paths → /api/*
README.md                      # single-origin architecture + setup
```

## Decisions / notes

### The `/api` prefix was the crux
For a single origin, the SPA owns `/` and its client routes (`/recipes/5`,
`/recipes/new`, `/recipes/5/edit`). The API also needs `/recipes/5`. They collide.
Moving the API under `/api` resolves it: nginx routes `/api/...` to the backend
and everything else to `index.html`, so a deep-link refresh of `/recipes/5`
serves the SPA (verified: `curl /recipes/1` → `text/html`, `curl /api/recipes/1`
→ JSON).

Done as **two steps**: first the route refactor (with dev `ng serve` and the
cross-browser e2e re-verified green), then the container — so the URL change was
isolated from the infra change. The frontend needed only an `apiBaseUrl` change;
all service calls build on it, so no per-call edits. Backend integration-test
paths were rewritten to `/api/*` (mechanical).

### Single nginx-per-concern
The `frontend` nginx serves the static SPA and `proxy_pass http://nginx` for
`/api/` (the backend nginx, which FastCGI's to PHP-FPM). The backend image is
unchanged. One extra container, clean separation.

### Ports
- `:8080` — the app (single origin, SPA + proxied API). **Open this.**
- `:8765` — backend nginx, kept exposed for the `ng serve` dev workflow.

## Verification

```
docker compose up -d --build frontend
curl :8080/                 # 200 text/html (SPA, "Recipe Collection")
curl :8080/api/recipes      # 200 application/json (proxied)
curl :8080/recipes/1        # 200 text/html (SPA deep link, NOT the API)
Browser (:8080): list, hover preview (/api/recipes/1/preview 200, same origin),
  detail deep-link refresh, badges, edit/delete — 0 console errors, no CORS.

Regression: backend 43 tests green, frontend 30 specs green, e2e Firefox+Chromium
green (dev workflow still cross-origin to :8765/api).
```
