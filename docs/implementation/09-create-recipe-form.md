# Implementation Log — #9 Create recipe form

**Issue:** [docs/issues/09-create-recipe-form.md](../issues/09-create-recipe-form.md)
**Status:** ✅ done · **Date:** 2026-06-17 · **Epic C complete**

---

## What was built

```
frontend/src/app/components/recipe-form/recipe-form.*   # /recipes/new ReactiveForm
frontend/src/app/app.routes.ts                          # recipes/new BEFORE recipes/:id
```

## Decisions made during implementation, and why

### 1. ReactiveForms + `FormArray` for ingredients
The form model is defined in TypeScript. Ingredients are a `FormArray` of
`FormGroup`s, which integrates with Angular's validation/state tracking — a plain
array would need manual syncing. `addIngredient()`/`removeIngredient()` push/remove
groups; `removeIngredient` is a no-op at one row so the invariant "at least one
ingredient" holds in the UI (the backend enforces it too, #6).

### 2. Client validation mirrors the server
`title` required + maxLength(255); each ingredient `name`/`unit` required,
`amount` required + `min(0.01)`. These mirror the CakePHP rules from #6, so the
user gets instant feedback, but the server stays the real boundary.

### 3. Server 422 errors mapped back onto controls
On a 422, `applyServerErrors()` walks the `{"errors": {...}}` envelope and calls
`setErrors({server: …})` on the matching control (`title`, and each
`ingredients[i].field`). A non-field ingredient error (the "at least one
ingredient" case) and any non-422 failure fall back to a form-level alert. So
whichever layer rejects the input, the user sees where.

### 4. Double-submit prevented; redirect on success
A `submitting` signal disables the submit button (spinner + "Saving…") while the
POST is in flight. On success the user is routed to `/`, where the new recipe is
visible in context — the simplest confirmation that the create succeeded.

### 5. Route order: `recipes/new` before `recipes/:id`
Registered ahead of the parameterised route so "new" is not captured as an id.
(The detail route's `:id` has no numeric constraint on the Angular side, so order
is what disambiguates.)

## Verification

```
ng build / ng test --watch=false      # 16 specs green (form x5 added)

Browser (Playwright, full create flow):
  - fill title + description, fill ingredient 1, "Add ingredient", fill ingredient 2
  - Remove button is disabled at one row, enabled at two
  - Save → redirected to '/', "Pancakes" card shows with "2 ingredients", today's date
  - API confirms persisted ingredients: 200.00 g flour, 300.00 ml milk
  - 0 console errors
```

The create flow works end to end — **Epic C (frontend core) is complete**. The
app can now browse, view and create recipes.

## Notes carried into Epic D

- `RecipeService.getRecipes()` already accepts `sort`/`direction`/`search` params,
  so #10 (sort) and #11 (search) wire UI controls to existing service plumbing.
- Title links and the list are in place for #12 (hover preview) to attach to.
