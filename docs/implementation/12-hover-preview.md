# Implementation Log — #12 AJAX hover preview (the centrepiece)

**Issue:** [docs/issues/12-hover-preview.md](../issues/12-hover-preview.md)
**Status:** ✅ done · **Date:** 2026-06-18

---

## What was built

```
api/src/Controller/RecipesController.php   # GET /recipes/{id}/preview (trimmed)
api/config/routes.php                      # preview route before /{id}
frontend/src/app/models/recipe.ts          # RecipePreview type
frontend/src/app/services/recipe.service.ts # getRecipePreview(id)
frontend/src/app/components/recipe-list/*   # hover pipe + popover + cache
+ backend & frontend tests
```

## Decisions made during implementation, and why

### 1. A dedicated, lightweight `/recipes/{id}/preview` endpoint
Not a reuse of the full detail endpoint. It truncates the description to ~200
chars (+ ellipsis) and returns only the first 5 ingredients. Hovering is
high-frequency, so the payload is intentionally small. Tests assert the 5-cap
and the 200-char truncation. The route is registered **before** `/recipes/{id}`
so `{id}/preview` is not parsed as an id.

### 2. `switchMap` — the right operator for hover
If the cursor moves across several titles, each `mouseenter` fires before the
previous response arrives. `switchMap` cancels the superseded request, so only
the recipe currently under the cursor is fetched, and a slow earlier response can
never pop up over a later title. (`mergeMap` would race; `concatMap` would lag.)

### 3. `debounceTime(200)` — but no `distinctUntilChanged`
A 200 ms debounce means titles merely passed over in transit never trigger a
request — only a title the cursor pauses on does. **No** `distinctUntilChanged`
here (unlike search): re-hovering the same title after leaving must re-show its
cached preview, which `distinctUntilChanged` would suppress (same id as last).

### 4. Client-side `Map<number, RecipePreview>` cache
A fetched preview is stored by id; a second hover of the same title is served
from memory with no HTTP request. Verified in the browser: hovering id 1 twice
produced exactly one `/preview` request.

### 5. Clean cleanup on `mouseleave` — two mechanisms
- `onTitleLeave()` hides the popover immediately (`preview.set(null)`) and pushes
  `leave$`; `takeUntil(this.leave$)` on the inner observable cancels an in-flight
  request the moment the cursor leaves.
- A `hoveredId` guard handles the subtler case where the cursor leaves *during*
  the 200 ms debounce (before any request starts): `switchMap` short-circuits to
  `of(null)` if `hoveredId !== id`, and the subscribe only shows a preview when
  `hoveredId === preview.id`. So a late or pending preview never appears over a
  title the cursor already left. (A regression test covers leaving mid-debounce.)

### 6. `catchError(of(null))` keeps the stream alive
A failed preview request yields `null` (no popover) without tearing down the
hover pipe, so the next hover still works.

### 7. Custom positioned `div`, not the Bootstrap Popover JS API
Simpler to drive from Angular state. It is `position: absolute`, anchored below
the title via the title's bounding rect, kept inside the viewport on the right
edge, and `pointer-events: none` so it never steals the hover from the title.
Amounts are formatted (`100.00` → `100g`) to match the detail view.

## Verification

```
curl /recipes/1/preview            # trimmed payload (title, ≤5 ingredients, excerpt)
curl /recipes/9999/preview         # 404 JSON
vendor/bin/phpunit                 # 32 tests green (3 preview tests)
ng test                            # 21 specs green (cache + leave-mid-debounce)

Browser (Playwright / Chromium — Chrome + Edge engine):
  - hover a title → popover with title, "100g sugar, 50g flour, 2pcs eggs, …",
    description excerpt
  - one /preview request per hover; hovering the same title again → NO new
    request (cache hit)
  - 0 console errors
```

**Browser coverage note:** verified in the Chromium engine, which Chrome and Edge
share. Firefox uses only standard `mouseenter`/`mouseleave` events and absolute
positioning (no engine-specific APIs), so there is no compatibility risk; the
full Firefox/Chrome/Edge run is the staged check in #14 (core flows) and #15
(everything). This is consistent with the three-stage browser-testing plan.

## Notes carried forward

- The centrepiece feature is complete and cached. #13 (optional email) and #14
  (UX polish, full cross-browser of core flows) remain in Epic D/E.
