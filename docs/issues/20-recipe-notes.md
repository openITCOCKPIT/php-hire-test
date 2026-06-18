# #20 — Personal notes per recipe

**Epic:** F — Post-review enrichment
**Feature reference:** — (user request, reframed: personal notes, not social comments)
**Effort:** 1–2 h
**Dependencies:** #4, #5, #8
**Status:** ✅ done

## Goal

Let users attach short personal notes to a recipe (e.g. "used less sugar last
time") — a single-user "comments/notes" feature that fits an app with no accounts.

## Description

- **Schema:** new table `notes` (1:n to recipes) — `id`, `recipe_id` (FK,
  `ON DELETE CASCADE`), `author` (VARCHAR, optional), `body` (TEXT, required),
  `created`.
- **Endpoints:**
  - `GET /api/recipes/{id}/notes` — notes for a recipe, newest first.
  - `POST /api/recipes/{id}/notes` — add a note (422 if body empty; 404 if recipe missing).
  - `DELETE /api/notes/{id}` — delete a note (404 if missing).
- **UI:** a "Notes" section on the detail page — the list (author + body + date),
  an add form (author optional, body required), a delete button per note.

## Rationale / Decisions

**Why personal notes, not social comments?** The app has no users/authentication,
so "comments" would be anonymous and low-value. Personal notes match the
single-user character of a recipe collection and need no identity system. (Decided
with the user.)

**Why a dedicated `NotesController`?** Notes are a sub-resource with their own
list/add/delete; keeping them out of the already-large `RecipesController` keeps
each controller focused.

**Why `author` free-text and optional?** Without accounts there is no real
identity; a free-text name is enough ("Me", "Anna") and may be left blank.

## Definition of Done

- [x] Migration creates `notes` with FK cascade; reversible
- [x] `GET /api/recipes/{id}/notes` lists notes newest-first; 404 for unknown recipe
- [x] `POST` adds a note (422 empty body, 404 unknown recipe); `DELETE /api/notes/{id}` removes it (404 unknown)
- [x] Deleting a recipe cascades its notes away
- [x] Detail page lists notes, adds a note, deletes a note
- [x] Tests: backend (list, add, validation, delete, cascade) + frontend (service + notes UI); browser-verified


**Verification (2026-06-18):** 59 backend + 36 frontend tests green; phpcs clean;
browser-verified add/list/delete; e2e regression green.
