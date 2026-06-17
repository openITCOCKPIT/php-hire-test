# #15 — Final browser test & documentation

**Epic:** E — Polish & Submission
**Feature reference:** —
**Effort:** 1–2 h
**Dependencies:** all previous issues
**Status:** ⬜ open

## Goal

Run a complete end-to-end verification of all features in Firefox, Chrome, and Edge, finalise the README with all architecture decisions and the Symfony→CakePHP note, review the commit history, and create the pull request — formally completing the AVENDIS coding challenge.

## Description

**1. Full end-to-end feature run (all three browsers):**
Go through the complete feature list in each browser and record the result:

| Feature | Firefox | Chrome | Edge |
|---|---|---|---|
| Browse recipe list | | | |
| Sort by title (A–Z) | | | |
| Sort by date (newest) | | | |
| Search by title | | | |
| Hover preview (AJAX) | | | |
| Open recipe detail | | | |
| Create new recipe | | | |
| Send recipe by e-mail (#13) | | | |

Fix any remaining browser-specific issues before moving to documentation.

**2. Finalise README:**
The README must include the following sections (stubs created in #1, now populated):

- **Project description** — one paragraph: what this is, why CakePHP, why Angular
- **Setup instructions** — Ubuntu 26.04 numbered command list (from #1) AND Docker Compose alternative
- **Architecture decisions** — summarise the key decisions made across the issues:
  - CakePHP 5.x as pure JSON API (not plain PHP)
  - Angular + Bootstrap 5 (task requirement; NgModule vs standalone trade-off)
  - `DECIMAL(8,2)` for ingredient amounts
  - `VARCHAR` for ingredient units
  - Server-side sort + search (ORM, whitelist)
  - RxJS `switchMap` (+ `debounceTime`) for hover preview
  - Dedicated lightweight `GET /recipes/{id}/preview` endpoint (small hover payload)
  - Client-side cache (`Map<number, RecipePreview>`)
  - `debounceTime(300)` for search
  - **Test coverage (PHPUnit + Karma/Jasmine) as a deliberate differentiator** — reference submissions to this challenge shipped with no real tests; ours does not
  - Symfony→CakePHP note (see below)
- **Note on Symfony→CakePHP** — explicitly state: "No Symfony was used in this project. The framework choice was CakePHP 5.x because the task offers CakePHP as an option and because openITCOCKPIT is built on CakePHP — using the same framework signals direct alignment with the team's stack."
- **Browser support** — confirmed working: Firefox [version], Chrome [version], Edge [version]
- **License** — MIT

**3. Review commit history:**
- Each commit should be atomic and have a meaningful imperative-mood message.
- If there are WIP or fix-up commits, consider squashing (only if on a local branch, not after push).
- Ensure no credential files, no `node_modules`, no `.env` in the history.

**4. Create pull request:**
- Base branch: `openITCOCKPIT/php-hire-test:master`
- Head branch: `Psheikomaniac/php-hire-test:Psheikomaniac`
- PR title: "Recipe Collection — AVENDIS coding challenge (Psheikomaniac)"
- PR description: feature list with checkboxes (completed), tech stack summary, notes for the reviewer (how to run the app, where to find the browser test results)

## Technical Notes

- The PR is the reviewer's entry point — the PR description and README together should answer every likely question before the reviewer asks it.
- Commit history is also evaluated: "We use GitHub and Jenkins" implies the team reads git history carefully.
- The Symfony→CakePHP note is important because a generic "PHP developer" might reach for Symfony as the default Laravel/Symfony PHP framework. Making the CakePHP choice explicit and reasoned shows deliberate decision-making.

## Rationale / Decisions

**Why document everything in the README rather than only in code comments?**
Code comments explain implementation details. The README explains architectural context — why the framework was chosen, why the environment was set up this way, what trade-offs were accepted. These are things a reviewer cannot infer from reading the code. The task's evaluation criterion ("we want to see not just what was built but why") is primarily served by the README.

**Why a pull request (PR) instead of a ZIP file?**
The task accepts both. A PR on GitHub is the professional developer workflow the AVENDIS team uses daily (GitHub + Jenkins). Submitting a PR demonstrates familiarity with the workflow; a ZIP is a fallback for people who couldn't get GitHub working. The PR also shows the commit history, branch structure, and CI status (if configured) — more information than a ZIP provides.

**Why not squash all commits into one?**
Squashing obscures the development sequence. The reviewer can see how the project evolved issue-by-issue. Each commit being atomic and descriptive (as defined in #1's commit conventions) is more valuable than a clean single commit. Squashing is only appropriate if there are truly embarrassing WIP messages — in which case interactive rebase on the local branch (before push) is acceptable.

**Why the Symfony→CakePHP clarification note?**
A reviewer skimming the PR might assume a PHP developer used Symfony (the dominant PHP framework in the enterprise space). Proactively addressing this — and explaining that CakePHP was chosen intentionally because it's the team's actual stack — shows that the decision was deliberate, not accidental. This converts a potential question mark into a strength.

## Definition of Done

- [ ] All features from the feature list work without errors in Firefox, Chrome, and Edge
- [ ] Browser compatibility table in the README is filled with actual version numbers
- [ ] README contains: project description, Ubuntu setup, Docker Compose setup, architecture decisions, Symfony→CakePHP note, browser support, MIT license
- [ ] No `.env`, no `node_modules`, no credentials in the git history
- [ ] Commit messages are in imperative mood, atomic, and meaningful
- [ ] Full automated test suite is green: backend (`vendor/bin/phpunit`) and frontend (`ng test --watch=false`) both pass; the test run is noted in the PR description
- [ ] Pull request created on GitHub: `openITCOCKPIT/php-hire-test` ← `Psheikomaniac/php-hire-test:Psheikomaniac`
- [ ] PR description explains how to run the app and where to find the browser test results
- [ ] All 15 issue status checkboxes in `docs/issues/README.md` are marked ✅ done
