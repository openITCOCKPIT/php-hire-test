# Implementation Log — #20 Personal notes per recipe

**Issue:** [docs/issues/20-recipe-notes.md](../issues/20-recipe-notes.md)
**Status:** ✅ done · **Date:** 2026-06-18

---

## What was built

```
api/config/Migrations/..._CreateNotes.php   # notes table (FK cascade)
api/src/Model/Table/NotesTable.php / Entity/Note.php
api/src/Model/Table/RecipesTable.php        # hasMany Notes (dependent)
api/src/Controller/NotesController.php       # index / add / delete
api/config/routes.php                        # nested notes routes
frontend/src/app/models/recipe.ts            # Note type
frontend/.../recipe.service.ts               # getNotes / addNote / deleteNote
frontend/.../recipe-detail.*                  # Notes section (list + add + delete)
+ backend & frontend tests
```

## Endpoints

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/recipes/{id}/notes` | notes for a recipe, newest first |
| POST | `/api/recipes/{id}/notes` | add a note (422 empty body, 404 unknown recipe) |
| DELETE | `/api/notes/{id}` | delete a note (404 unknown) |

## Decisions / notes

- **Personal notes, not social comments** (decided with the user): the app has no
  accounts, so a free-text optional `author` + required `body` is the honest fit.
- **Dedicated `NotesController`** keeps the already-large `RecipesController`
  focused; notes are a sub-resource with their own list/add/delete.
- **`recipe_id` comes from the route, not the body** — it is non-mass-assignable
  on the entity and set by the controller, so a client cannot post a note onto a
  different recipe (a test asserts this).
- **Cascade:** `hasMany('Notes', dependent)` + FK `ON DELETE CASCADE` — deleting a
  recipe removes its notes (tested).
- **Frontend:** the detail page loads notes after the recipe, lists them
  newest-first (author/anonymous + date), adds via a small form (body required,
  author optional) and deletes per note, updating the signal in place. The detail
  spec's `afterEach` flushes any pending notes request so the existing tests stay
  green without per-test edits.

## Verification

```
curl POST/GET/DELETE notes        # add, list newest-first, 422 empty, 404 unknown,
                                  # recipe_id taken from route, delete, cascade on recipe delete
vendor/bin/phpunit                # 59 tests green ; phpcs clean
ng test                           # 36 specs green
npm run e2e                       # Firefox + Chromium green (regression)

Browser (Playwright): added a note ("…weniger Zucker" by Anna) → appears with
author + date; deleted it via the × button; 0 console errors.
```
