# #5 — Recipe read API (list & detail)

**Epic:** B — Data Model & API Foundation
**Feature reference:** Feature 1 (Browse through existing recipes)
**Effort:** 2 h
**Dependencies:** #4
**Status:** ⬜ open

## Goal

Expose `GET /recipes` and `GET /recipes/{id}` as JSON endpoints with nested ingredients, giving the Angular frontend all it needs to display the recipe collection without any filter or sort logic yet.

## Description

1. Generate CakePHP models and controllers:
   ```
   bin/cake bake model Recipes
   bin/cake bake model Ingredients
   bin/cake bake controller Recipes --no-actions
   ```
2. Define the `hasMany` association in `RecipesTable`:
   ```php
   $this->hasMany('Ingredients', [
       'foreignKey' => 'recipe_id',
       'dependent' => true,
   ]);
   ```
3. Implement `RecipesController::index()`:
   - `GET /recipes` → all recipes, each with nested `ingredients` array
   - Response shape:
     ```json
     {
       "recipes": [
         {
           "id": 1,
           "title": "Chocolate cake",
           "description": "Bake it at 200°C for 40 minutes.",
           "created": "2026-06-15T00:00:00+00:00",
           "ingredients": [
             { "id": 1, "recipe_id": 1, "name": "sugar", "amount": "100.00", "unit": "g" }
           ]
         }
       ]
     }
     ```
4. Implement `RecipesController::view($id)`:
   - `GET /recipes/{id}` → single recipe with nested ingredients
   - Return HTTP 404 with `{"error":"Not Found"}` if the recipe does not exist.
5. Register routes in `config/routes.php` under `/api` prefix or directly (decide and document).
6. Test both endpoints with `curl` and confirm the JSON structure.

## Technical Notes

- Use `$this->paginate()` in `index()` from the start — even without filter/sort, it makes adding those in #10 and #11 a one-line change rather than a refactor.
- `$this->set(compact('recipes'))` + `$this->viewBuilder()->setOption('serialize', ['recipes'])` is the CakePHP JSON view pattern.
- `created` should be serialised as ISO 8601 (`DateTimeImmutable` → JSON serialisation is automatic in CakePHP 5.x).
- For the 404 case, use CakePHP's `NotFoundException` — it maps to HTTP 404 automatically when the JSON exception renderer is active.

## Rationale / Decisions

**Why eager-load ingredients in both list and detail endpoints?**
The task requires showing recipes with their ingredients (the chocolate-cake example includes the ingredient list). Lazy loading would require N+1 queries (one per recipe) for the list view. CakePHP's `contain()` produces a single JOIN query. The trade-off is slightly larger response payloads for the list — acceptable because recipe lists will be short (dozens, not thousands).

**Why not paginate the list at this stage?**
Pagination is set up via `$this->paginate()` but with no limit enforced yet. Recipes are expected to number in the tens for a demo app; premature pagination hides simplicity without a real performance concern. The option is present if needed.

**Why nested ingredients in the list response instead of a separate `GET /recipes/{id}/ingredients` call?**
Separating them would require two HTTP requests per recipe in the frontend. For a recipe list with hover previews (#12), embedding ingredients avoids a waterfall. The alternative (separate endpoint) would be appropriate in a microservices context or if ingredient lists were very large — neither applies here.

**Why an `/api` prefix (or not)?**
If the backend and frontend are served from the same domain in production (nginx proxy), an `/api` prefix cleanly separates backend routes from Angular routes. If they are on different domains/ports (more likely in this dev setup), it is less important. Decision: use no prefix in dev (cleaner URLs), document this in the README so the reviewer knows it would be added for production.

**Why `NotFoundException` for 404 instead of manually setting the status code?**
CakePHP's exception handler automatically serialises `NotFoundException` to a JSON error response when the JSON renderer is active. Manual `$this->response->withStatus(404)` bypasses the framework's error handling, creating inconsistency with other error cases.

## Definition of Done

- [ ] `GET /recipes` returns HTTP 200 with a JSON array of recipes including nested ingredients
- [ ] `GET /recipes/1` returns HTTP 200 with the chocolate-cake recipe and its 5 ingredients
- [ ] `GET /recipes/9999` returns HTTP 404 with a JSON error body
- [ ] `created` field is serialised as ISO 8601 string
- [ ] `amount` is returned as a decimal string (e.g. `"100.00"`)
- [ ] Both endpoints tested with `curl` — output matches the documented response shape

## Tests

- [ ] **PHPUnit (controller + fixtures):** `testIndex` asserts the list returns the seeded recipe with nested ingredients; `testView` asserts a single recipe with its 5 ingredients; `testViewNotFound` asserts HTTP 404 JSON for an unknown id.
- [ ] Every test method has **real assertions** — no `markTestIncomplete` bake stubs left in the suite (a documented failure of an earlier challenge submission).
