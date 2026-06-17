# Implementation Log — #14 User-friendliness

**Issue:** [docs/issues/14-user-friendliness.md](../issues/14-user-friendliness.md)
**Status:** ✅ done · **Date:** 2026-06-18

---

## What was built / verified

```
frontend/src/app/components/not-found/*   # catch-all 404 page + spec
frontend/src/app/app.routes.ts            # ** wildcard route
frontend/e2e/cross-browser.mjs            # Firefox + Chromium smoke test
frontend/package.json                     # playwright devDep + "e2e" script
```

Most UX states (loading spinners, empty states, error alerts, disabled
submit-while-sending, inline validation) were built into each component as it was
created (#7–#13), so #14 was largely an audit + filling the remaining gaps +
responsive and cross-browser verification.

## Decisions made during implementation, and why

### 1. A catch-all `**` route → friendly 404
Previously an unknown frontend path (e.g. `/xyz`) rendered an empty
`router-outlet`. A `NotFound` component on a `**` wildcard now shows a clear
"Page not found" with a link back to the list — no dead ends.

### 2. UX-state audit (already in place, confirmed)
- **List**: spinner while loading, "No recipes yet" vs "No recipes match your
  search" empty states, error alert with Retry.
- **Detail**: spinner, distinct not-found vs error, JSON-404 handled.
- **Form**: inline `is-invalid` feedback, disabled submit + spinner while saving,
  server-422 mapped onto fields, form-level error for other failures.
- **Email modal**: sending spinner, success message, inline error.

### 3. Real cross-browser testing, not just Chromium
The challenge requires Firefox, Chrome and Edge. `e2e/cross-browser.mjs` drives
the core flows (list, search, hover preview, detail, create) in **Firefox** and
**Chromium** (Chromium shares its engine with Chrome and Edge) via Playwright and
asserts each step plus zero console errors. Both pass. The search step waits for
the filtered DOM state rather than a fixed delay, which is what made it reliable
in Firefox (a fixed 600 ms was flaky on Firefox cold-start).

### 4. Responsive check at 375 px
Verified the list (cards stack to a single column, search/sort controls wrap, the
navbar fits) and the create form (full-width fields, the ingredient row fits) on
an iPhone-SE-width viewport. Bootstrap's grid handles it; no custom breakpoints
needed — consistent with the "standard Bootstrap, no over-engineering" guard-rail.

## Verification

```
ng test                       # 25 specs green (NotFound spec added)
npm run e2e                    # Firefox PASS, Chromium PASS (5 flows + no console errors each)
Responsive (Playwright 375px)  # list + form usable, single-column

Browser matrix (core flows):
                     Firefox   Chrome/Edge (Chromium engine)
  list                 ✓            ✓
  search               ✓            ✓
  hover preview        ✓            ✓
  detail               ✓            ✓
  create               ✓            ✓
  no console errors    ✓            ✓
```

## Notes carried into #15

- `npm run e2e` is the repeatable cross-browser check; #15 runs the full feature
  set (incl. sort + e-mail) as the final pass and writes the README browser-support
  section from this matrix.
