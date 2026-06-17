# #12 — AJAX hover preview (Feature 6 — the centrepiece)

**Epic:** D — Advanced Features
**Feature reference:** Feature 6 (Load a recipe preview via AJAX on hover the title)
**Effort:** 2–3 h
**Dependencies:** #5, #8
**Status:** ⬜ open

## Goal

Show a Bootstrap popover with recipe title, ingredient list, and description when the user hovers a recipe title in the list — loaded lazily via AJAX, cached client-side, and cleanly cancelled on `mouseleave` — without spamming the API.

## Description

**Backend — dedicated lightweight preview endpoint:**
1. Add `GET /recipes/{id}/preview` (route + `RecipesController::preview($id)`). This is **not** the full `GET /recipes/{id}` from #5 — it returns a deliberately trimmed payload tailored to the hover popover:
   ```json
   {
     "id": 1,
     "title": "Chocolate cake",
     "ingredients": [ { "name": "sugar", "amount": "100.00", "unit": "g" } ],
     "descriptionExcerpt": "Bake it at 200°C for 40 minutes."
   }
   ```
   - `descriptionExcerpt`: `description` truncated to ~200 chars (with an ellipsis if longer).
   - `ingredients`: first ~5 only (the popover is a glance, not the full list).
   - Return HTTP 404 JSON if the recipe does not exist (no 500 on bad id).

**Frontend:**
2. In `RecipeListComponent` (or an extracted `RecipeTitleDirective`), listen to `mouseenter` and `mouseleave` events on each recipe title.
3. On `mouseenter`: push the recipe `id` into a `hoverSubject$: Subject<number>`. On `mouseleave`: hide the popover via a `leaveSubject$` / `hidePopover()`.
4. RxJS pipe on `hoverSubject$` — small debounce, then cache-or-fetch, then `switchMap`:
   ```typescript
   this.hoverSubject$.pipe(
     debounceTime(200),
     distinctUntilChanged(),
     switchMap(id => {
       if (this.previewCache.has(id)) {
         return of(this.previewCache.get(id)!);
       }
       return this.recipeService.getRecipePreview(id).pipe(
         tap(preview => this.previewCache.set(id, preview)),
         catchError(() => of(null))
       );
     }),
     takeUntilDestroyed(this.destroyRef)
   ).subscribe(preview => preview && this.showPopover(preview));
   ```
5. Add `getRecipePreview(id): Observable<RecipePreview>` to `RecipeService` (calls the new endpoint); define a `RecipePreview` TypeScript interface.
6. **Client-side cache**: `previewCache = new Map<number, RecipePreview>()` — a previously fetched preview is served from memory with no HTTP request.
7. **Popover content** (Bootstrap 5 popover via JS API or a positioned `div`):
   - Title (bold)
   - Ingredients: comma-separated `amount unit name` list (first 5)
   - `descriptionExcerpt`
8. Verify in Firefox, Chrome, and Edge that hover/leave cycles work and the Network tab shows at most one request per unique recipe ID.

## Technical Notes

- Bootstrap 5 Popover requires `bootstrap.bundle.min.js` (includes Popper); initialise with `new bootstrap.Popover(element, { content: ..., html: true })`.
- Alternatively, use a custom positioned overlay `div` with Bootstrap utility classes — avoids the Popover JS API complexity and is easier to control programmatically.
- `of(cached)` returns a synchronous Observable, so the popover shows instantly for cached recipes.
- Mouseleave must call `hoverSubject$.next(CANCEL_SENTINEL)` or a dedicated `leaveSubject$` — ensure the popover hides even if the request is in flight when the mouse leaves.
- The `previewCache` is component-scoped; it is cleared when the component is destroyed (navigating away). This is acceptable — the cache is a performance optimisation, not a source of truth.
- The inner `catchError(() => of(null))` keeps the stream alive: a single failed preview request must not break the whole hover pipe. The `subscribe` guards against `null` before showing a popover.
- Add **viewport-aware placement** for the popover (flip/offset near screen edges) so it does not clip at the right/bottom of the window — a rough edge seen in reference submissions.

## Rationale / Decisions

