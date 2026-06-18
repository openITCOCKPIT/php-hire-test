# #3 — Initialise Angular project

**Epic:** A — Project Setup & Infrastructure
**Feature reference:** —
**Effort:** 1–2 h
**Dependencies:** #2
**Status:** ✅ done

## Goal

Bootstrap the Angular application with Bootstrap 5, configure the API base URL via environment files, and verify that the frontend can successfully call the CakePHP backend — proving the full stack communicates before any feature work begins.

## Description

1. Generate the project: `ng new frontend --routing --style=scss --standalone=false` (or with standalone components — see Rationale).
2. Install Bootstrap 5: `npm install bootstrap@5`.
3. Add Bootstrap CSS + JS to `angular.json` under `styles` and `scripts` (or import in `styles.scss`).
4. Create `src/environments/environment.ts` and `src/environments/environment.prod.ts` with:
   ```typescript
   export const environment = {
     production: false,
     apiBaseUrl: 'http://localhost:8765'
   };
   ```
5. Register `HttpClientModule` in `AppModule` (or provideHttpClient() for standalone).
6. Add a `StatusService` that calls `GET /status` and logs the result to the console on app init.
7. Confirm the Angular dev server starts at `http://localhost:4200` and the browser console shows the `{"status":"ok"}` response without CORS errors.
8. Set up `AppRoutingModule` with an empty default route (placeholder for `RecipeListComponent` from #7).

## Technical Notes

- Proxy configuration (`proxy.conf.json`) is an alternative to CORS headers for dev; since CakePHP's CORS middleware is already set up in #2, the proxy is optional but worth documenting.
- Bootstrap JS requires Popper.js; both are bundled in `bootstrap/dist/js/bootstrap.bundle.min.js` — use the bundle to avoid a separate Popper dependency.
- The `environment.apiBaseUrl` token will be injected into every service via Angular's DI — never hardcode the base URL inside a service.

## Rationale / Decisions

**Why Angular CLI with `--routing`?**
The app will need at minimum three routes: list, detail, and create. Routing is a baseline requirement. Generating without it and adding it manually costs time with no benefit.

**Why NgModule-based vs. standalone components?**
Angular 17+ defaults to standalone. However, standalone components have a slightly steeper learning curve for readers unfamiliar with the new API. Since this is a job-application project judged by AVENDIS PHP developers (not necessarily Angular specialists), the more explicit NgModule approach makes the architecture easier to follow at a glance. Either choice is valid; standalone would be preferred for a greenfield production app in 2025+.

**Why Bootstrap 5 via npm instead of CDN?**
- Tree-shaking: unused CSS can be excluded via custom SCSS imports.
- No external network dependency in the dev environment.
- Consistent version pinning.
CDN is simpler for prototypes but unacceptable for a project under version control because the CDN URL might resolve to a different minor version over time.

**Why `environment.ts` for the API URL?**
The `environment` pattern is the Angular-idiomatic way to separate dev/prod config. Alternatives (a `config.json` fetched at runtime, or an injected token from `APP_INITIALIZER`) are more flexible but significantly more complex for a project of this scope. Accepted trade-off: changing the API URL requires a rebuild (not a config change) — fine for this use case.

## Definition of Done

- [x] `npm start` serves the app at `http://localhost:4200` without errors
- [x] Bootstrap 5 styles are applied (visible in the browser)
- [x] Browser shows the API status from the CakePHP `/status` endpoint
- [x] No CORS errors in the browser console (verified via Playwright)
- [x] `environment.ts` contains `apiBaseUrl` pointing to the backend
- [x] Angular routing is present (`app.routes.ts`) with `<router-outlet>` in place

## Tests

- [x] **Karma/Jasmine:** `ng test --watch=false --browsers=ChromeHeadless` runs green — **4 specs** (app creates, renders title, API-reachable on ok, API-unreachable on error).

**Verification (2026-06-17):** Angular 20.3 (standalone) · `GET :8765/status` →
200 from the SPA on :4200, 0 console errors · Bootstrap CSS+JS bundled · build green.
