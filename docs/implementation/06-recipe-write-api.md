# Implementation Log — #6 Recipe write API

**Issue:** [docs/issues/06-recipe-write-api.md](../issues/06-recipe-write-api.md)
**Status:** ✅ done · **Date:** 2026-06-17

---

## What was built

```
api/src/Controller/RecipesController.php   # add() + jsonResponse() helper
api/src/Model/Table/IngredientsTable.php   # amount > 0 AND <= 999999.99
api/src/Model/Entity/Recipe.php            # created not mass-assignable
api/src/Model/Entity/Ingredient.php        # recipe_id not mass-assignable
api/config/routes.php                      # POST /recipes
api/tests/TestCase/Controller/RecipesControllerTest.php  # +6 write tests
```

## Endpoint

`POST /recipes` with `{ "title", "description?", "ingredients": [ {name, amount, unit} ] }`

| Outcome | Status | Body |
|---|---|---|
| Created | 201 | `{"recipe": {…, "ingredients": [...]}}` (reloaded) |
| Validation failure | 422 | `{"errors": { … }}` |

## Decisions made during implementation, and why

### 1. Atomic associated save
`newEntity($data, ['associated' => ['Ingredients']])` + `Recipes->save()` wraps
the recipe and its ingredients in a single transaction. A test
(`testInvalidRecipeIsNotPersisted`) asserts a validation failure leaves no orphan
recipe — the bug two reference submissions had.

### 2. Mass-assignment hardening
`created` (Recipe) and `recipe_id`/`recipe` (Ingredient) were set to
`false` in `$_accessible`. A client cannot set the timestamp or re-parent an
ingredient; the association owns `recipe_id`. Verified by probe: posting
`{"id":999,"created":"1999-…"}` produced a recipe with a fresh id and a
server-set `created`, and posting `ingredient.recipe_id: 1` still linked the
ingredient to the *new* recipe.

### 3. "At least one ingredient" enforced in the controller
CakePHP validators run per-field; "the ingredients array must be non-empty" is a
cross-cutting rule, so it is set as an entity error in `add()` before saving.

### 4. Reload before responding
After save, the recipe is re-read with `contain('Ingredients')` so amounts come
back as canonical decimal strings (`"200.00"`), identical to the read endpoints —
one response shape for the client to handle.

### 5. JSON everywhere via a shared helper
`jsonResponse(status, payload)` builds 404/422 responses; success uses JsonView.
Same reasoning as #5 — reliable JSON in debug mode too.

## Bug found by adversarial probing (and fixed)

An adversarial review workflow was started (four independent reviewers:
security, validation, atomicity, contract). **It did not complete — all four
agents hit the session limit**, so its empty result was *not* a clean bill of
health. I ran the equivalent probes manually instead, and one found a real
defect:

> **`amount` above the DECIMAL(8,2) range returned HTTP 500, not 422.**
> Validation checked `amount > 0` but had no upper bound. A value like `9999999`
> passed validation and only failed at the MySQL layer (out-of-range column),
> surfacing as a 500 Database Error.

Fix: added `->lessThanOrEqual('amount', 999999.99)` so the bound matches the
column. Now `9999999` → 422 `"Amount must not exceed 999999.99"`, while the
boundary `999999.99` still creates (201). A regression test covers it.

Other probes came back clean: mass assignment is blocked, `ingredients` as a
non-array → 422, malformed JSON body → 400 (CakePHP BodyParser), empty body →
422.

## Verification

```
POST valid                → 201, ingredients linked, amount "200.00", created server-set
POST missing title        → 422 {"errors":{"title":…}}
POST amount -5            → 422 (greaterThan)
POST amount 9999999      → 422 (lessThanOrEqual)   ← the fixed bug
POST amount 999999.99    → 201 (boundary ok)
POST ingredients: []     → 422 (at least one ingredient)
vendor/bin/phpunit        → 21 tests, 60 assertions
vendor/bin/phpcs          → clean
```

## Notes carried forward

- Re-run the adversarial review workflow for the write path once the session
  limit resets, to catch anything the manual pass missed.
- The read+write API is complete; #7 builds the Angular list against it (MVP).
