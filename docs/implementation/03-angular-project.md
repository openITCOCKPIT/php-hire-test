# Implementation Log — #3 Angular project

**Issue:** [docs/issues/03-angular-project.md](../issues/03-angular-project.md)
**Status:** ✅ done · **Date:** 2026-06-17

---

## What was built

```
frontend/                              # Angular 20.3 (standalone), TypeScript
frontend/src/environments/             # environment.ts (+ .development.ts) with apiBaseUrl
frontend/src/app/services/status.service.ts   # GET {apiBaseUrl}/status
frontend/src/app/app.ts / app.html     # root component: shows live API status
frontend/src/app/app.config.ts         # provideHttpClient()
frontend/angular.json                  # Bootstrap CSS + JS, env fileReplacements
```

## Decisions made during implementation, and why

### 1. Angular 20, not the latest 22 (host Node constraint)
The latest Angular CLI (22) requires Node ≥ 22.22.3; the host has 22.17.0, so
`ng new` refused to run. Rather than upgrade the user's **global** Node (a system
change made without asking), the CLI was pinned to **Angular 20**, which runs on
Node 22.17 and is a current major release that fully satisfies the brief
(TypeScript, Bootstrap 5, modern Angular). The reviewer's Ubuntu 26.04 ships a
newer Node, so they can use any recent Angular. Documented so the version choice
is not mistaken for using something outdated.

### 2. Standalone components, not NgModules (deviation from the spec)
Issue #3's spec leaned *tentatively* toward NgModule-based code "for reviewer
clarity". Current Angular (17+) defaults to standalone components and the
scaffold no longer produces an `AppModule`. Fighting that default would add
complexity for no real benefit, and the strongest reference submission to this
challenge also used standalone. So this implementation uses **standalone**
(the modern default). This consciously overrides the spec's tentative lean.

### 3. Frontend dev server on the host; backend in Docker
The API stack is containerised (#1); the Angular dev server runs on host Node
via `npm start`. A containerised API plus a local SPA dev server is a standard,
pragmatic split — it avoids slow bind-mount file-watching for the frontend while
keeping the backend reproducible. A frontend container could be added later if
full `docker compose up` parity is wanted; noted as a deliberate trade-off.

### 4. API base URL via Angular environment files
`environment.ts` (default/prod) and `environment.development.ts` (dev) hold
`apiBaseUrl`, swapped by the `fileReplacements` entry in `angular.json`. This is
the Angular-idiomatic config split. Both currently point at
`http://localhost:8765` (no production deployment yet); the prod value changes at
deploy time without touching code. A runtime-fetched config was rejected as
over-engineering for this scope.

### 5. Bootstrap 5 via npm, wired in angular.json
Bootstrap's CSS and the JS **bundle** (includes Popper, needed for popovers in
#12 and modals in #9/#13) are added through `angular.json` `styles`/`scripts`,
installed from npm rather than a CDN — so versions are pinned and there is no
external network dependency. The build output confirms both are bundled
(styles.css 277 kB, scripts.js 108 kB).

### 6. A `StatusService` proves the cross-origin contract early
Instead of calling `HttpClient` from the component, a `StatusService` abstracts
the call (the pattern every feature service will follow in #7+). The root
component subscribes on init and renders a Bootstrap alert reflecting the result,
which is what verifies CORS end to end in a real browser.

## Deviations / notes

- **npm blocks lifecycle scripts** here (an "allow-scripts" warning on install).
  It did not affect the build — `esbuild` worked and `ng build` succeeded — so no
  action was needed.
- Root `.gitignore` was trimmed again: `frontend/` ships its own `.gitignore`
  (node_modules, dist, .angular/cache), mirroring how `api/` owns its ignores.

## Verification

```
$ ng build --configuration development     # → bundle built, Bootstrap CSS+JS included
$ ng test --watch=false --browsers=ChromeHeadless   # → 4 specs SUCCESS

Browser (Playwright against ng serve :4200 + Docker API :8765):
  - page renders "Recipe Collection" and the success alert
  - GET http://localhost:8765/status → 200 OK (cross-origin)
  - 0 console errors → no CORS errors
```

The end-to-end frontend↔backend slice is proven: the Angular SPA on :4200 calls
the CakePHP API on :8765 across origins with CORS working.

## Notes carried into #7+

- `RecipeService` will follow the `StatusService` pattern (inject HttpClient,
  read `environment.apiBaseUrl`, return typed Observables).
- Routing is wired but empty (`app.routes.ts`); `RecipeListComponent` will take
  the `/` route in #7, with `<router-outlet>` already in place.
