# Implementation Log — #10 Sorting

**Issue:** [docs/issues/10-sorting.md](../issues/10-sorting.md)
**Status:** ✅ done · **Date:** 2026-06-17

---

## What was built

```
api/src/Controller/RecipesController.php   # ?sort + ?direction -> whitelisted orderBy
frontend/src/app/components/recipe-list/*   # sort dropdown (ngModel)
+ backend & frontend tests
```

## Decisions made during implementation, and why

### 1. Server-side sorting via the ORM
`index()` reads `?sort` and `?direction` and applies `orderBy()` on the query.
Sorting on the server (not in JS) means it works across the whole dataset
regardless of pagination, uses the DB's ordering, and stays consistent with the
server-side search coming in #11. Default order is `created DESC` (newest first).

### 2. Whitelisted sort column — SQL-injection safety
A column name **cannot** be a bound parameter, so passing the raw `?sort` value
to `orderBy()` would be an injection vector. `sortClause()` maps the param
through a fixed allow-list (`title` → `Recipes.title`, `created` →
`Recipes.created`) and falls back to the default on anything unknown; `direction`
is coerced to exactly `ASC` or `DESC`. A test posts `?sort=title;DROP TABLE
recipes&direction=evil` and asserts a normal 200 with the data intact.

### 3. A single `sort` dropdown, not clickable headers
The list is a card grid (#7), which has no column headers to click. A Bootstrap
`<select>` with four options (Newest/Oldest first, Title A–Z/Z–A) is the right
control for cards. `[(ngModel)]` binds it; `onSortChange()` reloads. The combined
`"field-DIRECTION"` option value is split into the two query params.

### 4. Existing test made order-independent
Adding a default sort broke a test that assumed the first list item was the
chocolate cake. It now finds the cake by title rather than position — the test
was asserting the wrong invariant (content, not order).

## Verification

```
curl ?sort=title&direction=ASC      # Apple pie, Chocolate cake, Test
curl ?sort=created&direction=DESC   # newest first
curl ?sort=title;DROP…&direction=evil  # 200, falls back to default, DB intact
vendor/bin/phpunit                  # 25 tests green (3 sort tests added)
ng test                             # 17 specs green (sort re-request test added)

Browser: selecting "Title A–Z" re-requests ?sort=title&direction=ASC and the
cards reorder alphabetically.
```

## Notes carried into #11

- `index()` now composes `orderBy`; #11 adds a `where(LIKE)` on the same query so
  search and sort apply together.
- The list component reloads via `load()`; #11's debounced search will call the
  same path, merging `search` with the current `sort`.
