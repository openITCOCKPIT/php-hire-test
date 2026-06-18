# Implementation Log — #17 Edit & delete recipes

**Issue:** [docs/issues/17-edit-delete-recipes.md](../issues/17-edit-delete-recipes.md)
**Status:** ✅ done · **Date:** 2026-06-18

---

## What was built

```
api/src/Controller/RecipesController.php   # edit() PUT + delete() DELETE
api/src/Model/Table/RecipesTable.php       # hasMany saveStrategy 'replace'
api/config/routes.php                      # PUT/DELETE /recipes/{id}
frontend/src/app/services/recipe.service.ts # updateRecipe + deleteRecipe
frontend/.../recipe-form.*                  # edit mode (load, prefill, PUT)
frontend/.../recipe-detail.*                # Edit + Delete buttons
frontend/src/app/app.routes.ts             # /recipes/:id/edit
+ backend & frontend tests
```

## Decisions / notes

- **`saveStrategy => 'replace'`** on the Ingredients hasMany: editing replaces the
  whole ingredient set (deletes removed rows) in the same transaction. Verified:
  editing a 2-ingredient recipe down to 1 leaves no orphan rows.
- **Create form reused for edit.** `editId` signal drives the differences: title
  ("Edit Recipe"), button ("Save changes"), `updateRecipe` vs `createRecipe`, and
  redirect to the detail page vs the list. `populate()` rebuilds the ingredient
  `FormArray` from the loaded recipe (parsing the decimal-string amount to a
  number for the input).
- **Delete** uses `window.confirm()` then `deleteRecipe()` → navigate to the list.
- Route order: `/recipes/:id/edit` sits before `/recipes/:id`; they don't collide
  (different segment counts) but the ordering keeps intent clear.

## Verification

```
curl PUT /recipes/{id}   # title/temp updated, ingredients 2→1 (replaced, no orphans)
curl PUT /recipes/9999   # 404 ; PUT empty ingredients → 422
curl DELETE /recipes/{id}# {"deleted":true}; GET → 404; ingredients cascaded (0 orphans)
vendor/bin/phpunit       # 43 tests green ; phpcs clean
ng test                  # 30 specs green

Browser (Playwright):
  - Edit: form prefilled (title, description, 200°C, 40min, 5 ingredient rows);
    changed title + temperature → saved → detail shows "…(improved)" + 🌡190°C
  - Delete: confirm dialog → removed from list; 0 console errors
```
