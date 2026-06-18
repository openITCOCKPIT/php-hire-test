# Implementation Log — #8 Detail view

**Issue:** [docs/issues/08-recipe-detail-view.md](../issues/08-recipe-detail-view.md)
**Status:** ✅ done · **Date:** 2026-06-17

---

## What was built

```
frontend/src/app/components/recipe-detail/recipe-detail.*   # /recipes/:id page
frontend/src/app/app.routes.ts                              # + recipes/:id route
api/src/Application.php                                      # CORS fix (see below)
api/tests/.../ApplicationTest.php, RecipesControllerTest.php # CORS + order tests
```

## Decisions made during implementation, and why

### 1. `paramMap` (observable) + `switchMap`, not `snapshot`
The component subscribes to `route.paramMap` and `switchMap`s into
`getRecipe(id)`. So navigating directly from `/recipes/1` to `/recipes/2` (Angular
reuses the component) reloads correctly, and `switchMap` cancels a superseded
request. A `snapshot` read would load once and ignore later id changes.

### 2. `takeUntilDestroyed(this.destroyRef)` — explicit DestroyRef
`takeUntilDestroyed()` with no argument only works in an injection context; in
`ngOnInit` it throws `NG0203`. Injecting `DestroyRef` and passing it explicitly
fixes that and ties the subscription to the component lifetime. (Caught by the
unit tests before any browser run.)

### 3. Four states, including a distinct `notfound`
`loading | loaded | notfound | error`. A 404 maps to `notfound` ("No recipe found
with that id.") while any other failure is the generic `error` alert — a 404 is a
normal, expected outcome (bad URL), not a system error, and the user deserves the
honest distinction.

### 4. Ingredient display `"100g sugar"` via `parseFloat`
`formatIngredient()` does `parseFloat("100.00")` → `100`, `"1.50"` → `1.5`, then
`${amount}${unit} ${name}`. This drops the storage-precision trailing zeros for
display without losing the exact stored value.

## Bug found by browser testing — error responses lacked CORS headers

The detail page's 404 path surfaced a real backend bug. `GET /recipes/9999`
returned a JSON 404 **without** `Access-Control-Allow-Origin`, so cross-origin
the browser blocked the response and Angular saw a status-0 network error
(showing the generic `error` state, plus CORS console errors) instead of a 404.

Root cause: `CorsMiddleware` sat **inside** `ErrorHandlerMiddleware`. A thrown
exception (404/400/500) is turned into a response by the error handler, which is
outside CORS — so the header-adding code in `CorsMiddleware` (which runs after
`$handler->handle()` returns) never touched it. Directly-returned responses (200,
and the 422 from `add()`) were fine; only thrown-exception responses were
affected.

Fix: make `CorsMiddleware` the **outermost** middleware (before
`ErrorHandlerMiddleware`), so every response — including error responses —
receives CORS headers on the way out. Verified: `GET /recipes/9999` now carries
`Access-Control-Allow-Origin`, and the detail page shows "No recipe found".
Regression test added (`testErrorResponseCarriesCorsHeader`), and the middleware
order test updated.

> This is exactly the kind of cross-origin error-path defect that unit tests and
> same-origin `curl` miss — the #3 CORS check only exercised a 200 (`/status`).
> The in-browser detail test caught it.

## Verification

```
ng test                          # 11 specs green (detail x3 added)
vendor/bin/phpunit               # 24 tests green (CORS-on-error test added)
curl /recipes/9999 -H Origin:…   # 404 now includes Access-Control-Allow-Origin

Browser (Playwright):
  - /recipes/1 → title, 15.06.2026, "100g sugar"/"2pcs eggs"/…, description (200°C)
  - /recipes/9999 → "No recipe found with that id." (the only console line is the
    browser's own 404 resource log, which is unavoidable and handled gracefully)
```

## Notes carried into #9

- The `recipes/:id` route is in place; `recipes/new` must be added **before** it
  in the routes array (already noted in app.routes.ts) so "new" is not matched as
  an id.
