# #9 — Create recipe (form) (Feature 2)

**Epic:** C — Frontend Core Functions
**Feature reference:** Feature 2 (Create new recipes with ingredients)
**Effort:** 2–3 h
**Dependencies:** #6, #7
**Status:** ✅ done

## Goal

Build the `RecipeFormComponent` with Angular ReactiveForms, dynamic ingredient rows, and client-side validation — then POST the payload to the API and redirect to the list on success.

## Description

1. Generate component:
   ```
   ng generate component components/recipe-form
   ```
2. Register route: `{ path: 'recipes/new', component: RecipeFormComponent }` (must be declared **before** `recipes/:id` to avoid route collision).
3. Import `ReactiveFormsModule` in `AppModule`.
4. Build the form in `RecipeFormComponent`:
   ```typescript
   form = this.fb.group({
     title: ['', [Validators.required, Validators.maxLength(255)]],
     description: [''],
     ingredients: this.fb.array([this.createIngredient()])
   });
   ```
   where `createIngredient()` returns:
   ```typescript
   this.fb.group({
     name:   ['', Validators.required],
     amount: [null, [Validators.required, Validators.min(0.01)]],
     unit:   ['', Validators.required]
   });
   ```
5. Add **"+ Add ingredient"** button: pushes a new `createIngredient()` group onto the `FormArray`.
6. Add **"Remove"** button per row: removes the ingredient at index `i` (disabled / hidden if only one row remains).
7. On submit: if form valid → call `recipeService.createRecipe(this.form.value)` → navigate to `/` on success; display server-side validation errors inline on failure.
8. Show client-side validation feedback: Bootstrap's `is-invalid` class on touched + invalid fields, `invalid-feedback` div with the error message.
9. Add a `createRecipe(data)` method to `RecipeService` that POSTs to `POST /recipes`.

## Technical Notes

- Route order matters: `'recipes/new'` must come before `'recipes/:id'` in the routes array; otherwise Angular matches `new` as an ID.
- `FormArray` for dynamic ingredient rows is the idiomatic Angular approach — do not use `*ngFor` over a plain array of objects and update manually.
- Map server-side 422 errors back to form controls using `form.get('title')?.setErrors({serverError: 'message'})` — this keeps validation feedback co-located with the field.
- Prevent double-submit: disable the submit button while the POST is in flight (`isSubmitting` flag).

## Rationale / Decisions

**Why Angular ReactiveForms instead of Template-driven forms?**
ReactiveForms define the form model in TypeScript, making validation logic explicit, testable, and composable. `FormArray` for dynamic ingredient rows has no template-driven equivalent without significant workarounds. Template-driven forms are simpler for static, small forms but become unwieldy with dynamic rows and complex validation. This is a well-established Angular best practice for forms with business logic.

**Why `FormArray` for ingredients instead of a plain array?**
`FormArray` integrates with Angular's change detection, validation pipeline, and form state tracking (pristine/dirty/touched). A plain TypeScript array would require manually syncing state to the form — fragile and verbose. The trade-off is that `FormArray` has a steeper learning curve, but the result is idiomatic, maintainable code.

**Why `Validators.min(0.01)` instead of `Validators.min(0)`?**
An amount of 0 is semantically meaningless (0g of sugar is no sugar at all). `0.01` allows very small fractions (a pinch, a drop) while rejecting zero. The server also validates `amount > 0` (#6), so this is consistent.

**Why map server-side errors back to form fields?**
A generic toast or alert ("something went wrong") is less useful than inline field-level feedback. If the backend returns `{ "errors": { "title": ["cannot be empty"] } }`, the user immediately sees which field to fix. This aligns with the "make it user friendly" requirement and is worth the extra mapping code.

**Why navigate to `/` on success instead of `/recipes/:newId`?**
Navigating to the list shows the user their new recipe in context, confirming the creation succeeded visually. Navigating to the detail page would also be valid — but the list provides broader confirmation and is simpler to implement (no need to extract the ID from the response in this step). Either choice is reasonable.

## Definition of Done

- [x] Route `/recipes/new` renders the form
- [x] `title` field shows validation error when submitted empty
- [x] At least one ingredient row is always present; "Remove" is disabled at 1 row
- [x] "+ Add ingredient" adds a new row; each row has name, amount, unit with validation
- [x] Valid submission POSTs to `POST /recipes` and redirects to `/` on success
- [x] The new recipe appears in the list view after redirect
- [x] Server-side 422 errors are displayed inline on the relevant fields
- [x] Submit button is disabled while the request is in flight

## Tests

- [x] **Jasmine/Karma (5 specs):** form invalid when empty; add/remove change the `FormArray` length (min 1 kept); no POST when invalid; a valid submit POSTs the expected payload and navigates to `/`; a 422 maps the `title` error back onto the control.

**Verification (2026-06-17):** full create flow browser-verified — filled a
2-ingredient recipe, redirected to `/`, "Pancakes" appears with "2 ingredients";
API confirms `200.00 g flour` / `300.00 ml milk` persisted; 0 console errors.
**Epic C complete.**