**Why `switchMap` for the hover event?**
If the user moves quickly over multiple recipe titles, each `mouseenter` fires before the previous HTTP response arrives.
- `mergeMap`: all requests fire and all popovers would try to show — race condition, wrong recipe may show last.
- `concatMap`: queues all hover requests; the popover still shows after a significant delay for the 3rd, 4th title hovered.
- `switchMap`: cancels the pending request when a new `mouseenter` fires. Only the recipe the mouse is currently over is fetched. This is the semantically correct operator: "only care about the most recent hover."
Accepted trade-off: if the user moves the mouse very slowly, a request for the intermediate title is started and then immediately cancelled — a wasted round-trip that never returns. This is the intended behaviour.

**Why a dedicated `GET /recipes/{id}/preview` endpoint instead of reusing `GET /recipes/{id}`?**
The hover preview is a *glance* — it shows a title, a few ingredients, and a short description excerpt. Reusing the full detail endpoint would ship the entire recipe (full description, every ingredient) on every hover, of which most is discarded by the popover. A dedicated endpoint that truncates the description to ~200 chars and returns only the first ~5 ingredients keeps the hover payload intentionally small, which matters precisely because hovering is high-frequency. The trade-off is one extra controller action and route — cheap, and it cleanly separates "quick preview" from "full detail" concerns. (This refinement is taken directly from the strongest reference submission to this challenge, which used the same pattern.)

**Why a `Map<number, RecipePreview>` cache?**
Once a preview has been fetched, re-hovering the same title should be instant and silent — no second HTTP request. A component-scoped `Map` keyed by recipe id gives O(1) cache hits and is cleared when the component is destroyed. The alternative — building the popover directly from the already-loaded list data (which includes ingredients from #5) — would avoid all hover requests, but it couples the preview to the exact shape of the list response and skips the AJAX requirement the feature is explicitly testing ("Load a recipe preview **via AJAX** on hover"). The dedicated endpoint + cache honours the AJAX requirement while still avoiding repeat requests.

**Why a small `debounceTime(200)` on the hover event?**
`switchMap` alone already prevents *stale* responses (it cancels the in-flight request when the mouse moves on). But without a debounce, a request is still *started* for every title the cursor passes over in transit — including titles the user never meant to inspect. A 200 ms debounce means a request only fires for a title the user actually pauses on, eliminating those transient requests entirely. 200 ms is short enough to feel instant. (An earlier version of this plan argued against debouncing; the reference analysis showed a small debounce is the better choice — `switchMap` for correctness, debounce to avoid pass-over requests, cache for repeats. All three compose.)

**Why Bootstrap Popover (or custom overlay) instead of a `tooltip`?**
Bootstrap Tooltips are for short text labels (hover help). Popovers support richer HTML content (title + body). The recipe preview needs to show a title, ingredient list, and description — clearly popover territory.

**Browser compatibility note:**
This feature uses standard DOM events (`mouseenter`, `mouseleave`) and Bootstrap 5 — all fully supported in Firefox, Chrome, and Edge. No polyfills required. Verified at DoD stage.

## Definition of Done

- [ ] `GET /recipes/1/preview` returns the trimmed JSON (title, ≤5 ingredients, ≤200-char `descriptionExcerpt`)
- [ ] `GET /recipes/9999/preview` returns HTTP 404 JSON (not a 500)
- [ ] Hovering a recipe title in the list shows a popover with title, ingredients, and description excerpt
- [ ] `mouseleave` hides the popover cleanly
- [ ] Network tab confirms: hovering the same title twice sends at most 1 request (cache hit on second hover)
- [ ] Rapidly hovering multiple titles does not trigger multiple simultaneous requests (switchMap + debounce verified)
- [ ] Popover does not clip at the right/bottom screen edge (viewport-aware placement)
- [ ] Feature works correctly in Firefox, Chrome, and Edge
- [ ] No JavaScript console errors during normal hover/leave cycles
- [ ] Subscription cleaned up via `takeUntilDestroyed` / `ngOnDestroy()`

## Tests

- [ ] **Backend (PHPUnit):** `RecipesController::preview()` — happy path returns trimmed payload; description longer than 200 chars is truncated with ellipsis; more than 5 ingredients are capped at 5; invalid id returns 404 JSON.
- [ ] **Frontend (Jasmine/Karma):** preview pipe serves a cached `RecipePreview` without a second HTTP call (assert `HttpTestingController` sees one request for two hovers of the same id); a failed preview request does not break the stream (catchError path); `mouseleave` hides the popover.
