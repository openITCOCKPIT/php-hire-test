# #11 — Search (Feature 5)

**Epic:** D — Advanced Features
**Feature reference:** Feature 5 (Search recipes)
**Effort:** 1–2 h
**Dependencies:** #5, #7
**Status:** ⬜ open

## Goal

Add a real-time search field to the recipe list that filters results server-side using a RxJS-debounced query — giving users instant feedback without spamming the API.

## Description

**Backend (`RecipesController::index()`):**
1. Read query param: `?search=choc`.
2. Apply a case-insensitive `LIKE` filter when the param is present:
   ```php
   if ($search = $this->request->getQuery('search')) {
       $query->where([
           'OR' => [
               'Recipes.title LIKE' => '%' . $search . '%',
               'Recipes.description LIKE' => '%' . $search . '%',
           ]
       ]);
   }
   ```
3. Compose with the existing sort logic from #10 — both params can be active simultaneously.

**Frontend (`RecipeListComponent`):**
1. Add a Bootstrap search input above the recipe list.
2. Create a `Subject<string>` for the search input:
   ```typescript
   searchInput$ = new Subject<string>();
   ```
3. In `ngOnInit()`, pipe the subject:
   ```typescript
   this.searchInput$.pipe(
     debounceTime(300),
     distinctUntilChanged(),
     switchMap(term => this.recipeService.getRecipes({ search: term, sort: this.sortField, direction: this.sortDirection }))
   ).subscribe(response => this.recipes = response.recipes);
   ```
4. Bind the input's `(input)` event to `searchInput$.next($event.target.value)`.
5. Maintain current sort when searching (compose `search` + sort params in a single `getRecipes()` call).
6. Show a "No recipes found" message when the API returns an empty array.

## Technical Notes

- `debounceTime(300)` means the API is not called until 300 ms after the user stops typing.
- `distinctUntilChanged()` prevents duplicate API calls if the user types the same character twice quickly (e.g., deletes and re-types).
- `switchMap` cancels the in-flight HTTP request if a new search term arrives before the response — critical for correctness (prevents stale responses from overwriting newer ones).
- Unsubscribe the search subscription in `ngOnDestroy()` (or use `takeUntilDestroyed()`).
- The LIKE query on `description` is optional but adds value; if description is long it may slow queries — an index on `title` covers the common case.

## Rationale / Decisions

**Why server-side search instead of client-side filtering?**
Client-side filtering (`.filter()` on the loaded array) only searches the currently loaded page. If pagination is added later, unseen recipes would be invisible to the filter. Server-side search is the only approach that scales correctly. Accepted trade-off: each keystroke (after debounce) is an HTTP request — but 300 ms debounce limits this to one request per "pause in typing".

**Why `debounceTime(300)` — specifically 300 ms?**
- Under 150 ms: fires on almost every keystroke, too many requests.
- Over 500 ms: perceptibly sluggish — users expect near-instant feedback.
- 300 ms is the accepted UX sweet spot for live search (used by Google, GitHub, and most major search UIs).
- This is a reasonable default; it can be tuned without changing the architecture.

**Why `switchMap` and not `mergeMap` or `concatMap`?**
- `mergeMap`: executes all requests concurrently. If the user types "cho" then "choc", both requests run and the earlier one ("cho") might arrive after the later one ("choc"), showing stale results. Race condition.
- `concatMap`: queues requests. The "choc" request waits until "cho" finishes. If typing is fast, a backlog builds up. Results are always ordered but lag behind the user's input.
- `switchMap`: cancels the in-flight request when a new value arrives. The user always sees the result for what they last typed. This is the correct operator for live search — exactly the "cancel-previous-request" semantic needed here.

**Why `LIKE '%search%'` instead of full-text search (MySQL FULLTEXT index)?**
`LIKE '%search%'` is simple, requires no additional schema changes, and is fast enough for a recipe collection with dozens to hundreds of rows. MySQL FULLTEXT search requires `ALTER TABLE ... ADD FULLTEXT INDEX` and uses different syntax (`MATCH ... AGAINST`). The complexity is not justified at this scale. Noted as a future improvement if the collection grows significantly.

## Definition of Done

- [ ] Typing "choc" in the search field returns only the chocolate-cake recipe (after ≤300 ms debounce)
- [ ] Clearing the search field returns all recipes
- [ ] A "No recipes found" message appears when the search has no results
- [ ] Search and sort work simultaneously (e.g., search "cake", sort by date)
- [ ] Rapid typing does not cause multiple simultaneous API requests (verified in browser Network tab)
- [ ] Subscription is properly cleaned up on component destroy
