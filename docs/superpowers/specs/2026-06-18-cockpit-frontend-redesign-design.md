# Design Spec — „Cockpit" Frontend Redesign (Recipe Collection)

**Date:** 2026-06-18
**Component:** `frontend/` (Angular 20 + Bootstrap 5.3)
**Status:** Approved direction, pending spec review

---

## 1. Goal

Replace the current stock-Bootstrap look of the Recipe Collection frontend with a
modern, user-friendly, openITCOCKPIT-inspired design — **Direction A „Cockpit"**:
a dark-first dashboard aesthetic with a left **filter sidebar**, a top bar, and
violet/green accents — while staying **simple** (no enterprise density).

The redesign is **theming-led, not a rewrite**: HTML structure changes only where a
component needs new layout (app shell, list/detail page scaffolding). Visual identity
comes from a token system in `styles.scss` plus Bootstrap 5.3 CSS variables and
`data-bs-theme`.

Approved decisions (from brainstorming):
- **Direction A „Cockpit"** — dark + left sidebar.
- **Sidebar = filters** (search, duration, ingredient count, sort), not navigation.
  Filters must actually work — no decorative dead controls.
- **Light + dark**, toggleable via a top-bar control, persisted.

---

## 2. Design Principles & Constraints

- **Continue existing patterns.** Angular standalone components, signals, control-flow
  (`@if`/`@for`), Bootstrap utility classes. No new UI framework, no CSS-in-TS.
- **Theme via tokens.** All colors flow from CSS custom properties so a second theme
  is a variable swap, not a re-style.
- **Minimal template churn.** Re-skin first; restructure only the app shell, the list
  page (to add the sidebar), and the detail hero. Detail/form internals keep their
  Angular logic and only get themed markup/classes.
- **Cover every real state.** Loading, empty, error, not-found, validation errors,
  image-upload busy, notes, and the mail modal all get the new styling.
- **Accessible in both themes.** WCAG AA contrast, visible focus rings, keyboard-
  operable sidebar/toggle, `aria` on icon-only controls.
- **Responsive.** Sidebar collapses to a top filter bar / drawer below the `lg`
  breakpoint; card grid reflows 3 → 2 → 1 columns.

---

## 3. Design Tokens

Defined once in `src/styles.scss`, scoped by theme. Dark is the default
(`<html data-bs-theme="dark" data-theme="cockpit-dark">`).

| Token | Dark | Light | Use |
|---|---|---|---|
| `--app-bg` | `#0f1117` | `#f4f5f7` | page background |
| `--surface` | `#171a24` | `#ffffff` | sidebar, top bar |
| `--surface-2` | `#1a1e2b` | `#ffffff` | cards, panels |
| `--surface-3` | `#1d2130` | `#f1f2f5` | inputs, hover, chips |
| `--border` | `#262b3b` | `#e6e8ee` | card/input borders |
| `--border-soft` | `#232735` | `#eef0f3` | dividers |
| `--text` | `#e8eaf0` | `#1f2330` | primary text |
| `--muted` | `#9aa0ad` | `#6b7080` | secondary text |
| `--faint` | `#7e8595` | `#9398a6` | placeholders, labels |
| `--accent` | `#8b7bf0` | `#6d5cff` | active/selected/links/focus |
| `--accent-strong` | `#6d5cff` | `#5847f0` | gradients, hover |
| `--accent-soft` | `rgba(139,123,240,.16)` | `rgba(109,92,255,.10)` | chip/active fills |
| `--success` | `#22c55e` | `#16a34a` | positive actions, duration badge |
| `--success-soft` | `rgba(34,197,94,.15)` | `#e9f9ee` | badge fill |
| `--danger` | `#ef4444` | `#dc2626` | delete, validation |
| `--shadow` | `0 12px 30px rgba(0,0,0,.45)` | `0 6px 18px rgba(30,30,60,.07)` | card/hover elevation |

Other tokens: radius `--r-card: 10px`, `--r-control: 9px`, `--r-pill: 999px`;
font stack = system UI sans; base size 14–15px.

