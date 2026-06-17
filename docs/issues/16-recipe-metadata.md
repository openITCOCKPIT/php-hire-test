# #16 — Recipe metadata (temperature & duration)

**Epic:** F — Post-review enrichment
**Feature reference:** — (beyond the brief; closes a gap competitor PR #4 had)
**Effort:** 1 h
**Dependencies:** #4, #6, #9
**Status:** ✅ done

## Goal

Add optional cooking metadata — temperature (°C) and duration (minutes) — to a
recipe, so the domain model is as rich as the strongest competing submission.

## Description

- Migration adds `temperature` and `duration` (SMALLINT UNSIGNED, nullable) to
  `recipes`. Both optional.
- Model: validation (optional, integer, ranged 0–500 °C / 0–1440 min); entity
  `$_accessible`. Seed and fixture updated.
- API: included in all recipe responses; accepted on create/update.
- Frontend: optional number inputs in the form; badges on the detail page and
  list card; included in the e-mail template.

## Rationale / Decisions

**Why optional + nullable?** Not every recipe has a baking temperature or a fixed
time (e.g. a salad). Required fields would force meaningless values.

**Why SMALLINT UNSIGNED + ranged validation?** Temperature and duration are small
non-negative integers; the column type plus a 0–500 / 0–1440 validation range
means an out-of-range value is a clean 422, never a DB error — the same
"validation mirrors the column" principle used for `amount` in #6.

**Why add this at all (it is beyond the brief)?** Competitor PR #4 modelled
temperature and duration as first-class fields. Adding them keeps the domain
model competitive without over-reaching; everything else stays minimal.

## Definition of Done

- [x] Migration adds nullable temperature/duration; reversible
- [x] API returns and accepts both; out-of-range temperature → 422
- [x] Form has optional inputs; detail + list show badges; e-mail includes them
- [x] Tests: backend (view includes fields, persists on add, range 422) + frontend build/specs green

**Verification (2026-06-18):** 38 backend + 25 frontend tests green; phpcs clean.
