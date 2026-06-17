# Implementation Log — #5 Recipe read API (list & detail)

**Issue:** [docs/issues/05-recipe-read-api.md](../issues/05-recipe-read-api.md)
**Status:** ✅ done · **Date:** 2026-06-17

---

## What was built

```
api/src/Model/Table/RecipesTable.php       # hasMany Ingredients, Timestamp(created)
api/src/Model/Table/IngredientsTable.php   # belongsTo Recipes
api/src/Model/Entity/Recipe.php / Ingredient.php
api/src/Controller/RecipesController.php   # index() + view()
api/config/routes.php                      # GET /recipes, GET /recipes/{id}
api/tests/Fixture/RecipesFixture.php / IngredientsFixture.php
api/tests/TestCase/Controller/RecipesControllerTest.php
```

## Endpoints

| Method | Path | Response |
|---|---|---|
| GET | `/recipes` | `{"recipes": [ {…, "ingredients": [...] } ]}` |
| GET | `/recipes/{id}` | `{"recipe": {…, "ingredients": [...] }}` |
| GET | `/recipes/{unknown}` | `404 {"error": "Recipe not found"}` |

## Decisions made during implementation, and why

### 1. Ingredients are eager-loaded with `contain('Ingredients')`
Both endpoints return recipes *with* their ingredients in a single SQL JOIN.
Lazy loading would cause an N+1 query on the list. Recipe lists are short
(dozens), so embedding ingredients keeps the frontend to one request and avoids
a request waterfall for the hover preview (#12). Pagination was intentionally
left off at this size.

### 2. Responses are wrapped: `{"recipes": …}` / `{"recipe": …}`
The list and detail payloads use a named root key via CakePHP's JsonView
`serialize` option. This is the idiomatic CakePHP JSON shape and keeps room for
metadata later (e.g. paging). The Angular `RecipeService` (#7) unwraps it
(`map(r => r.recipe)`).

### 3. The 404 is built as JSON directly, not thrown
`view()` returns a hand-built `404 {"error": …}` response instead of throwing
`NotFoundException`. In **debug mode** CakePHP's exception renderer emits a full
HTML debug page even for API requests, so throwing would give an HTML 404. A
direct response guarantees a JSON body in every mode and keeps CORS headers
attached. (A global JSON exception renderer was the alternative, but it would
also turn the skeleton's HTML error pages into JSON and was avoided as
out-of-scope churn for #5.)

### 4. `amount` stays a decimal string
The ORM returns the DECIMAL column as the string `"100.00"`, which serialises
straight through — preserving exact values and matching the data-type decision
from #4. No float coercion anywhere in the path.

### 5. Timestamp behaviour is `created`-only; `hasMany` is `dependent`
The table has no `modified` column, so Timestamp is configured to set only
`created` on insert (the default would try to write a non-existent `modified`).
`hasMany('Ingredients', ['dependent' => true])` mirrors the DB's ON DELETE
CASCADE at the ORM level, which matters for the write/delete paths.

## Tests

`RecipesControllerTest` (3) asserts the list returns recipes with nested
ingredients and a decimal-string amount, the detail returns one recipe with its
ingredients and an ISO-8601 `created`, and an unknown id returns a JSON 404.
Fixtures are **records-only** — the schema is built from the migrations by the
Migrator (tests/bootstrap.php), so the fixtures never duplicate the schema.

```
vendor/bin/phpunit   # 15 tests, 44 assertions
vendor/bin/phpcs     # clean (after phpcbf tidied bake-generated annotations)
curl /recipes, /recipes/1, /recipes/9999   # verified shapes + JSON 404
```

## Notes carried into #6

- `POST /recipes` next: validation (title required, amount > 0), `saveAssociated`
  in a transaction, and a `422` JSON error envelope.
- Make `created` non-mass-assignable on the Recipe entity (`'created' => false`)
  so a client cannot set it — it is owned by the Timestamp behaviour.
