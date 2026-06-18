# Implementation Log — #19 Recipe image

**Issue:** [docs/issues/19-recipe-image.md](../issues/19-recipe-image.md)
**Status:** ✅ done · **Date:** 2026-06-18

---

## What was built

```
api/config/Migrations/..._AddImageToRecipes.php   # +image_path (nullable)
api/src/Model/Entity/Recipe.php                    # image_path readable, not mass-assignable
api/src/Controller/RecipesController.php           # uploadImage() + deleteImage() + preview image_path
api/config/routes.php                              # POST/DELETE /api/recipes/{id}/image
api/.gitignore, api/webroot/uploads/.gitkeep       # ignore uploaded files
docker-compose.yml                                 # frontend nginx mounts uploads (serve /uploads)
frontend/src/app/shared/image-url.ts               # build the public image URL
frontend/.../recipe.service.ts                     # upload/delete image
frontend/.../recipe-detail.*                        # upload/replace/remove + display
frontend/.../recipe-list.*                          # image on card + hover preview
frontend/src/environments/*                         # uploadsBaseUrl
+ backend & frontend tests
```

## Decisions / notes

- **Files on disk, path in DB.** Images live in `api/webroot/uploads/recipes/`
  with random names; `recipes.image_path` stores the relative path. Not in the DB
  (blobs bloat it). The backend nginx serves them via its webroot; the frontend
  nginx mounts the same directory read-only, so `/uploads/...` works same-origin
  in the container and at `:8765/uploads/...` in dev. Verified the image loads on
  both `:8080/uploads/...` and `:8765/uploads/...`.
- **Separate upload endpoint** (`POST /recipes/{id}/image`, multipart) keeps the
  create/edit flow as clean JSON. `image_path` is **not mass-assignable** — only
  the upload sets it.
- **Validation in layers:** media type allow-list (jpeg/png/webp), size ≤ 5 MB,
  **and** a real-content check (`getimagesize`) that rejects a spoofed file (text
  sent as `image/png`) and cleans it up. Tests cover all of these.
- **Bug found in the browser:** the first upload wiped the displayed ingredients —
  `uploadImage()` returned the recipe **without** `contain('Ingredients')`, and the
  detail component replaced its recipe signal with that ingredient-less object.
  Fixed by eager-loading ingredients in the upload response (a regression test now
  asserts the response carries them). A good reminder that an endpoint reusing the
  read shape must return the full read shape.
- **Test uploads in PHPUnit** go through `configRequest(['files' => [...]])` with a
  `Laminas\Diactoros\UploadedFile`; passing the file in the POST data does not work
  (the data is cast to strings). A `tearDown` removes any files the tests wrote.

## Follow-up — image in the create/edit form

The upload endpoint needs an existing recipe id, so the first cut only offered
upload on the detail page — confusing when creating ("why can't I add a photo
now?"). The form now has a "Photo (optional)" field that holds the chosen file and
shows a local preview (`URL.createObjectURL`); on submit it **saves the recipe,
then uploads the image to the new id** (a `switchMap` second step over the
existing endpoint — no backend change), then navigates. An image failure does not
block navigation (the recipe is already saved). In edit mode the existing photo is
shown and can be replaced or removed (remove deletes it on save). Verified in the
browser: creating "Apfelkuchen" with a chosen photo persists the recipe with its
`image_path` and the photo appears on the list card.

## Verification

```
curl POST /image (valid png)      # 200, image_path set, file on disk, ingredients included
curl POST /image (text/plain)     # 422 (type)
curl POST /image (text as png)    # 422 (content) + file cleaned up
curl POST /image (5MB+1)          # 422 (size)
curl POST /9999/image             # 404 ; DELETE /image → removes file + clears path
vendor/bin/phpunit                # 50 tests green ; phpcs clean
ng test                           # 33 specs green

Browser (Playwright): upload a real PNG on the detail page → image shows + Replace/
Remove; the photo appears on the list card and in the hover preview; image served
same-origin in the container (:8080) and cross-origin in dev (:8765); 0 console errors.
```
