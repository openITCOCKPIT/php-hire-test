# #17 — Edit & delete recipes

**Epic:** F — Post-review enrichment
**Feature reference:** — (beyond the brief; closes a gap competitor PR #4 had)
**Effort:** 2 h
**Dependencies:** #6, #8, #9, #16
**Status:** ✅ done

## Goal

Let users update and delete recipes — full CRUD — closing the only real *feature*
gap the strongest competing submission (PR #4) had over this project.

## Description

- **Backend:** `PUT /recipes/{id}` (update + replace ingredients) and
  `DELETE /recipes/{id}` (cascade). Both JSON; 404 for unknown id; PUT reuses the
  create validation (title required, ≥1 ingredient, bounded amounts/metadata).
- **Frontend:** the create form is reused for edit at `/recipes/:id/edit` —
  it loads the recipe, prefills every field and rebuilds the ingredient rows, and
  PUTs on submit. The detail page gets **Edit**, **Delete** (with a confirm
  dialog) and the existing Share buttons.

## Rationale / Decisions

**Why reuse the create form for edit?** One component, one validation surface, one
template. An `editId` distinguishes the modes (title/button text, POST vs PUT,
redirect target). A separate edit component would duplicate the dynamic-ingredient
logic.

**Why a hasMany `replace` save strategy?** On edit the client sends the full
ingredient list; `replace` deletes ingredients no longer present and saves the
rest in one transaction — no orphans, no manual diffing. Harmless on create.

**Why `confirm()` for delete?** Deletion is destructive and irreversible; a
native confirm is the simplest honest guard. A custom modal would be nicer but is
over-engineering for the pragmatic UX bar.

**Why not edit/delete from the start?** The brief doesn't require them; they were
added only after the competitor analysis showed PR #4 shipping them.

## Definition of Done

- [x] `PUT /recipes/{id}` updates and **replaces** ingredients; 404/422 handled
- [x] `DELETE /recipes/{id}` deletes and cascades to ingredients; 404 handled
- [x] Edit form prefills all fields + ingredient rows; PUTs; redirects to detail
- [x] Detail page has Edit + Delete (confirm) buttons
- [x] Tests: backend (edit replace, 404, 422, delete cascade, 404) + frontend (service, edit-mode form, delete flow)

**Verification (2026-06-18):** 43 backend + 30 frontend tests green; browser-verified
edit (title + temperature changed, ingredients kept) and delete (confirm → removed
from list); 0 console errors.
