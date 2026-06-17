# #6 — Recipe write API

**Epic:** B — Data Model & API Foundation
**Feature reference:** Feature 2 (Create new recipes with ingredients)
**Effort:** 2 h
**Dependencies:** #5
**Status:** ⬜ open

## Goal

Expose `POST /recipes` that accepts a recipe with its ingredients in a single JSON payload, persists both atomically, and returns structured validation errors — completing the backend half of the "create recipe" feature.

## Description

1. Implement `RecipesController::add()` for `POST /recipes`.
2. Accept JSON body:
   ```json
   {
     "title": "Chocolate cake",
     "description": "Bake it at 200°C for 40 minutes.",
     "ingredients": [
       { "name": "sugar", "amount": 100, "unit": "g" },
       { "name": "flour", "amount": 50,  "unit": "g" }
     ]
   }
   ```
3. Validation rules (in `RecipesTable::validationDefault()`):
   - `title`: required, not empty, max 255 chars
   - `description`: optional, string
   - `ingredients`: must be an array with at least one element
   - `ingredients.*.name`: required, not empty
   - `ingredients.*.amount`: required, numeric, greater than 0
   - `ingredients.*.unit`: required, not empty
4. Use CakePHP's `patchEntity()` + `saveAssociated()` (or `newEntity()` with `associated: ['Ingredients']`) so both recipe and ingredients are saved in a single transaction.
5. On validation failure return HTTP 422 with:
   ```json
   {
     "errors": {
       "title": ["This field cannot be left empty"],
       "ingredients.0.amount": ["The provided value is invalid"]
     }
   }
   ```
6. On success return HTTP 201 with the created recipe + ingredients (same shape as `GET /recipes/{id}`).
7. Register route: `$routes->post('/recipes', ['controller' => 'Recipes', 'action' => 'add'])`.

## Technical Notes

- CakePHP 5.x requires `$this->request->getData()` to read a JSON body (not `$_POST`). Ensure `Content-Type: application/json` is set by the Angular client.
- `newEntity($data, ['associated' => ['Ingredients']])` handles nested saving automatically if the association is configured in `RecipesTable`.
- Use `$this->Recipes->getValidator()->validate($data)` for a pre-save check, or rely on `saveAssociated()` returning `false` on validation failure.
- Return the full entity on success: this avoids a second GET call from the Angular frontend after creation.

## Rationale / Decisions

**Why HTTP 422 (Unprocessable Entity) for validation errors instead of 400 (Bad Request)?**
- HTTP 400 means the request is syntactically malformed (e.g., invalid JSON).
- HTTP 422 means the request is syntactically valid but semantically invalid (e.g., missing required field). This distinction is semantically correct per RFC 9110 and is the convention Angular's `HttpClient` and most API clients expect for form-validation feedback.

**Why return HTTP 201 instead of 200 on successful creation?**
HTTP 201 Created is the correct status for a successful POST that creates a resource. It also carries a `Location` header convention (pointing to `GET /recipes/{id}`) which the Angular frontend can optionally use. 200 would be ambiguous — it signals success but not creation.

**Why atomic save (recipe + ingredients in one transaction)?**
A recipe without ingredients (or ingredients without a recipe) is a half-created, inconsistent state. If the recipe inserts but an ingredient fails (e.g., DB error), the recipe row should roll back. CakePHP's `saveAssociated()` wraps both in a transaction by default. The alternative (save recipe first, then loop over ingredients) was rejected because it requires manual transaction management and opens a race condition window.

**Why validate `amount > 0` server-side?**
Frontend validation (#9) is a UX convenience but not a security boundary. A negative amount (e.g., -100g of sugar) is semantically nonsensical and would corrupt any future feature that sums ingredient quantities. Server-side validation is the only reliable enforcement point.

**Why not support `PUT /recipes/{id}` or `DELETE /recipes/{id}` in this issue?**
The task does not mention editing or deleting recipes. Adding CRUD operations not required by the spec wastes implementation time and introduces untested code paths. They can be added later if needed.

## Definition of Done

- [ ] `POST /recipes` with valid JSON body returns HTTP 201 with the created recipe + ingredients
- [ ] `POST /recipes` with missing `title` returns HTTP 422 with a JSON error listing the `title` validation error
- [ ] `POST /recipes` with `amount: -5` returns HTTP 422 with an `amount` validation error
- [ ] `POST /recipes` with `ingredients: []` returns HTTP 422
- [ ] Recipe and ingredients are saved atomically — no orphaned rows if save fails
- [ ] Tested with `curl -X POST -H "Content-Type: application/json" -d '{...}'`

## Tests

- [ ] **PHPUnit:** `testAddValid` creates a recipe + ingredients and asserts HTTP 201 with the persisted entity; `testAddMissingTitle` asserts 422 with a `title` error; `testAddNegativeAmount` asserts 422; `testAddEmptyIngredients` asserts 422.
- [ ] **Transaction test:** force an ingredient-save failure and assert the recipe row is rolled back (no orphan recipe) — proves the atomic-save guarantee that two reference submissions got wrong.