**Accent semantics (matches openITCOCKPIT):**
- **Violet** = state/identity: active filter, selected, links, focus ring, brand, avatar, edit.
- **Green** = positive primary action: New recipe, Save, Send mail, duration/“ok” badge.
- **Red** = destructive: delete recipe/note/image.

These map onto Bootstrap by overriding `--bs-primary` → violet and using a green
utility/button variant for positive actions (so `btn-primary` stays violet, positive
actions use an explicit green class).

---

## 4. Theme Switching

- Toggle button (🌙/☀️) in the top bar.
- Writes `data-bs-theme` (`dark`/`light`) **and** `data-theme` on `<html>`.
- Persisted in `localStorage` (`recipe-theme`); first load falls back to
  `prefers-color-scheme`.
- Implemented as a tiny `ThemeService` (signal-based) injected by the app shell —
  continues the existing service pattern (`RecipeService`).

---

## 5. App Shell (`app.ts` / `app.html` / `app.scss`)

Replaces the current single top navbar with a **sidebar + top bar** layout.

- **Sidebar (`< lg`: collapses):**
  - Brand: 🍳 Recipes (links to list).
  - **Search** field (moves here from the navbar; keeps the existing debounced,
    server-side search behavior).
  - **Filter — Duration:** chips `Alle · <15 · 15–30 · 30–60 · >60 min`.
  - **Filter — Ingredients:** chips `Alle · 1–5 · 6–10 · 11+`.
  - **Sort:** chips/segmented `Neueste · Älteste · A–Z` (replaces the current
    `<select>`; keeps server-side sort).
  - **Reset filters** link.
- **Top bar:** breadcrumb (e.g. `Rezepte / Spaghetti Carbonara`), spacer,
  **theme toggle**, **+ New Recipe** (green), avatar.
- **Main:** `<router-outlet>` in a scrollable content area.

> The sidebar lives in the shell, but its **filter state** must reach the list.
> Approach: a small signal-based `RecipeFilterService` (or query-param binding) that
> the shell writes and the list reads. Final mechanism is a planning decision
> (see §9), but the design assumes shared filter state.

---

## 6. Component Mapping

### 6.1 Recipe List (`recipe-list`)
- 3-column responsive card grid (existing `card`s, re-skinned to `--surface-2`,
  `--border`, hover = violet border + shadow).
- Card: gradient/photo thumb, title (violet link, keeps `stretched-link` +
  hover-preview), date · ingredient count, **green duration badge**.
- Sort `<select>` and the search move into the sidebar; list head shows title +
  result count + active-filter summary.
- **Search + sort stay server-side** (current behavior). **Duration + ingredient
  filters are client-side** over the loaded list (simplest honest option; the list
  loads the full set). Empty/loading/error states re-skinned.
- Keep the **hover preview card** (`recipe-preview`), themed.

### 6.2 Recipe Detail (`recipe-detail`)
- **Hero panel:** photo left, title + meta + actions right. Meta pills:
  📅 date, **green duration badge**, 🌡 temperature pill (when set), 🧂 ingredient
  count. Actions: **Edit** (violet outline), **Share by e-mail** (green),
  **Delete** (red outline).
- **Two-column panels:** Ingredients (themed `list-group` → panel rows) and
  Description (`white-space: pre-line` preserved).
- **Image upload** control (upload/replace/remove + busy spinner + error text)
  re-skinned to themed buttons; “No photo yet” placeholder uses `--surface-3`.
- **Notes** section: themed list (body, author · date, delete) + add-note form
  (name + textarea + add button). Keep all existing signals/logic.
- **Mail modal:** themed Bootstrap modal (header/body/footer, success/sending/error
  states, `is-invalid` styling via `--danger`).
- Loading / not-found / error states re-skinned.

