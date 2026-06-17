# Recipe Collection — Issue Overview

**Project:** AVENDIS GmbH Coding Challenge — PHP Developer Position
**Applicant branch:** `Psheikomaniac`
**Repository:** `Psheikomaniac/php-hire-test` (forked from `openITCOCKPIT/php-hire-test`)
**License:** MIT

## What is this?

A recipe collection web application built as a coding challenge for a PHP developer position at AVENDIS GmbH (creators of the open-source monitoring solution openITCOCKPIT). Users can browse, create, search, sort, and preview recipes, optionally sending them by e-mail.

**Stack:** CakePHP 5.x (pure JSON REST API) · Angular (current) + TypeScript · Bootstrap 5 · MySQL 8.0 · PHP 8.3 · nginx + PHP-FPM

Each issue below is a self-contained implementation unit. Work through them in order — dependencies are listed in each file. Once the MVP (#7) is done, the remaining issues in Epics C, D can be tackled in parallel.

---

## Issues

### Epic A — Project Setup & Infrastructure

| # | Title | Effort | Status |
|---|---|---|---|
| [#1](01-repository-setup.md) | Set up repository & development environment | 1–2 h | ✅ done |
| [#2](02-cakephp-skeleton.md) | Initialise CakePHP skeleton | 1 h | ✅ done |
| [#3](03-angular-project.md) | Initialise Angular project | 1–2 h | ✅ done |

### Epic B — Data Model & API Foundation

| # | Title | Effort | Status |
|---|---|---|---|
| [#4](04-database-schema.md) | Database schema & migrations | 1 h | ⬜ open |
| [#5](05-recipe-read-api.md) | Recipe read API (list & detail) | 2 h | ⬜ open |
| [#6](06-recipe-write-api.md) | Recipe write API | 2 h | ⬜ open |

### Epic C — Frontend Core Functions

| # | Title | Effort | Status |
|---|---|---|---|
| [#7](07-recipe-list-component.md) | RecipeService & display list | 2 h | ⬜ open |
| [#8](08-recipe-detail-view.md) | Detail view | 1–2 h | ⬜ open |
| [#9](09-create-recipe-form.md) | Create recipe (form) | 2–3 h | ⬜ open |

### Epic D — Advanced Features

| # | Title | Effort | Status |
|---|---|---|---|
| [#10](10-sorting.md) | Sorting | 1–2 h | ⬜ open |
| [#11](11-search.md) | Search | 1–2 h | ⬜ open |
| [#12](12-hover-preview.md) | AJAX hover preview *(centrepiece)* | 2–3 h | ⬜ open |
| [#13](13-email-sending.md) | E-mail sending *(optional — first to drop)* | 1–2 h | ⬜ open |

### Epic E — Polish & Submission

| # | Title | Effort | Status |
|---|---|---|---|
| [#14](14-user-friendliness.md) | User-friendliness | 2–3 h | ⬜ open |
| [#15](15-final-browser-test.md) | Final browser test & documentation | 1–2 h | ⬜ open |

---

## Critical Path

```
#1 (repo + env)
 └─► #2 (CakePHP skeleton)
      ├─► #3 (Angular project)
      └─► #4 (DB schema)
           └─► #5 (read API)
                ├─► #6 (write API)
                │    └─► #9 (create form)   ┐
                └─► #7 (list component) ◄───┘
                     ├─► #8 (detail view)   ┐
                     ├─► #10 (sorting)      │ parallelisable
                     ├─► #11 (search)       │ after #7
                     └─► #12 (hover preview)┘
                          └─► #14 (UX polish)
                               └─► #15 (final test + PR)

#13 (e-mail) ─ optional, depends on #5 only, independent
```

**MVP milestone:** after #7 the app is useful. Every subsequent issue is independently mergeable.

**Browser testing in three stages:**
- #12: continuously verify hover preview in all three browsers during development
- #14: cross-check core flows (list, create, detail) in Firefox, Chrome, Edge
- #15: full end-to-end run of all features in all three browsers

---

## Effort Summary

| Epic | Issues | Estimated effort |
|---|---|---|
| A — Setup & Infrastructure | #1–#3 | 3–5 h |
| B — Data Model & API | #4–#6 | 5 h |
| C — Frontend Core | #7–#9 | 5–7 h |
| D — Advanced Features | #10–#13 | 5–9 h |
| E — Polish & Submission | #14–#15 | 3–5 h |
| **Total** | **15 issues** | **~21–31 h** |

Issue #13 (e-mail) is the first candidate to drop if time runs short — it is explicitly optional in the original task description.

---

## Key Design Decisions (summary — full reasoning in each issue file)

| Decision | Choice | Rejected alternative | Why |
|---|---|---|---|
| PHP framework | CakePHP 5.x | Plain PHP | Matches openITCOCKPIT's actual stack; JSON API out of the box |
| `amount` data type | `DECIMAL(8,2)` | FLOAT, INT | No rounding errors; supports fractional amounts (1.5 l) |
| `unit` data type | `VARCHAR(50)` | ENUM | No migration needed for new units |
| Sorting / filtering | Server-side (ORM) | Client-side JS | Scales with pagination; single source of truth |
| Search debounce | `debounceTime(300)` | No debounce | Limits API calls to ~1 per 300 ms of inactivity |
| Hover preview operator | `switchMap` + `debounceTime(200)` | `mergeMap`, `concatMap`, no debounce | Cancels stale requests; debounce avoids requests for titles passed over in transit |
| Hover preview payload | Dedicated `GET /recipes/{id}/preview` | Reuse full `GET /recipes/{id}` | Trimmed payload (excerpt + ≤5 ingredients) for a high-frequency action |
| Hover cache | `Map<number, RecipePreview>` | Re-fetch every hover | No repeated requests for the same recipe in one session |
| Testing | PHPUnit + Karma/Jasmine, real assertions | No tests / `markTestIncomplete` stubs | None of the 4 prior challenge submissions shipped real tests — our clearest differentiator |

---

*Update the status column (⬜ → ✅) and mark the Definition of Done checkboxes in each issue file as work progresses.*
