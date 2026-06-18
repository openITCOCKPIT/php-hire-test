# #18 — Containerise the frontend (single origin)

**Epic:** F — Post-review enrichment
**Feature reference:** — (infra; matches competitor PR #5's frontend Docker)
**Effort:** 2 h
**Dependencies:** #1, #3
**Status:** ✅ done

## Goal

Serve the built Angular SPA and the API from a **single origin** in a container,
so the whole app runs from one URL with no CORS — closing the deployment gap
competitor PR #5 had.

## Description

- A multi-stage `frontend` image (node build → nginx) serves the production SPA
  and **proxies `/api`** to the backend nginx.
- All API routes move under an **`/api`** prefix so the Angular client routes
  (`/recipes/5`) and API endpoints (`/api/recipes/5`) no longer collide.
- The frontend container is exposed on `:8080` — the single URL for the app. The
  dev workflow (ng serve `:4200` → `:8765/api`) still works.

## Rationale / Decisions

**Why the `/api` prefix?** For a single origin, nginx serves the SPA at `/` and
must distinguish API calls from client routes. Without a prefix, `/recipes/5` is
ambiguous (Angular detail route vs API endpoint), which breaks deep-link refresh.
Prefixing the API with `/api` removes the ambiguity cleanly; the frontend only
needed an `apiBaseUrl` change (`/api` in prod, `http://localhost:8765/api` in dev).

**Why a separate frontend nginx that proxies to the backend nginx (not one
nginx)?** It keeps the backend image unchanged and the two concerns separate; the
frontend nginx just does static serving + a `/api` proxy. The cost is one extra
container — acceptable.

**Why keep the dev cross-origin workflow?** `ng serve` gives live reload during
development. It runs cross-origin (`:4200` → `:8765/api`), which is why the CORS
middleware stays; in the container everything is same-origin so CORS is moot.

## Definition of Done

- [x] `docker compose up --build` serves the whole app at `http://localhost:8080`
- [x] `:8080/api/recipes` returns JSON (proxied, same origin → no CORS)
- [x] Deep link `:8080/recipes/1` (and refresh) renders the SPA, not the API
- [x] API routes moved under `/api`; backend tests updated; dev `ng serve` still works
- [x] All features verified in the container (incl. hover preview), 0 console errors

**Verification (2026-06-18):** container app on `:8080` browser-verified (list,
hover preview, detail deep-link, badges, edit/delete buttons), API at `:8080/api/*`
same-origin; 43 backend + 30 frontend tests green; cross-browser e2e green (dev).