### 6.3 Recipe Form (`recipe-form`)
- Themed inputs with **violet focus ring** (`--accent-soft`), labels in `--muted`.
- Fields: Title, Description, Temperature (°C) + Duration (min) side-by-side,
  Photo upload, **Ingredients `FormArray`** rows (Name / Amount / Unit / remove `×`,
  min 1 enforced as today), **+ Add ingredient**.
- Validation: `is-invalid` + `invalid-feedback` recolored to `--danger`.
- Footer: **Save / Save changes** (green), Cancel (ghost). Edit vs New title kept.

### 6.4 Not Found (`not-found`)
- Centered themed empty state with a violet “Back to recipes” link.

### 6.5 Global (`styles.scss`)
- Token definitions (both themes), Bootstrap variable overrides
  (`--bs-primary`, body bg/color, `--bs-border-color`, link color, focus ring),
  base typography, scrollbar tint, helper classes (`.btn-success`-positive,
  `.chip`, `.panel`, `.app-sidebar`, etc.).

---

## 7. Accessibility

- Verify AA contrast for text/badges/chips in **both** themes.
- Visible focus ring (violet) on all interactive elements.
- Theme toggle and icon buttons get `aria-label`; toggle exposes `aria-pressed`.
- Sidebar collapsible region keyboard-operable; filter chips are real buttons with
  `aria-pressed`.
- Preserve existing `aria-label`s (search, remove ingredient, delete note).

---

## 8. Testing (per project workflow)

- **Re-run all existing specs** (`*.spec.ts`) — re-skin must not break behavior.
- Add/extend tests:
  - `ThemeService`: default from system pref, toggle, localStorage persistence.
  - List filters: duration & ingredient-count client-side filtering (happy path,
    boundaries `<15`/`>60`, `11+`, “no match” empty state, reset).
  - Sidebar ↔ list filter wiring.
- Where the redesign **consolidates** controls (e.g. sort moves to sidebar), update
  or remove the now-duplicated assertions rather than leaving dead tests.
- Run linter/formatter; zero failing tests before any commit.

---

## 9. Open Decisions (resolve in the plan)

1. **Filter state transport:** shared `RecipeFilterService` signal vs route query
   params. Recommendation: signal service (simpler, no router churn); query params
   only if shareable-URL filtering is wanted.
2. **Duration/ingredient filtering location:** client-side (recommended, list loads
   full set) vs new API query params (consistent with server-side search/sort but
   more backend work). Recommendation: start client-side.
3. **Thumbnails when no photo:** keep current text placeholder vs a themed
   gradient+emoji tile (mockup style). Recommendation: themed gradient placeholder
   for visual consistency; real uploads still win.

---

## 10. Non-Goals (YAGNI)

- No Favorites, Categories/Tags, or other new nav destinations.
- No backend/domain changes beyond optional filter query params (decision §9.2).
- No pagination/infinite scroll changes.
- No icon-library dependency — emoji + existing inline SVGs only.

---

## 11. Affected Files

```
frontend/src/styles.scss                         (tokens, Bootstrap overrides — main)
frontend/src/index.html                          (data-bs-theme / data-theme on <html>)
frontend/src/app/app.html | app.ts | app.scss    (sidebar + top bar + theme toggle)
frontend/src/app/services/theme.service.ts       (new)
frontend/src/app/services/recipe-filter.service.ts (new, if signal approach)
frontend/src/app/components/recipe-list/*         (sidebar wiring, card re-skin, filters)
frontend/src/app/components/recipe-detail/*       (hero, panels, notes, modal, states)
frontend/src/app/components/recipe-form/*         (themed inputs, focus, validation)
frontend/src/app/components/not-found/*           (themed empty state)
.gitignore                                        (add .superpowers/)
```

---

## 12. Rollout

Per project workflow, one logical change per PR. Suggested order:
1. Tokens + global theme + `ThemeService` + shell (sidebar/top bar/toggle).
2. Recipe list (cards + working filters).
3. Recipe detail (hero, panels, notes, modal, states).
4. Recipe form (themed inputs, validation).
5. Not-found + final a11y/contrast pass.

Each step: implement → tests green → commit → PR → review → push.
