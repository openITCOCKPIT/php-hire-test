# #8 — Detail view

**Epic:** C — Frontend Core Functions
**Feature reference:** Feature 1 (Browse through existing recipes — full view)
**Effort:** 1–2 h
**Dependencies:** #7
**Status:** ⬜ open

## Goal

Create the `RecipeDetailComponent` that shows a single recipe's full information — title, description, created date, and the complete ingredient list — so users can navigate from the list to a dedicated recipe page.

## Description

1. Generate component:
   ```
   ng generate component components/recipe-detail
   ```
2. Register the route in `AppRoutingModule`:
   ```typescript
   { path: 'recipes/:id', component: RecipeDetailComponent }
   ```
3. In `RecipeDetailComponent`:
   - Inject `ActivatedRoute` and `RecipeService`
   - Extract `id` from route params in `ngOnInit()`
   - Call `recipeService.getRecipe(id)` and store the result
   - Display: title (h1), created date (DatePipe `'dd.MM.yyyy'`), description (paragraph), ingredients as a formatted list (`<ul>` with `amount + unit + name` per row, e.g. "100g sugar")
4. Add a "← Back to list" navigation link.
5. Handle the 404 case: if the API returns an error, show a user-friendly "Recipe not found" message (no bare error stack traces in the UI).
6. In `RecipeListComponent`, make each recipe card title a `routerLink` to `/recipes/:id`.

## Technical Notes

- Use `ActivatedRoute.paramMap` (Observable) rather than `ActivatedRoute.snapshot.paramMap` so the component reacts if the user navigates directly from one detail page to another without destroying/recreating the component.
- The ingredient display format `"amount unit name"` (e.g. "100 g sugar") should use the `amount` as-is from the API string (DECIMAL is already formatted to 2 decimal places); consider stripping trailing `.00` with a simple pipe or `parseFloat()` for cleaner display.
- The hover preview (#12) will later show a compressed version of this same data — keeping the template modular (extract an `IngredientListComponent` or use `ng-template`) helps reuse.

## Rationale / Decisions

**Why a dedicated detail route (`/recipes/:id`) instead of an expandable row in the list?**
- A dedicated route is deep-linkable (shareable URL).
- Browser back navigation works naturally.
- The spec mentions a hover preview (#12) which is distinct from the detail view — having both means the detail page and the hover preview serve different UX purposes (full detail vs. quick glance).
An expandable accordion row was considered; rejected because it mixes the list and detail concerns in one component, and deep-linking would not work.

**Why `ActivatedRoute.paramMap` (Observable) over `snapshot`?**
Using `snapshot` only reads the route parameter once, at component initialisation. If Angular reuses the component instance (e.g., navigating from `/recipes/1` to `/recipes/2`), `snapshot` would still show id `1`. The Observable approach reacts to every param change. The trade-off is a slightly more complex subscription setup — managed cleanly with `takeUntilDestroyed()` (Angular 16+) or `takeUntil(destroy$)`.

**Why show a "Recipe not found" message instead of redirecting to `/`?**
A redirect silently loses context: the user typed or clicked a URL that doesn't exist, and a redirect to the home page gives them no information about what went wrong. An inline error message ("No recipe found with id 99") is more honest and aligns with the "make it user friendly" requirement (#14). The alternative (redirect) would be appropriate if the not-found state indicated a broken link the user should not have followed.

**Why not show the full ingredient list in the recipe card (list view)?**
Cards in the list view should be scannable — showing every ingredient would make cards tall and visually dense. The card shows a summary (ingredient count or first ingredient). Full details belong on the detail page. This is a standard progressive disclosure pattern.

## Definition of Done

- [ ] Route `/recipes/1` renders the chocolate-cake detail page with title, description, date, and all 5 ingredients
- [ ] Ingredient format is `"100g sugar"` / `"50g flour"` etc. (amount + unit + name)
- [ ] `created` date renders in `dd.MM.yyyy` format
- [ ] "← Back to list" link navigates to `/`
- [ ] `/recipes/9999` shows a "Recipe not found" message (not a blank page or console error)
- [ ] Recipe cards in the list view link to the correct detail route

## Tests

- [ ] **Jasmine/Karma:** `RecipeDetailComponent` spec loads a recipe by route param (mocked `ActivatedRoute`) and renders the ingredient list; a not-found (404) response renders the "Recipe not found" message instead of throwing.
