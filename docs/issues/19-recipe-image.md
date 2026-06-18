# #19 — Recipe image (one hero photo per recipe)

**Epic:** F — Post-review enrichment
**Feature reference:** — (user request: a photo to get an impression of the dish)
**Effort:** 2–3 h
**Dependencies:** #4, #5, #8, #18
**Status:** ✅ done

## Goal

Let a recipe carry a single hero photo, uploaded by the user and shown on the
list card, the detail page and the hover preview.

## Description

- **Schema:** `recipes.image_path` `VARCHAR(255)` nullable — stores the relative
  file path (e.g. `recipes/<random>.jpg`), not the image itself.
- **Storage & serving:** files live on disk under `api/webroot/uploads/recipes/`
  (not in the DB — blobs bloat the DB and backups). The backend nginx serves them
  via its webroot at `/uploads/...`; the frontend nginx serves the same directory
  (bind-mounted read-only) so `/uploads/...` works same-origin in the container.
  The image URL is `{uploadsBaseUrl}/uploads/{image_path}` — empty base (same
  origin) in prod, `http://localhost:8765` in dev.
- **Endpoints:**
  - `POST /api/recipes/{id}/image` (multipart, field `image`) — validates type
    (jpeg/png/webp), size (≤ 5 MB) and real image content; stores the file with a
    random name; sets `image_path`; returns the recipe. 404 unknown id, 422 invalid.
  - `DELETE /api/recipes/{id}/image` — deletes the file and clears `image_path`.
- **UI:** an image area on the detail page (and edit form): upload / replace /
  remove. The photo shows large on the detail page, small on the list card and in
  the hover preview; a neutral placeholder when there is none.

## Rationale / Decisions

**Why a separate upload endpoint, not the create form?** Keeps the create/edit
flow clean JSON; the image is a decoupled multipart step (upload/replace anytime).
Mixing recipe JSON and a file in one multipart request is needlessly complex.

**Why files on disk + path in DB, served by nginx?** Standard, scalable, keeps the
DB small; nginx serves static files efficiently. A shared bind-mounted directory
makes `/uploads/` work in both the single-origin container and the dev split.

**Why random filenames + real-content validation?** Random names avoid collisions
and guessing; checking the actual image (`getimagesize`) on top of the media type
rejects spoofed files.

**No server-side resizing/thumbnails** (YAGNI) — a size limit plus browser-side
display sizing is enough; can be added later.

## Definition of Done

- [x] Migration adds nullable `image_path`; reversible
- [x] `POST /api/recipes/{id}/image` stores a valid image and sets `image_path`; rejects wrong type/size/content with 422; 404 for unknown id
- [x] `DELETE /api/recipes/{id}/image` removes the file and clears `image_path`
- [x] `image_path` included in list, detail and preview responses
- [x] Detail page can upload / replace / remove; image shown on detail, card, hover preview; placeholder when absent
- [x] Tests: backend (happy path + ingredients, bad type, spoofed content, too large, 404, delete) + frontend (service + upload UI); browser-verified

**Verification (2026-06-18):** 50 backend + 33 frontend tests green; phpcs clean;
browser-verified upload/display on detail, card and hover preview, same-origin
(:8080) and dev (:8765).
