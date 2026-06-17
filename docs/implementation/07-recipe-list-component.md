# Implementation Log — #7 RecipeService & display list (MVP)

**Issue:** [docs/issues/07-recipe-list-component.md](../issues/07-recipe-list-component.md)
**Status:** ✅ done · **Date:** 2026-06-17 · **Milestone:** MVP reached

---

## What was built

```
frontend/src/app/models/recipe.ts                       # Recipe/Ingredient/params types
frontend/src/app/services/recipe.service.ts             # getRecipes/getRecipe/createRecipe
frontend/src/app/components/recipe-list/recipe-list.*    # Bootstrap card list + states
frontend/src/app/app.ts / app.html                      # shell: navbar + router-outlet
frontend/src/app/app.routes.ts                          # '' -> RecipeList
+ specs for the service, the list component, and the shell
```

## Decisions made during implementation, and why

### 1. `RecipeService` is the single HTTP layer
Components never touch `HttpClient` directly. The service exposes typed
`Observable<Recipe[]>` / `Observable<Recipe>` and **unwraps** the API envelope
(`{recipes: […]}` → `Recipe[]`, `{recipe: …}` → `Recipe`) with `map`, so the
wrapper shape stays an API detail and components work with plain domain types.

### 2. Types defined now, shared everywhere
`Recipe`, `Ingredient`, `RecipeQueryParams`, `NewRecipe` live in one models file.
`amount` is typed as `string` (decimal string from DECIMAL(8,2)). `RecipeQueryParams`
already carries `sort`/`direction`/`search` so #10/#11 add no new service signature.

### 3. The root component became an app shell
The #3 status-banner logic was removed (it was only the CORS smoke test) and the
root component is now a navbar + `<router-outlet>`. The orphaned `StatusService`
was deleted. `RecipeList` owns the `/` route.

### 4. Bootstrap cards with explicit load states
The list renders as responsive cards (`col-12 col-md-6 col-lg-4`). The component
holds a `state` signal (`loading | loaded | error`) and renders, respectively, a
spinner, the cards (or an empty-state CTA), or an error alert with a Retry
button. Building the three states now (rather than in #14) keeps the MVP honest —
the list never shows a blank screen.

### 5. Signals over manual subscribe bookkeeping
`recipes` and `state` are signals; the template reads `recipes()` / `state()`.
The single `getRecipes()` subscription completes on its own (HttpClient
observables complete after one emission), so no manual teardown is needed here.

### 6. Date format `dd.MM.yyyy`
`{{ recipe.created | date: 'dd.MM.yyyy' }}` matches the brief's "15.06.2026"
example without adding locale config.

## Verification

```
ng build --configuration development   # green, Bootstrap bundled
ng test --watch=false                  # 8 specs green (service x3, list x3, shell x2)

Browser (Playwright, ng serve :4200 + Docker API :8765):
  - navbar "Recipe Collection", "Recipes" heading, "New Recipe" button
  - chocolate-cake card: title links to /recipes/1, date "15.06.2026", "5 ingredients"
  - GET http://localhost:8765/recipes → 200, 0 console errors
```

The app is now genuinely usable end to end — the **MVP milestone**. From here #8–#13
are independently mergeable.

## Notes carried into #8 / #9

- Card titles already `routerLink` to `/recipes/:id` (#8 builds the detail view).
- "New Recipe" links to `/recipes/new` (#9 builds the form); the route is not
  wired yet, so clicking it currently lands on the empty router-outlet.
- `RecipeService.createRecipe()` is ready for #9.
