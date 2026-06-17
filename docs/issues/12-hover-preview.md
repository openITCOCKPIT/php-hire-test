# #12 — AJAX hover preview (Feature 6 — the centrepiece)

**Epic:** D — Advanced Features
**Feature reference:** Feature 6 (Load a recipe preview via AJAX on hover the title)
**Effort:** 2–3 h
**Dependencies:** #5, #8
**Status:** ⬜ open

## Goal

Show a Bootstrap popover with recipe title, ingredient list, and description when the user hovers a recipe title in the list — loaded lazily via AJAX, cached client-side, and cleanly cancelled on `mouseleave` — without spamming the API.

## Description

1. In `RecipeListComponent` (or an extracted `RecipeTitleDirective`), listen to `mouseenter` and `mouseleave` events on each recipe title.
2. On `mouseenter`:
   - Push the recipe `id` into a `hoverSubject$: Subject<number>`.
   - The pipe fetches the recipe details and shows a Bootstrap popover.
3. RxJS pipe on `hoverSubject$`:
   ```typescript
   this.hoverSubject$.pipe(
     switchMap(id => {
       if (this.previewCache.has(id)) {
         return of(this.previewCache.get(id)!);
       }
       return this.recipeService.getRecipe(id).pipe(
         tap(recipe => this.previewCache.set(id, recipe))
       );
     })
   ).subscribe(recipe => this.showPopover(recipe));
   ```
4. On `mouseleave`: call `hidePopover()` to dismiss the Bootstrap popover.
5. **Client-side cache**: `previewCache = new Map<number, Recipe>()` — if the recipe was already fetched, return it from the cache immediately (no HTTP request).
6. **Popover content** (Bootstrap 5 popover via JS API or a positioned `div`):
   - Title (bold)
   - Ingredients: comma-separated `amount unit name` list
   - Short description (first 100 chars if long)
7. Verify in Firefox, Chrome, and Edge that hover/leave cycles work and the Network tab shows at most one request per unique recipe ID.

## Technical Notes

- Bootstrap 5 Popover requires `bootstrap.bundle.min.js` (includes Popper); initialise with `new bootstrap.Popover(element, { content: ..., html: true })`.
- Alternatively, use a custom positioned overlay `div` with Bootstrap utility classes — avoids the Popover JS API complexity and is easier to control programmatically.
- `of(cached)` returns a synchronous Observable, so the popover shows instantly for cached recipes.
- Mouseleave must call `hoverSubject$.next(CANCEL_SENTINEL)` or a dedicated `leaveSubject$` — ensure the popover hides even if the request is in flight when the mouse leaves.
- The `previewCache` is component-scoped; it is cleared when the component is destroyed (navigating away). This is acceptable — the cache is a performance optimisation, not a source of truth.

## Rationale / Decisions

**Why `switchMap` for the hover event?**
If the user moves quickly over multiple recipe titles, each `mouseenter` fires before the previous HTTP response arrives.
- `mergeMap`: all requests fire and all popovers would try to show — race condition, wrong recipe may show last.
- `concatMap`: queues all hover requests; the popover still shows after a significant delay for the 3rd, 4th title hovered.
- `switchMap`: cancels the pending request when a new `mouseenter` fires. Only the recipe the mouse is currently over is fetched. This is the semantically correct operator: "only care about the most recent hover."
Accepted trade-off: if the user moves the mouse very slowly, a request for the intermediate title is started and then immediately cancelled — a wasted round-trip that never returns. This is the intended behaviour.

**Why a `Map<number, Recipe>` cache and not re-using the list data (which already contains ingredients)?**
The list response from `GET /recipes` already includes ingredients (eager-loaded in #5). Technically, the hover preview could be built entirely from list data without any extra HTTP call. However, using the cache-backed `getRecipe(id)` call:
1. Keeps the hover logic consistent with how #8 (detail page) fetches data.
2. Future-proofs against a refactored list endpoint that strips ingredients for performance (lazy-load on detail only).
The trade-off: in the current setup, the HTTP request for a hover preview is always redundant (data already in memory). A pragmatic shortcut would be to build the popover directly from the list data — acceptable but noted here for the reviewer.

**Why not debounce the hover event (e.g., 200 ms delay before fetching)?**
`switchMap` already solves the request-spam problem for hover (unlike search, where the issue is too many requests per keypress). A debounce on `mouseenter` would cause a visible delay before the popover appears, hurting UX. The combination of `switchMap` + cache ensures fast response (cache hit) or a single in-flight request (cache miss) — no debounce needed.

**Why Bootstrap Popover (or custom overlay) instead of a `tooltip`?**
Bootstrap Tooltips are for short text labels (hover help). Popovers support richer HTML content (title + body). The recipe preview needs to show a title, ingredient list, and description — clearly popover territory.

**Browser compatibility note:**
This feature uses standard DOM events (`mouseenter`, `mouseleave`) and Bootstrap 5 — all fully supported in Firefox, Chrome, and Edge. No polyfills required. Verified at DoD stage.

## Definition of Done

- [ ] Hovering a recipe title in the list shows a popover with title, ingredients, and description
- [ ] `mouseleave` hides the popover cleanly
- [ ] Network tab confirms: hovering the same title twice sends at most 1 request (cache hit on second hover)
- [ ] Rapidly hovering multiple titles does not trigger multiple simultaneous requests (switchMap verified)
- [ ] Feature works correctly in Firefox, Chrome, and Edge
- [ ] No JavaScript console errors during normal hover/leave cycles
- [ ] Subscription cleaned up in `ngOnDestroy()`
