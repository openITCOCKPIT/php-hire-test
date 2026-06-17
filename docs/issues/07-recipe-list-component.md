# #7 — RecipeService & display list (Feature 1)

**Epic:** C — Frontend Core Functions
**Feature reference:** Feature 1 (Browse through existing recipes)
**Effort:** 2 h
**Dependencies:** #5, #3
**Status:** ✅ done

## Goal

Create the Angular `RecipeService` as the single HTTP abstraction layer and the `RecipeListComponent` that renders the recipe list as Bootstrap cards — making the app useful for the first time after the MVP milestone is reached.

## Description

1. Generate service and component:
   ```
   ng generate service services/recipe
   ng generate component components/recipe-list
   ```
2. **`RecipeService`** (`src/app/services/recipe.service.ts`):
   - Inject `HttpClient` and `environment.apiBaseUrl`
   - Method `getRecipes(params?: RecipeQueryParams): Observable<RecipeListResponse>` — calls `GET /recipes` with optional query params (reserved for sort/search in #10/#11)
   - Method `getRecipe(id: number): Observable<Recipe>` — calls `GET /recipes/{id}`
   - Define TypeScript interfaces for `Recipe` and `Ingredient`:
     ```typescript
     interface Ingredient { id: number; name: string; amount: string; unit: string; }
     interface Recipe { id: number; title: string; description: string; created: string; ingredients: Ingredient[]; }
     ```
3. **`RecipeListComponent`** (`src/app/components/recipe-list/`):
   - Call `recipeService.getRecipes()` in `ngOnInit()`
   - Display recipes as Bootstrap cards (title, created date, ingredient count or first ingredient summary)
   - Wire the component to the default route `/` in `AppRoutingModule`
   - Add a "New Recipe" button linking to `/recipes/new` (route placeholder, component built in #9)
4. Format the `created` date using Angular's `DatePipe` (`'dd.MM.yyyy'` — matching the German date format in the example: "15.06.2026").

## Technical Notes

- The `RecipeQueryParams` interface (even if empty now) prevents a breaking refactor when sort (#10) and search (#11) params are added.
- `async` pipe in the template is preferred over manual `.subscribe()` — it handles unsubscription automatically.
- The `created` field arrives as an ISO 8601 string from CakePHP; Angular's `DatePipe` parses this automatically.

## Rationale / Decisions

**Why a dedicated `RecipeService` instead of calling `HttpClient` directly in the component?**
Separating HTTP logic from display logic is the Angular pattern (equivalent to the Repository pattern in backend development). Benefits:
1. The service can be injected into multiple components (list, detail, form) without code duplication.
2. HTTP logic is testable in isolation via service unit tests.
3. The component template stays declarative — no `http.get(...)` noise.

Putting HTTP calls directly in the component was rejected because it couples transport and presentation, making both harder to test and change.

**Why Bootstrap cards instead of a table for the list view?**
Cards are visually richer, more scannable for a recipe app (recipe = a named thing with a preview), and responsive by default via Bootstrap's grid. A table would be appropriate for dense, comparison-oriented data (monitoring dashboards, server lists — AVENDIS's domain), but recipes are browsed, not compared row-by-row. Pragmatism: `div.row > div.col-md-4 > div.card` takes the same time to write as a `table`.

**Why `DatePipe('dd.MM.yyyy')` format?**
The task example explicitly shows "15.06.2026" (German date format). Angular's `DatePipe` with locale `de` produces this automatically, or we can hardcode `'dd.MM.yyyy'` as the format string to avoid adding locale configuration. Accepted trade-off: the app is not fully internationalised, but it matches the format the reviewer expects.

**Why define TypeScript interfaces at this stage and not later?**
Type definitions are cheapest to write when the API shape is first consumed. Writing them now means `RecipeService`, `RecipeListComponent`, `RecipeDetailComponent`, and `RecipeFormComponent` all share the same `Recipe` type — a single source of truth. Deferring types to later means refactoring all call sites.

## Definition of Done

- [x] `RecipeService` compiles without TypeScript errors
- [x] `RecipeList` displays the chocolate-cake recipe (from the DB seed) as a Bootstrap card
- [x] Route `/` renders `RecipeList`
- [x] "New Recipe" button is visible and links to `/recipes/new` (route built in #9)
- [x] `created` date displays in `dd.MM.yyyy` format
- [x] No leaking subscription (see deviation below)

> **Deviation:** the spec suggested the `async` pipe. This uses **signals**
> (`recipes`, `state`) with a single `getRecipes()` subscription instead — the
> modern Angular pattern, and equally leak-free (HttpClient observables complete
> after one emission). Signals also drive the loading/error/empty states cleanly.

## Tests

- [x] **Jasmine/Karma (8 specs):** `RecipeService` asserts `getRecipes()`/`getRecipe()` call the right URLs, map the envelope, and forward sort/search params; `RecipeList` asserts a card renders with `dd.MM.yyyy`, plus the empty and error states; the shell renders the navbar brand.

**Verification (2026-06-17):** browser-verified via Playwright — chocolate-cake
card with date `15.06.2026` and "5 ingredients", `GET /recipes` 200, 0 console
errors. **MVP milestone reached.**
