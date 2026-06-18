# Implementation Log — #11 Search

**Issue:** [docs/issues/11-search.md](../issues/11-search.md)
**Status:** ✅ done · **Date:** 2026-06-18

---

## What was built

```
api/src/Controller/RecipesController.php   # ?search -> LIKE on title + description
frontend/src/app/components/recipe-list/*   # debounced search box (Subject + switchMap)
+ backend & frontend tests
```

## Decisions made during implementation, and why

### 1. Server-side search via parameterised LIKE
`index()` applies `Recipes.title LIKE %term% OR Recipes.description LIKE %term%`
when `?search` is present, composed onto the same query as the sort. Server-side
means it searches the whole dataset (not just rendered rows), and stays correct
under pagination. The term is **bound**, never concatenated into SQL.

### 2. LIKE wildcards in the term are escaped
`addcslashes($search, '%_\\')` so a user searching `50%` matches the literal
"50%" rather than every row. Not a security fix (the value is already bound) — a
correctness one: `%` and `_` are LIKE metacharacters and would otherwise behave
as wildcards. Verified `?search=%` no longer matches everything.

### 3. Search matches the human-readable title/description
A documented failure of an earlier challenge submission was searching an internal
key. Here a test asserts `?search=fry` matches the recipe whose *description*
(not title) contains "fry" — the search is over real, user-visible text.

### 4. Frontend: `Subject` + `debounceTime(300)` + `distinctUntilChanged` + `switchMap`
- `debounceTime(300)` — one request per pause in typing, not per keystroke (300 ms
  is the live-search sweet spot).
- `distinctUntilChanged()` — skips duplicate consecutive terms.
- `switchMap` — cancels the in-flight request when a newer term arrives, so a slow
  earlier response can never overwrite a newer one (the race `mergeMap` would allow).
- `catchError` returns `of([])` and sets the error state, keeping the stream alive.

Sort changes reload **immediately** (no debounce) via `load()`; both paths read
the current `sort` + `search`, so search and sort always compose.

### 5. Distinct empty states
"No recipes yet" (genuinely empty collection) vs. "No recipes match your search"
(filtered to nothing) — the user should know which situation they're in.

## Verification

```
curl ?search=choc                    # only Chocolate cake
curl ?search=fry                     # Pancakes (matched its description)
curl ?search=zzz                     # 0 results
curl ?search=a&sort=title&dir=ASC    # search + sort compose
curl ?search=%                       # 200, % escaped (no match-all)
vendor/bin/phpunit                   # 29 tests green (4 search tests)
ng test                              # 18 specs green (debounce test via fakeAsync)

Browser: typing "choc" letter-by-letter issued exactly ONE request
(?sort=created&direction=DESC&search=choc) — debounce confirmed; the list filtered
to Chocolate cake; "No recipes match your search" shown for a non-matching term;
0 console errors.
```

## Notes carried into #12

- `RecipeService.getRecipe(id)` is ready for the hover preview; #12 adds a
  dedicated lightweight `/recipes/{id}/preview` endpoint and the switchMap+cache
  hover pipe on the list's title links.
