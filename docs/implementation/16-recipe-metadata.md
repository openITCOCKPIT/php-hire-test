# Implementation Log — #16 Recipe metadata (temperature & duration)

**Issue:** [docs/issues/16-recipe-metadata.md](../issues/16-recipe-metadata.md)
**Status:** ✅ done · **Date:** 2026-06-18

---

## What was built

```
api/config/Migrations/20260617230028_AddMetadataToRecipes.php  # +temperature,+duration
api/src/Model/Entity/Recipe.php / Table/RecipesTable.php        # accessible + ranged validation
api/config/Seeds/RecipesSeed.php, api/tests/Fixture/RecipesFixture.php
api/templates/email/html/recipe.php                             # show in e-mail
frontend/src/app/models/recipe.ts                               # Recipe + NewRecipe fields
frontend/.../recipe-form.*                                       # optional number inputs
frontend/.../recipe-detail.html, recipe-list.html               # badges
+ backend & frontend tests updated
```

## Decisions / notes

- **Optional, nullable, ranged** (0–500 °C, 0–1440 min) — validation mirrors the
  SMALLINT UNSIGNED column so an out-of-range value is a clean 422.
- **Gotcha: ORM schema cache.** After the migration, backend tests returned
  `null` for the new columns even though the test DB had them — CakePHP had cached
  the old `recipes` schema. `bin/cake schema_cache clear` (and clearing
  `tmp/cache/models`) fixed it. Worth remembering after any column-adding
  migration. The dev app was unaffected (it read the fresh schema).
- Frontend `Recipe` interface now requires the two fields, so the spec fixtures
  were updated to include them.

## Verification

```
migrate / rollback / migrate    # reversible
curl GET /recipes/1             # temperature 200, duration 40
curl POST … temperature 600     # 422 (range)
vendor/bin/phpunit              # 38 tests green ; phpcs clean
ng build / ng test              # green, 25 specs
```
