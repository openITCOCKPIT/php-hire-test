# #10 — Sorting (Feature 4)

**Epic:** D — Advanced Features
**Feature reference:** Feature 4 (Sort the list of recipes)
**Effort:** 1–2 h
**Dependencies:** #5, #7
**Status:** ⬜ open

## Goal

Add server-side sorting to `GET /recipes` via a `?sort` query parameter and expose a sort control in the Angular list view — letting users reorder recipes by title or creation date without page reload.

## Description

**Backend (`RecipesController::index()`):**
1. Read query param: `?sort=title` or `?sort=created` (default: `created DESC`).
2. Map the param to a safe ORM `order()` clause:
   ```php
   $allowedSorts = ['title' => 'Recipes.title', 'created' => 'Recipes.created'];
   $sortField = $allowedSorts[$this->request->getQuery('sort')] ?? 'Recipes.created';
   $direction = strtoupper($this->request->getQuery('direction', 'DESC')) === 'ASC' ? 'ASC' : 'DESC';
   $query = $this->Recipes->find()->contain(['Ingredients'])->orderBy([$sortField => $direction]);
   ```
3. Return sorted results with the same JSON structure as before.

**Frontend (`RecipeListComponent`):**
1. Add sort state: `sortField: 'title' | 'created' = 'created'` and `sortDirection: 'ASC' | 'DESC' = 'DESC'`.
2. Add sort controls — either clickable column headers (if using a table layout) or a Bootstrap dropdown button:
   - "Sort by Title ↑/↓"
   - "Sort by Date ↑/↓"
3. On sort change: update `sortField`/`sortDirection` and call `recipeService.getRecipes({ sort: ..., direction: ... })`.
4. Pass params to `RecipeService.getRecipes()` which appends them as `HttpParams`.
5. Visual indicator on the active sort column/option (Bootstrap active class, arrow icon).

## Technical Notes

- Whitelist the allowed sort fields server-side (`$allowedSorts` map) — never pass the raw query string to `orderBy()`. SQL injection via `?sort=title; DROP TABLE recipes` must be impossible.
- `RecipeQueryParams` interface (stubbed in #7) now gets populated:
  ```typescript
  interface RecipeQueryParams { sort?: 'title' | 'created'; direction?: 'ASC' | 'DESC'; }
  ```
- Combine sort + search params in #11 — design `getRecipes(params)` to merge all params into one `HttpParams` object.

## Rationale / Decisions

**Why server-side sorting instead of client-side?**
- Client-side sorting requires all recipes to be loaded upfront. With pagination (foreseeable future) or a large dataset, the client would not have all records to sort.
- Server-side sorting uses the MySQL index on `title` and `created` — O(log n) instead of O(n log n) in JavaScript.
- Consistency: search (#11) is also server-side. Mixing client-side sort with server-side search leads to incorrect results (e.g., you search for "chocolate", get 3 results, and then "sort" only those 3 — but the server might have more matching records on the next page).
- Accepted trade-off: each sort change triggers an HTTP request (slight latency vs. instant client-side re-sort). Mitigated by caching in #12 and the small data set.

**Why whitelist `$allowedSorts` instead of passing the query param directly?**
The `orderBy()` clause is SQL. Passing an unsanitised string to it is a SQL injection vector. Even with CakePHP's ORM, `->orderBy([$userInput => 'ASC'])` would execute `ORDER BY <user input> ASC` — a column name is not parameterised. The whitelist is the simplest, most explicit protection.

**Why support both `sort` and `direction` params?**
A single `sort=title_asc` / `sort=title_desc` enum string was considered. Separate params (`sort=title&direction=ASC`) are more conventional (REST APIs typically separate field and direction), and the frontend sort toggle only needs to flip `direction` without rebuilding the `sort` param.

**Why a dropdown button instead of clickable column headers?**
The list view uses Bootstrap cards (from #7), not a table. Cards have no natural "column headers" to click. A dropdown is the appropriate sort control for a card grid. If the layout switches to a table (possible refactor in #14), clickable headers would be the natural upgrade path.

## Definition of Done

- [ ] `GET /recipes?sort=title&direction=ASC` returns recipes alphabetically (A → Z)
- [ ] `GET /recipes?sort=created&direction=DESC` returns newest first
- [ ] Unknown `sort` param (e.g. `?sort=injected_field`) defaults to `created DESC` without error
- [ ] Angular UI shows a sort control; selecting a sort option reloads the list in the correct order
- [ ] Active sort option is visually indicated
- [ ] SQL injection attempt via sort param does not cause an error or data leak (verified manually)
