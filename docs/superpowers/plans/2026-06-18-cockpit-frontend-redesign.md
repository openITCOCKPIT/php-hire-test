# Cockpit Frontend Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Re-skin the Angular Recipe Collection frontend into the dark-first, openITCOCKPIT-inspired "Cockpit" design (light + dark, filter sidebar) without changing app behavior.

**Architecture:** Theming-led. A token layer in `styles.scss` overrides Bootstrap 5.3 CSS variables (`--bs-*`) so existing Bootstrap components (`.card`, `.btn`, `.form-control`, `.modal`, `.alert`, `.list-group`) re-theme for free in both modes. Two small signal services (`ThemeService`, `RecipeFilterService`) hold theme + filter state. The app shell becomes sidebar + top bar; search stays URL-based; duration/ingredient filters are client-side; sort stays server-side.

**Tech Stack:** Angular 20 (standalone, signals, `@if`/`@for`), Bootstrap 5.3, SCSS, Karma + Jasmine.

**Scope guards:**
- **UI text stays English** (existing specs assert English strings). German was only for design discussion.
- Keep Bootstrap `.card` class and all asserted text/classes (see each task).
- No backend changes. No new nav destinations. No icon library (emoji + existing inline SVG).

**Test command (single run):**
```bash
cd frontend && npm test -- --watch=false --browsers=ChromeHeadless
```
Expected baseline before starting: all 6 spec files green.

---

## File Structure

```
frontend/src/index.html                                  MODIFY  data-bs-theme/data-theme on <html>
frontend/src/styles.scss                                 MODIFY  token layer + Bootstrap var overrides + shell/chip/panel classes
frontend/src/app/services/theme.service.ts               CREATE  theme signal, toggle, persistence
frontend/src/app/services/theme.service.spec.ts          CREATE
frontend/src/app/services/recipe-filter.service.ts       CREATE  sort/duration/ingredient signals + matches()
frontend/src/app/services/recipe-filter.service.spec.ts  CREATE
frontend/src/app/app.ts                                   MODIFY  inject services, breadcrumb, filter handlers; drop search-collapse
frontend/src/app/app.html                                 MODIFY  sidebar + top bar + router-outlet
frontend/src/app/app.scss                                 MODIFY  shell layout + responsive
frontend/src/app/app.spec.ts                              MODIFY  drop collapse test, keep navigate tests
frontend/src/app/components/recipe-list/recipe-list.ts    MODIFY  read filter service, filteredRecipes computed, sort effect
frontend/src/app/components/recipe-list/recipe-list.html  MODIFY  iterate filteredRecipes, themed cards, filter-empty state
frontend/src/app/components/recipe-list/recipe-list.spec.ts MODIFY update sort test, add filter tests
frontend/src/app/components/recipe-detail/recipe-detail.html MODIFY hero + panels + themed notes/modal (logic untouched)
frontend/src/app/components/recipe-detail/recipe-detail.scss MODIFY hero/panel helpers
frontend/src/app/components/recipe-form/recipe-form.html   MODIFY  themed classes, positive button (logic untouched)
frontend/src/app/components/not-found/not-found.ts         MODIFY  themed empty state (template inline)
.gitignore                                                 DONE    (.superpowers/ already added)
```

---

## Task 1: Theme token layer (`styles.scss` + `index.html`)

**Files:**
- Modify: `frontend/src/index.html`
- Modify: `frontend/src/styles.scss`

No unit test (pure CSS). Verification = build succeeds + all existing specs stay green + manual visual check.

- [ ] **Step 1: Set the default theme attributes on `<html>`**

In `frontend/src/index.html`, change the opening tag:

```html
<html lang="en" data-bs-theme="dark" data-theme="cockpit-dark">
```

- [ ] **Step 2: Write the token layer in `styles.scss`**

Replace the contents of `frontend/src/styles.scss` with:

```scss
/* Cockpit design system — token layer over Bootstrap 5.3.
   Overriding --bs-* variables re-themes Bootstrap components in both modes. */

:root {
  --r-card: 10px;
  --r-control: 9px;
  --r-pill: 999px;
}

/* ---------- DARK (default) ---------- */
[data-bs-theme='dark'] {
  --app-bg: #0f1117;
  --surface: #171a24;
  --surface-2: #1a1e2b;
  --surface-3: #1d2130;
  --border: #262b3b;
  --border-soft: #232735;
  --text: #e8eaf0;
  --muted: #9aa0ad;
  --faint: #7e8595;
  --accent: #8b7bf0;
  --accent-strong: #6d5cff;
  --accent-soft: rgba(139, 123, 240, 0.16);
  --success: #22c55e;
  --success-soft: rgba(34, 197, 94, 0.15);
  --success-text: #4ade80;
  --success-strong: #16a34a;
  --success-ink: #04140a;
  --shadow: 0 12px 30px rgba(0, 0, 0, 0.45);

  /* Map onto Bootstrap */
  --bs-body-bg: var(--app-bg);
  --bs-body-color: var(--text);
  --bs-primary: var(--accent);
  --bs-primary-rgb: 139, 123, 240;
  --bs-success: var(--success);
  --bs-success-rgb: 34, 197, 94;
  --bs-border-color: var(--border);
  --bs-secondary-color: var(--muted);
  --bs-tertiary-bg: var(--surface-3);
  --bs-card-bg: var(--surface-2);
  --bs-card-border-color: var(--border);
  --bs-emphasis-color: var(--text);
  --bs-link-color: var(--accent);
  --bs-link-hover-color: var(--accent-strong);
}

/* ---------- LIGHT ---------- */
[data-bs-theme='light'] {
  --app-bg: #f4f5f7;
  --surface: #ffffff;
  --surface-2: #ffffff;
  --surface-3: #f1f2f5;
  --border: #e6e8ee;
  --border-soft: #eef0f3;
  --text: #1f2330;
  --muted: #6b7080;
  --faint: #9398a6;
  --accent: #6d5cff;
  --accent-strong: #5847f0;
  --accent-soft: rgba(109, 92, 255, 0.1);
  --success: #16a34a;
  --success-soft: #e9f9ee;
  --success-text: #15803d;
  --success-strong: #1a9e48;
  --success-ink: #04140a;
  --shadow: 0 6px 18px rgba(30, 30, 60, 0.07);

  --bs-body-bg: var(--app-bg);
  --bs-body-color: var(--text);
  --bs-primary: var(--accent);
  --bs-primary-rgb: 109, 92, 255;
  --bs-success: var(--success);
  --bs-success-rgb: 22, 163, 74;
  --bs-border-color: var(--border);
  --bs-secondary-color: var(--muted);
  --bs-tertiary-bg: var(--surface-3);
  --bs-card-bg: var(--surface-2);
  --bs-card-border-color: var(--border);
  --bs-emphasis-color: var(--text);
  --bs-link-color: var(--accent);
  --bs-link-hover-color: var(--accent-strong);
}

body {
  background: var(--app-bg);
  color: var(--text);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
}

/* Visible violet focus ring everywhere */
:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px var(--app-bg), 0 0 0 4px var(--accent);
  border-color: var(--accent);
}

/* Positive primary action = green (New recipe, Save, Send) */
.btn-success {
  --bs-btn-color: var(--success-ink);
  --bs-btn-hover-color: var(--success-ink);
  --bs-btn-bg: var(--success);
  --bs-btn-border-color: var(--success);
  --bs-btn-hover-bg: var(--success-strong);
  --bs-btn-hover-border-color: var(--success-strong);
  --bs-btn-active-bg: var(--success-strong);
  --bs-btn-active-border-color: var(--success-strong);
}

/* Duration / "ok" badge */
.badge-duration {
  background: var(--success-soft);
  color: var(--success-text);
  font-weight: 600;
}

/* ---------- App shell ---------- */
.app-shell {
  display: flex;
  min-height: 100vh;
}
.app-sidebar {
  width: 240px;
  flex: none;
  background: var(--surface);
  border-right: 1px solid var(--border-soft);
  padding: 16px 14px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.app-main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}
.app-topbar {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 22px;
  background: var(--surface);
  border-bottom: 1px solid var(--border-soft);
}
.app-content {
  flex: 1;
  padding: 22px 24px 32px;
}

.sidebar-brand {
  font-weight: 700;
  font-size: 17px;
  display: flex;
  align-items: center;
  gap: 9px;
  color: var(--text);
  text-decoration: none;
  padding: 4px 6px 10px;
}
.sidebar-brand .logo {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  background: linear-gradient(135deg, var(--accent), var(--accent-strong));
}
.sidebar-label {
  font-size: 10px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--faint);
  margin: 14px 0 8px;
  padding: 0 4px;
}

.filter-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.filter-chip {
  font-size: 12px;
  padding: 6px 11px;
  border-radius: var(--r-pill);
  border: 1px solid var(--border);
  color: var(--muted);
  background: transparent;
  cursor: pointer;
}
.filter-chip.active {
  background: var(--accent-soft);
  border-color: var(--accent);
  color: var(--accent);
}
.filter-reset {
  margin-top: auto;
  font-size: 12.5px;
  color: var(--accent);
  background: none;
  border: none;
  text-align: left;
  padding: 8px 4px;
  cursor: pointer;
}

.topbar-crumb {
  font-size: 13px;
  color: var(--muted);
}
.topbar-crumb b {
  color: var(--text);
}
.icon-btn {
  width: 36px;
  height: 36px;
  border-radius: var(--r-control);
  border: 1px solid var(--border);
  background: var(--surface-3);
  color: var(--muted);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.topbar-avatar {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent), var(--accent-strong));
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 600;
}

/* ---------- Content panels (detail view) ---------- */
.panel {
  background: var(--surface-2);
  border: 1px solid var(--border);
  border-radius: var(--r-card);
  padding: 18px 20px;
}

/* Themed gradient placeholder when a recipe has no photo */
.thumb-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 42px;
  background: linear-gradient(135deg, var(--surface-3), var(--surface-2));
  color: var(--faint);
}

/* Card hover lift */
.recipe-card:hover {
  border-color: var(--accent);
  box-shadow: var(--shadow);
}

/* Sidebar collapses to a horizontal filter bar on small screens */
@media (max-width: 992px) {
  .app-shell {
    flex-direction: column;
  }
  .app-sidebar {
    width: 100%;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px;
    border-right: none;
    border-bottom: 1px solid var(--border-soft);
  }
  .filter-reset {
    margin-top: 0;
  }
}
```

- [ ] **Step 3: Verify build + existing specs stay green**

Run:
```bash
cd frontend && npm run build && npm test -- --watch=false --browsers=ChromeHeadless
```
Expected: build succeeds; all existing specs still pass (this task adds no markup, so nothing should break).

- [ ] **Step 4: Commit**

```bash
git add frontend/src/index.html frontend/src/styles.scss
git commit -m "Add Cockpit theme token layer over Bootstrap"
```

---

## Task 2: ThemeService (TDD)

**Files:**
- Create: `frontend/src/app/services/theme.service.ts`
- Create: `frontend/src/app/services/theme.service.spec.ts`

- [ ] **Step 1: Write the failing test**

Create `frontend/src/app/services/theme.service.spec.ts`:

```ts
import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  beforeEach(() => localStorage.removeItem('recipe-theme'));
  afterEach(() => {
    localStorage.removeItem('recipe-theme');
    document.documentElement.setAttribute('data-bs-theme', 'dark');
  });

  it('uses the stored theme when one is saved', () => {
    localStorage.setItem('recipe-theme', 'light');
    const service = TestBed.inject(ThemeService);
    expect(service.theme()).toBe('light');
    expect(document.documentElement.getAttribute('data-bs-theme')).toBe('light');
  });

  it('toggles, reflects to the document, and persists', () => {
    const service = TestBed.inject(ThemeService);
    const start = service.theme();
    service.toggle();
    const flipped = start === 'dark' ? 'light' : 'dark';
    expect(service.theme()).toBe(flipped);
    expect(document.documentElement.getAttribute('data-bs-theme')).toBe(flipped);
    expect(localStorage.getItem('recipe-theme')).toBe(flipped);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd frontend && npm test -- --watch=false --browsers=ChromeHeadless --include='**/theme.service.spec.ts'`
Expected: FAIL — cannot find module `./theme.service`.

- [ ] **Step 3: Write the implementation**

Create `frontend/src/app/services/theme.service.ts`:

```ts
import { Injectable, inject, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';

export type Theme = 'dark' | 'light';
const STORAGE_KEY = 'recipe-theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly doc = inject(DOCUMENT);
  readonly theme = signal<Theme>('dark');

  constructor() {
    this.set(this.initial());
  }

  toggle(): void {
    this.set(this.theme() === 'dark' ? 'light' : 'dark');
  }

  set(theme: Theme): void {
    this.theme.set(theme);
    const html = this.doc.documentElement;
    html.setAttribute('data-bs-theme', theme);
    html.setAttribute('data-theme', theme === 'dark' ? 'cockpit-dark' : 'cockpit-light');
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* storage unavailable — ignore */
    }
  }

  private initial(): Theme {
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    if (stored === 'dark' || stored === 'light') return stored;
    const prefersLight = this.doc.defaultView?.matchMedia?.('(prefers-color-scheme: light)').matches;
    return prefersLight ? 'light' : 'dark';
  }
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `cd frontend && npm test -- --watch=false --browsers=ChromeHeadless --include='**/theme.service.spec.ts'`
Expected: PASS (2 specs).

- [ ] **Step 5: Commit**

```bash
git add frontend/src/app/services/theme.service.ts frontend/src/app/services/theme.service.spec.ts
git commit -m "Add ThemeService for dark/light theme persistence"
```

---

## Task 3: RecipeFilterService (TDD)

**Files:**
- Create: `frontend/src/app/services/recipe-filter.service.ts`
- Create: `frontend/src/app/services/recipe-filter.service.spec.ts`

Bucket definitions (document in code):
- Duration: `lt15` = `<15`; `15to30` = `15..30`; `30to60` = `31..60`; `gt60` = `>60`. Recipes with `duration === null` match only `all`.
- Ingredients: `1to5`, `6to10`, `11plus` by `ingredients.length`.

- [ ] **Step 1: Write the failing test**

Create `frontend/src/app/services/recipe-filter.service.spec.ts`:

```ts
import { TestBed } from '@angular/core/testing';
import { RecipeFilterService } from './recipe-filter.service';
import { Recipe } from '../models/recipe';

function recipe(duration: number | null, ingredientCount: number): Recipe {
  return {
    id: 1,
    title: 't',
    description: null,
    temperature: null,
    duration,
    image_path: null,
    created: '2026-06-15T00:00:00+00:00',
    ingredients: Array.from({ length: ingredientCount }, (_, i) => ({
      id: i,
      recipe_id: 1,
      name: 'x',
      amount: '1.00',
      unit: 'g',
    })),
  };
}

describe('RecipeFilterService', () => {
  let service: RecipeFilterService;
  beforeEach(() => (service = TestBed.inject(RecipeFilterService)));

  it('matches everything with the default filters', () => {
    expect(service.matches(recipe(5, 3))).toBeTrue();
    expect(service.matches(recipe(null, 0))).toBeTrue();
  });

  it('filters by duration buckets at the boundaries', () => {
    service.duration.set('15to30');
    expect(service.matches(recipe(15, 1))).toBeTrue();
    expect(service.matches(recipe(30, 1))).toBeTrue();
    expect(service.matches(recipe(31, 1))).toBeFalse();
    expect(service.matches(recipe(14, 1))).toBeFalse();
    expect(service.matches(recipe(null, 1))).toBeFalse();
  });

  it('filters by ingredient count buckets', () => {
    service.ingredients.set('11plus');
    expect(service.matches(recipe(20, 11))).toBeTrue();
    expect(service.matches(recipe(20, 10))).toBeFalse();
  });

  it('reset returns every filter to its default', () => {
    service.sort.set('title-ASC');
    service.duration.set('gt60');
    service.ingredients.set('6to10');
    service.reset();
    expect(service.sort()).toBe('created-DESC');
    expect(service.duration()).toBe('all');
    expect(service.ingredients()).toBe('all');
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd frontend && npm test -- --watch=false --browsers=ChromeHeadless --include='**/recipe-filter.service.spec.ts'`
Expected: FAIL — cannot find module `./recipe-filter.service`.

- [ ] **Step 3: Write the implementation**

Create `frontend/src/app/services/recipe-filter.service.ts`:

```ts
import { Injectable, signal } from '@angular/core';
import { Recipe } from '../models/recipe';

export type SortOption = 'created-DESC' | 'created-ASC' | 'title-ASC' | 'title-DESC';
export type DurationFilter = 'all' | 'lt15' | '15to30' | '30to60' | 'gt60';
export type IngredientFilter = 'all' | '1to5' | '6to10' | '11plus';

@Injectable({ providedIn: 'root' })
export class RecipeFilterService {
  readonly sort = signal<SortOption>('created-DESC');
  readonly duration = signal<DurationFilter>('all');
  readonly ingredients = signal<IngredientFilter>('all');

  reset(): void {
    this.sort.set('created-DESC');
    this.duration.set('all');
    this.ingredients.set('all');
  }

  /** Client-side predicate for duration + ingredient-count filters. */
  matches(recipe: Recipe): boolean {
    return this.matchesDuration(recipe.duration) && this.matchesIngredients(recipe.ingredients.length);
  }

  private matchesDuration(d: number | null): boolean {
    switch (this.duration()) {
      case 'all':
        return true;
      case 'lt15':
        return d != null && d < 15;
      case '15to30':
        return d != null && d >= 15 && d <= 30;
      case '30to60':
        return d != null && d > 30 && d <= 60;
      case 'gt60':
        return d != null && d > 60;
    }
  }

  private matchesIngredients(n: number): boolean {
    switch (this.ingredients()) {
      case 'all':
        return true;
      case '1to5':
        return n >= 1 && n <= 5;
      case '6to10':
        return n >= 6 && n <= 10;
      case '11plus':
        return n >= 11;
    }
  }
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `cd frontend && npm test -- --watch=false --browsers=ChromeHeadless --include='**/recipe-filter.service.spec.ts'`
Expected: PASS (4 specs).

- [ ] **Step 5: Commit**

```bash
git add frontend/src/app/services/recipe-filter.service.ts frontend/src/app/services/recipe-filter.service.spec.ts
git commit -m "Add RecipeFilterService for sort and client-side filters"
```

---

## Task 4: App shell — sidebar + top bar + theme toggle

**Files:**
- Modify: `frontend/src/app/app.ts`
- Modify: `frontend/src/app/app.html`
- Modify: `frontend/src/app/app.scss`
- Modify: `frontend/src/app/app.spec.ts`

Behavior changes: search becomes an always-visible sidebar field (keeps debounced → URL navigation; **drops** the collapse mechanism). Sidebar shows the filter chips bound to `RecipeFilterService`. Top bar shows a router-derived breadcrumb, the theme toggle, "New Recipe", and an avatar.

- [ ] **Step 1: Rewrite the component**

Replace `frontend/src/app/app.ts` with:

```ts
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, debounceTime, distinctUntilChanged, filter } from 'rxjs';
import { ThemeService } from './services/theme.service';
import {
  DurationFilter,
  IngredientFilter,
  RecipeFilterService,
  SortOption,
} from './services/recipe-filter.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly theme = inject(ThemeService);
  protected readonly filters = inject(RecipeFilterService);

  protected readonly title = signal('Recipe Collection');
  protected searchTerm = '';
  private readonly term$ = new Subject<string>();

  // Router-derived breadcrumb label for the current page.
  private readonly currentUrl = signal(this.router.url);
  protected readonly crumb = computed(() => {
    const url = this.currentUrl();
    if (url.includes('/new') || url.endsWith('/edit')) return 'New / edit recipe';
    if (url.startsWith('/recipes/')) return 'Recipe';
    return 'Recipes';
  });

  // Filter chip option lists (label + value) for the sidebar template.
  protected readonly durations: ReadonlyArray<{ label: string; value: DurationFilter }> = [
    { label: 'All', value: 'all' },
    { label: '<15', value: 'lt15' },
    { label: '15–30', value: '15to30' },
    { label: '30–60', value: '30to60' },
    { label: '>60 min', value: 'gt60' },
  ];
  protected readonly ingredientBuckets: ReadonlyArray<{ label: string; value: IngredientFilter }> = [
    { label: 'All', value: 'all' },
    { label: '1–5', value: '1to5' },
    { label: '6–10', value: '6to10' },
    { label: '11+', value: '11plus' },
  ];
  protected readonly sorts: ReadonlyArray<{ label: string; value: SortOption }> = [
    { label: 'Newest', value: 'created-DESC' },
    { label: 'Oldest', value: 'created-ASC' },
    { label: 'A–Z', value: 'title-ASC' },
    { label: 'Z–A', value: 'title-DESC' },
  ];

  ngOnInit(): void {
    this.term$
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((term) => this.router.navigate(['/'], { queryParams: { search: term || null } }));

    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((e) => this.currentUrl.set(e.urlAfterRedirects));
  }

  protected onSearchInput(): void {
    this.term$.next(this.searchTerm.trim());
  }

  protected setDuration(value: DurationFilter): void {
    this.filters.duration.set(value);
    this.goToList();
  }
  protected setIngredients(value: IngredientFilter): void {
    this.filters.ingredients.set(value);
    this.goToList();
  }
  protected setSort(value: SortOption): void {
    this.filters.sort.set(value);
    this.goToList();
  }
  protected resetFilters(): void {
    this.filters.reset();
    this.searchTerm = '';
    this.router.navigate(['/'], { queryParams: { search: null } });
  }

  /** Filters/sort only apply on the list — jump there from any other page.
   *  Compare the path only, so an active ?search= on the list is preserved. */
  private goToList(): void {
    if (this.currentUrl().split('?')[0] !== '/') {
      this.router.navigate(['/']);
    }
  }
}
```

- [ ] **Step 2: Rewrite the template**

Replace `frontend/src/app/app.html` with:

```html
<div class="app-shell">
  <aside class="app-sidebar">
    <a class="sidebar-brand navbar-brand" routerLink="/">
      <span class="logo">🍳</span> {{ title() }}
    </a>

    <input
      type="search"
      class="form-control form-control-sm"
      placeholder="Search recipes…"
      aria-label="Search recipes"
      [(ngModel)]="searchTerm"
      (ngModelChange)="onSearchInput()"
    />

    <div class="sidebar-label">Duration</div>
    <div class="filter-chips">
      @for (d of durations; track d.value) {
        <button
          type="button"
          class="filter-chip"
          [class.active]="filters.duration() === d.value"
          [attr.aria-pressed]="filters.duration() === d.value"
          (click)="setDuration(d.value)"
        >
          {{ d.label }}
        </button>
      }
    </div>

    <div class="sidebar-label">Ingredients</div>
    <div class="filter-chips">
      @for (b of ingredientBuckets; track b.value) {
        <button
          type="button"
          class="filter-chip"
          [class.active]="filters.ingredients() === b.value"
          [attr.aria-pressed]="filters.ingredients() === b.value"
          (click)="setIngredients(b.value)"
        >
          {{ b.label }}
        </button>
      }
    </div>

    <div class="sidebar-label">Sort</div>
    <div class="filter-chips">
      @for (s of sorts; track s.value) {
        <button
          type="button"
          class="filter-chip"
          [class.active]="filters.sort() === s.value"
          [attr.aria-pressed]="filters.sort() === s.value"
          (click)="setSort(s.value)"
        >
          {{ s.label }}
        </button>
      }
    </div>

    <button type="button" class="filter-reset" (click)="resetFilters()">↺ Reset filters</button>
  </aside>

  <div class="app-main">
    <header class="app-topbar">
      <span class="topbar-crumb"><b>{{ crumb() }}</b></span>
      <span class="flex-grow-1"></span>
      <button
        type="button"
        class="icon-btn"
        [attr.aria-pressed]="theme.theme() === 'light'"
        aria-label="Toggle light and dark theme"
        (click)="theme.toggle()"
      >
        {{ theme.theme() === 'dark' ? '🌙' : '☀️' }}
      </button>
      <a routerLink="/recipes/new" class="btn btn-success btn-sm">+ New Recipe</a>
      <span class="topbar-avatar" aria-hidden="true">🍴</span>
    </header>

    <main class="app-content">
      <router-outlet />
    </main>
  </div>
</div>
```

- [ ] **Step 3: Replace the component styles**

Replace `frontend/src/app/app.scss` with (most layout now lives in global `styles.scss`; keep this minimal):

```scss
.app-sidebar .form-control {
  margin-bottom: 4px;
}
```

- [ ] **Step 4: Update the spec — drop the collapse test, keep the navigate tests**

Replace `frontend/src/app/app.spec.ts` with:

```ts
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Router, provideRouter } from '@angular/router';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { App } from './app';
import { routes } from './app.routes';
import { RecipeFilterService } from './services/recipe-filter.service';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
  });

  const members = (fixture: ReturnType<typeof TestBed.createComponent<App>>) =>
    fixture.componentInstance as unknown as {
      searchTerm: string;
      onSearchInput: () => void;
      setDuration: (v: string) => void;
      resetFilters: () => void;
    };

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders the brand title', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.navbar-brand')?.textContent).toContain('Recipe Collection');
  });

  it('navigates to the filtered list after typing settles', fakeAsync(() => {
    const fixture = TestBed.createComponent(App);
    const router = TestBed.inject(Router);
    const navigateSpy = spyOn(router, 'navigate').and.resolveTo(true);
    fixture.detectChanges();
    const app = members(fixture);

    app.searchTerm = 'cake';
    app.onSearchInput();
    tick(300);

    expect(navigateSpy).toHaveBeenCalledWith(['/'], { queryParams: { search: 'cake' } });
  }));

  it('clears the query param when the search box is emptied', fakeAsync(() => {
    const fixture = TestBed.createComponent(App);
    const router = TestBed.inject(Router);
    const navigateSpy = spyOn(router, 'navigate').and.resolveTo(true);
    fixture.detectChanges();
    const app = members(fixture);

    app.searchTerm = '';
    app.onSearchInput();
    tick(300);

    expect(navigateSpy).toHaveBeenCalledWith(['/'], { queryParams: { search: null } });
  }));

  it('updates the filter service when a duration chip is chosen', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    members(fixture).setDuration('lt15');
    expect(TestBed.inject(RecipeFilterService).duration()).toBe('lt15');
  });
});
```

- [ ] **Step 5: Run the app specs to verify they pass**

Run: `cd frontend && npm test -- --watch=false --browsers=ChromeHeadless --include='**/app.spec.ts'`
Expected: PASS (5 specs).

- [ ] **Step 6: Visual check**

Run `cd frontend && npm start`, open the app: sidebar + top bar render, theme toggle flips dark/light, search still filters, chips highlight violet when active.

- [ ] **Step 7: Commit**

```bash
git add frontend/src/app/app.ts frontend/src/app/app.html frontend/src/app/app.scss frontend/src/app/app.spec.ts
git commit -m "Rebuild app shell with filter sidebar, top bar and theme toggle"
```

---

## Task 5: Recipe list — working filters + card re-skin

**Files:**
- Modify: `frontend/src/app/components/recipe-list/recipe-list.ts`
- Modify: `frontend/src/app/components/recipe-list/recipe-list.html`
- Modify: `frontend/src/app/components/recipe-list/recipe-list.spec.ts`

Keep: `.card` class, hover-preview logic + `recipe-list.scss`, the texts "No recipes yet" and "Could not load recipes", "ingredient/ingredients", date format. Sort moves to the service (server-side reload via effect). Duration/ingredient filters apply client-side through `filteredRecipes`.

- [ ] **Step 1: Write the failing tests (update sort test + add filter tests)**

In `frontend/src/app/components/recipe-list/recipe-list.spec.ts`:

(a) Add the import:
```ts
import { RecipeFilterService } from '../../services/recipe-filter.service';
```

(b) Replace the existing test `'requests the default sort on load and re-requests on sort change'` with:

```ts
  it('requests the default sort on load and re-requests when the sort filter changes', () => {
    const fixture = TestBed.createComponent(RecipeList);
    fixture.detectChanges();

    const first = httpMock.expectOne((r) => r.url === url);
    expect(first.request.params.get('sort')).toBe('created');
    expect(first.request.params.get('direction')).toBe('DESC');
    first.flush({ recipes: [] });

    TestBed.inject(RecipeFilterService).sort.set('title-ASC');
    fixture.detectChanges();

    const second = httpMock.expectOne((r) => r.url === url);
    expect(second.request.params.get('sort')).toBe('title');
    expect(second.request.params.get('direction')).toBe('ASC');
    second.flush({ recipes: [] });
  });
```

(c) Append two filter tests inside the `describe`:

```ts
  it('applies the duration filter client-side without a new request', () => {
    const quick = { ...recipe, id: 1, duration: 10 };
    const slow = { ...recipe, id: 2, duration: 90 };
    const fixture = TestBed.createComponent(RecipeList);
    fixture.detectChanges();
    httpMock.expectOne((r) => r.url === url).flush({ recipes: [quick, slow] });
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).querySelectorAll('.card').length).toBe(2);

    TestBed.inject(RecipeFilterService).duration.set('lt15');
    fixture.detectChanges();

    httpMock.expectNone((r) => r.url === url); // client-side only
    expect((fixture.nativeElement as HTMLElement).querySelectorAll('.card').length).toBe(1);
  });

  it('shows a no-match message when filters exclude every recipe', () => {
    const fixture = TestBed.createComponent(RecipeList);
    fixture.detectChanges();
    httpMock.expectOne((r) => r.url === url).flush({ recipes: [{ ...recipe, duration: 5 }] });
    fixture.detectChanges();

    TestBed.inject(RecipeFilterService).duration.set('gt60');
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('No recipes match');
    expect((fixture.nativeElement as HTMLElement).querySelectorAll('.card').length).toBe(0);
  });
```

> Note: `RecipeFilterService` is `providedIn: 'root'`; it is shared between the component and the test injector, so resetting between tests matters. Add to the top-level `beforeEach`: `TestBed.inject(RecipeFilterService).reset();` (after `httpMock` is set up).

(d) In `beforeEach`, after `httpMock = TestBed.inject(HttpTestingController);`, add:
```ts
    TestBed.inject(RecipeFilterService).reset();
```

- [ ] **Step 2: Run to verify the new/updated tests fail**

Run: `cd frontend && npm test -- --watch=false --browsers=ChromeHeadless --include='**/recipe-list.spec.ts'`
Expected: FAIL — `filteredRecipes` not used yet / sort still local / no "No recipes match" text.

- [ ] **Step 3: Update the component**

Replace `frontend/src/app/components/recipe-list/recipe-list.ts` with (changes: inject `RecipeFilterService`, drop local `sort`/`onSortChange`, add `filteredRecipes` computed, add sort effect with first-run guard):

```ts
import { Component, DestroyRef, OnInit, computed, effect, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, map, of, switchMap, takeUntil, tap } from 'rxjs';
import { RecipeService } from '../../services/recipe.service';
import { RecipeFilterService } from '../../services/recipe-filter.service';
import { Recipe, RecipePreview, RecipeQueryParams } from '../../models/recipe';
import { recipeImageUrl } from '../../shared/image-url';

type LoadState = 'loading' | 'loaded' | 'error';

@Component({
  selector: 'app-recipe-list',
  imports: [DatePipe, RouterLink],
  templateUrl: './recipe-list.html',
  styleUrl: './recipe-list.scss',
})
export class RecipeList implements OnInit {
  private readonly recipeService = inject(RecipeService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly route = inject(ActivatedRoute);
  protected readonly filters = inject(RecipeFilterService);

  private readonly hover$ = new Subject<number>();
  private readonly leave$ = new Subject<void>();
  private readonly previewCache = new Map<number, RecipePreview>();
  private hoveredId: number | null = null;

  protected readonly recipes = signal<Recipe[]>([]);
  protected readonly state = signal<LoadState>('loading');
  protected readonly preview = signal<RecipePreview | null>(null);
  protected readonly previewPos = signal<{ top: number; left: number }>({ top: 0, left: 0 });
  protected search = '';

  /** Client-side duration + ingredient filtering over the loaded list. */
  protected readonly filteredRecipes = computed(() =>
    this.recipes().filter((r) => this.filters.matches(r)),
  );

  // Re-request from the server when the sort filter changes (sort is server-side).
  // The first run is skipped — the initial load is driven by the search subscription.
  private firstSortRun = true;
  private readonly sortEffect = effect(() => {
    this.filters.sort();
    if (this.firstSortRun) {
      this.firstSortRun = false;
      return;
    }
    this.load();
  });

  ngOnInit(): void {
    this.setupHoverPreview();

    this.route.queryParamMap
      .pipe(
        map((params) => (params.get('search') ?? '').trim()),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((search) => {
        this.search = search;
        this.load();
      });
  }

  protected load(): void {
    this.state.set('loading');
    this.recipeService.getRecipes(this.params(this.search.trim())).subscribe({
      next: (recipes) => {
        this.recipes.set(recipes);
        this.state.set('loaded');
      },
      error: () => this.state.set('error'),
    });
  }

  protected formatAmount(amount: string): number {
    return parseFloat(amount);
  }

  protected imageUrl(imagePath: string | null): string | null {
    return recipeImageUrl(imagePath);
  }

  private params(search: string): RecipeQueryParams {
    const [sort, direction] = this.filters.sort().split('-') as [
      RecipeQueryParams['sort'],
      RecipeQueryParams['direction'],
    ];
    return search ? { sort, direction, search } : { sort, direction };
  }

  protected onTitleEnter(id: number, event: MouseEvent): void {
    this.hoveredId = id;
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    const width = 280;
    const left = Math.min(rect.left, window.innerWidth - width - 16);
    this.previewPos.set({ top: rect.bottom + window.scrollY + 4, left: left + window.scrollX });
    this.hover$.next(id);
  }

  protected onTitleLeave(): void {
    this.hoveredId = null;
    this.leave$.next();
    this.preview.set(null);
  }

  private setupHoverPreview(): void {
    this.hover$
      .pipe(
        debounceTime(200),
        switchMap((id) => {
          if (this.hoveredId !== id) {
            return of(null);
          }
          const cached = this.previewCache.get(id);
          const source$ = cached
            ? of(cached)
            : this.recipeService.getRecipePreview(id).pipe(
                tap((preview) => this.previewCache.set(id, preview)),
                catchError(() => of(null)),
              );
          return source$.pipe(takeUntil(this.leave$));
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((preview) => {
        if (preview && this.hoveredId === preview.id) {
          this.preview.set(preview);
        }
      });
  }
}
```

> Removed: `FormsModule` import and the `sort`/`SortOption`/`onSortChange` members (sort now lives in `RecipeFilterService`). The template no longer has the `<select>`.

- [ ] **Step 4: Update the template**

Replace `frontend/src/app/components/recipe-list/recipe-list.html` with:

```html
<div class="d-flex justify-content-between align-items-center mb-3">
  <div>
    <h1 class="h3 mb-0">Recipes</h1>
    @if (state() === 'loaded') {
      <p class="text-muted small mb-0">{{ filteredRecipes().length }} of {{ recipes().length }} shown</p>
    }
  </div>
  <a routerLink="/recipes/new" class="btn btn-success">New Recipe</a>
</div>

@if (state() === 'loading') {
  <div class="text-center py-5">
    <div class="spinner-border" role="status">
      <span class="visually-hidden">Loading…</span>
    </div>
  </div>
} @else if (state() === 'error') {
  <div class="alert alert-danger d-flex justify-content-between align-items-center">
    <span>Could not load recipes. Please try again.</span>
    <button type="button" class="btn btn-sm btn-outline-danger" (click)="load()">Retry</button>
  </div>
} @else if (recipes().length === 0) {
  @if (search.trim()) {
    <div class="text-center text-muted py-5">No recipes match your search.</div>
  } @else {
    <div class="text-center text-muted py-5">
      <p class="mb-3">No recipes yet.</p>
      <a routerLink="/recipes/new" class="btn btn-success">Create the first one</a>
    </div>
  }
} @else if (filteredRecipes().length === 0) {
  <div class="text-center text-muted py-5">No recipes match these filters.</div>
} @else {
  <div class="row g-3">
    @for (recipe of filteredRecipes(); track recipe.id) {
      <div class="col-12 col-md-6 col-lg-4">
        <div class="card recipe-card h-100">
          @if (imageUrl(recipe.image_path); as url) {
            <img [src]="url" [alt]="recipe.title" class="card-img-top" style="height: 160px; object-fit: cover" />
          } @else {
            <div class="card-img-top thumb-placeholder" style="height: 160px">🍽️</div>
          }
          <div class="card-body">
            <h2 class="card-title h5">
              <a
                [routerLink]="['/recipes', recipe.id]"
                class="text-decoration-none stretched-link"
                (mouseenter)="onTitleEnter(recipe.id, $event)"
                (mouseleave)="onTitleLeave()"
                >{{ recipe.title }}</a
              >
            </h2>
            <p class="card-subtitle text-muted small mb-2">{{ recipe.created | date: 'dd.MM.yyyy' }}</p>
            <p class="card-text small mb-1">
              {{ recipe.ingredients.length }}
              {{ recipe.ingredients.length === 1 ? 'ingredient' : 'ingredients' }}
            </p>
            @if (recipe.duration != null) {
              <span class="badge badge-duration">⏱ {{ recipe.duration }} min</span>
            }
          </div>
        </div>
      </div>
    }
  </div>
}

@if (preview(); as p) {
  <div class="card shadow recipe-preview" [style.top.px]="previewPos().top" [style.left.px]="previewPos().left">
    @if (imageUrl(p.image_path); as url) {
      <img [src]="url" [alt]="p.title" class="card-img-top" style="height: 120px; object-fit: cover" />
    }
    <div class="card-body p-3">
      <h3 class="h6 mb-2">{{ p.title }}</h3>
      <p class="small text-muted mb-2">
        @for (ingredient of p.ingredients; track ingredient.name; let last = $last) {
          {{ formatAmount(ingredient.amount) }}{{ ingredient.unit }} {{ ingredient.name }}{{ last ? '' : ', ' }}
        }
      </p>
      @if (p.descriptionExcerpt) {
        <p class="small mb-0">{{ p.descriptionExcerpt }}</p>
      }
    </div>
  </div>
}
```

> `recipe-list.scss` is unchanged (keeps `.card` pointer + `.recipe-preview` positioning).

- [ ] **Step 5: Run the list specs to verify they pass**

Run: `cd frontend && npm test -- --watch=false --browsers=ChromeHeadless --include='**/recipe-list.spec.ts'`
Expected: PASS (all list specs, including the two new filter tests).

- [ ] **Step 6: Commit**

```bash
git add frontend/src/app/components/recipe-list/
git commit -m "Wire recipe list to filter service with client-side filters"
```

---

## Task 6: Recipe detail re-skin

**Files:**
- Modify: `frontend/src/app/components/recipe-detail/recipe-detail.html`
- Modify: `frontend/src/app/components/recipe-detail/recipe-detail.scss`

**Logic untouched** — only markup/classes change. Preserve every binding, method call, and these asserted strings/behaviors: "Chocolate cake", "15.06.2026", "100g sugar", "1.5l milk" (via `formatIngredient`), "No recipe found", the e-mail modal flow (`openMailModal`/`sendMail`/`closeMailModal`, `mailState`, `is-invalid`), delete (`deleteRecipe`), image upload (`onImageSelected`, `imageUrl`, `imageBusy`, `imageError`, `removeImage`), notes (`notes`, `addNote`, `deleteNote`, `noteAuthor`, `noteBody`, `noteSaving`).

Class mapping to apply: action buttons → Edit `btn btn-outline-primary` (violet), Share `btn btn-success` (green, was `btn-outline-primary`), Delete `btn btn-outline-danger`; wrap Ingredients and Description in `.panel`; "No photo yet" placeholder uses `thumb-placeholder`; duration badge → `badge badge-duration`. The modal/alerts inherit theming from Bootstrap variables (Task 1).

- [ ] **Step 1: Replace the template**

Replace `frontend/src/app/components/recipe-detail/recipe-detail.html` with:

```html
@if (state() === 'loading') {
  <div class="text-center py-5">
    <div class="spinner-border" role="status"><span class="visually-hidden">Loading…</span></div>
  </div>
} @else if (state() === 'notfound') {
  <div class="alert alert-warning">No recipe found with that id.</div>
} @else if (state() === 'error') {
  <div class="alert alert-danger">Could not load the recipe. Please try again.</div>
} @else if (recipe(); as r) {
  <a routerLink="/" class="btn btn-outline-secondary btn-sm mb-3">&larr; Back to list</a>

  <article>
    <div class="panel mb-4">
      <div class="d-flex justify-content-between align-items-start flex-wrap gap-3">
        <div>
          <h1 class="h3 mb-1">{{ r.title }}</h1>
          <p class="text-muted mb-2">{{ r.created | date: 'dd.MM.yyyy' }}</p>
          <div class="d-flex gap-2 flex-wrap">
            @if (r.duration != null) {
              <span class="badge badge-duration">⏱ {{ r.duration }} min</span>
            }
            @if (r.temperature != null) {
              <span class="badge text-bg-secondary">🌡 {{ r.temperature }} °C</span>
            }
            <span class="badge text-bg-secondary">🧂 {{ r.ingredients.length }} ingredients</span>
          </div>
        </div>
        <div class="d-flex gap-2 flex-shrink-0">
          <a [routerLink]="['/recipes', r.id, 'edit']" class="btn btn-outline-primary btn-sm">Edit</a>
          <button type="button" class="btn btn-success btn-sm" (click)="openMailModal()">Share by e-mail</button>
          <button type="button" class="btn btn-outline-danger btn-sm" [disabled]="deleting()" (click)="deleteRecipe()">
            Delete
          </button>
        </div>
      </div>

      <div class="mt-3">
        @if (imageUrl(); as url) {
          <img [src]="url" [alt]="r.title" class="img-fluid rounded mb-2" style="max-height: 320px" />
        } @else {
          <div class="thumb-placeholder rounded mb-2" style="height: 160px">🍽️ No photo yet</div>
        }
        <div class="d-flex gap-2 align-items-center">
          <label class="btn btn-outline-secondary btn-sm mb-0" [class.disabled]="imageBusy()">
            @if (imageBusy()) {
              <span class="spinner-border spinner-border-sm me-1"></span>
            }
            {{ r.image_path ? 'Replace photo' : 'Upload photo' }}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              class="d-none"
              [disabled]="imageBusy()"
              (change)="onImageSelected($event)"
            />
          </label>
          @if (r.image_path) {
            <button type="button" class="btn btn-outline-danger btn-sm" [disabled]="imageBusy()" (click)="removeImage()">
              Remove
            </button>
          }
        </div>
        @if (imageError()) {
          <div class="text-danger small mt-1">{{ imageError() }}</div>
        }
      </div>
    </div>

    <div class="row g-3">
      <div class="col-12 col-lg-4">
        <div class="panel h-100">
          <h2 class="h5 mb-3">Ingredients</h2>
          <ul class="list-group list-group-flush">
            @for (ingredient of r.ingredients; track ingredient.id) {
              <li class="list-group-item bg-transparent px-0">{{ formatIngredient(ingredient) }}</li>
            }
          </ul>
        </div>
      </div>
      <div class="col-12 col-lg-8">
        @if (r.description) {
          <div class="panel h-100">
            <h2 class="h5 mb-3">Description</h2>
            <p class="mb-0" style="white-space: pre-line">{{ r.description }}</p>
          </div>
        }
      </div>
    </div>

    <div class="panel mt-3">
      <h2 class="h5 mb-3">Notes</h2>
      @if (notes().length === 0) {
        <p class="text-muted small">No notes yet.</p>
      } @else {
        <ul class="list-group list-group-flush mb-3">
          @for (note of notes(); track note.id) {
            <li class="list-group-item bg-transparent px-0 d-flex justify-content-between align-items-start">
              <div>
                <div style="white-space: pre-line">{{ note.body }}</div>
                <div class="text-muted small">{{ note.author || 'Anonymous' }} · {{ note.created | date: 'dd.MM.yyyy' }}</div>
              </div>
              <button
                type="button"
                class="btn btn-sm btn-link text-danger text-decoration-none p-1 ms-2 lh-1"
                aria-label="Delete note"
                (click)="deleteNote(note.id)"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
                  <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z" />
                  <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z" />
                </svg>
              </button>
            </li>
          }
        </ul>
      }

      <form (ngSubmit)="addNote()" class="mb-0">
        <input
          type="text"
          class="form-control form-control-sm mb-2"
          style="max-width: 16rem"
          placeholder="Your name (optional)"
          [(ngModel)]="noteAuthor"
          name="noteAuthor"
        />
        <textarea class="form-control mb-2" rows="2" placeholder="Add a note…" [(ngModel)]="noteBody" name="noteBody"></textarea>
        <button type="submit" class="btn btn-outline-primary btn-sm" [disabled]="!noteBody.trim() || noteSaving()">
          @if (noteSaving()) {
            <span class="spinner-border spinner-border-sm me-1"></span>
          }
          Add note
        </button>
      </form>
    </div>
  </article>

  @if (mailModalOpen()) {
    <div class="modal-backdrop fade show"></div>
    <div class="modal fade show d-block" tabindex="-1" role="dialog">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h2 class="modal-title h5">Share “{{ r.title }}”</h2>
            <button type="button" class="btn-close" aria-label="Close" (click)="closeMailModal()"></button>
          </div>
          <div class="modal-body">
            @if (mailState() === 'sent') {
              <div class="alert alert-success mb-0">Recipe sent to {{ mailTo }}.</div>
            } @else {
              <label for="mailTo" class="form-label">Friend’s e-mail address</label>
              <input
                id="mailTo"
                type="email"
                class="form-control"
                [class.is-invalid]="mailError()"
                placeholder="friend@example.com"
                [(ngModel)]="mailTo"
                (keyup.enter)="sendMail()"
              />
              @if (mailError()) {
                <div class="invalid-feedback d-block">{{ mailError() }}</div>
              }
            }
          </div>
          <div class="modal-footer">
            @if (mailState() === 'sent') {
              <button type="button" class="btn btn-success" (click)="closeMailModal()">Done</button>
            } @else {
              <button type="button" class="btn btn-outline-secondary" (click)="closeMailModal()">Cancel</button>
              <button type="button" class="btn btn-success" [disabled]="mailState() === 'sending'" (click)="sendMail()">
                @if (mailState() === 'sending') {
                  <span class="spinner-border spinner-border-sm me-1"></span> Sending…
                } @else {
                  Send
                }
              </button>
            }
          </div>
        </div>
      </div>
    </div>
  }
}
```

- [ ] **Step 2: Add the placeholder helper styling**

Replace `frontend/src/app/components/recipe-detail/recipe-detail.scss` with:

```scss
.thumb-placeholder {
  gap: 0.5rem;
}
```

- [ ] **Step 3: Run the detail specs to verify they pass**

Run: `cd frontend && npm test -- --watch=false --browsers=ChromeHeadless --include='**/recipe-detail.spec.ts'`
Expected: PASS (all 10 detail specs — logic and asserted text are unchanged).

- [ ] **Step 4: Commit**

```bash
git add frontend/src/app/components/recipe-detail/
git commit -m "Re-skin recipe detail with hero and panels"
```

---

## Task 7: Recipe form re-skin

**Files:**
- Modify: `frontend/src/app/components/recipe-form/recipe-form.html`

**Logic untouched.** Preserve `formControlName`s, `[formGroup]`, the `ingredients` FormArray loop, validation (`is-invalid`/`invalid-feedback`), `addIngredient`/`removeIngredient` (min-1 disabled), `submit`, `editId`, image handlers. Only change: Save button `btn btn-primary` → `btn btn-success`; everything else inherits theming from Bootstrap variables (Task 1). Inputs get the violet focus ring for free via the global `:focus-visible` rule.

- [ ] **Step 1: Swap the submit button class to the positive (green) variant**

In `frontend/src/app/components/recipe-form/recipe-form.html`, change the submit button (currently `class="btn btn-primary"`):

```html
    <button type="submit" class="btn btn-success" [disabled]="submitting()">
      @if (submitting()) {
        <span class="spinner-border spinner-border-sm me-1"></span> Saving…
      } @else {
        {{ editId() ? 'Save changes' : 'Save recipe' }}
      }
    </button>
```

(Leave the rest of the template as-is — Bootstrap variables theme the inputs, labels, and validation states automatically.)

- [ ] **Step 2: Run the form specs to verify they pass**

Run: `cd frontend && npm test -- --watch=false --browsers=ChromeHeadless --include='**/recipe-form.spec.ts'`
Expected: PASS (all form specs — no logic change).

- [ ] **Step 3: Visual check**

Run the app, open "New Recipe": inputs are dark/light themed, focus shows the violet ring, validation errors are red, Save is green. Toggle the theme and re-check.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/app/components/recipe-form/recipe-form.html
git commit -m "Use the green positive button on the recipe form"
```

---

## Task 8: Not-found re-skin + accessibility/contrast pass

**Files:**
- Modify: `frontend/src/app/components/not-found/not-found.ts`

Keep asserted text: "Page not found" + a `routerLink="/"` link.

- [ ] **Step 1: Re-skin the not-found template (inline)**

In `frontend/src/app/components/not-found/not-found.ts`, replace the `template` string:

```ts
  template: `
    <div class="text-center py-5">
      <div class="thumb-placeholder rounded mx-auto mb-3" style="width: 96px; height: 96px; font-size: 40px">🍽️</div>
      <h1 class="h3">Page not found</h1>
      <p class="text-muted mb-3">The page you are looking for does not exist.</p>
      <a routerLink="/" class="btn btn-success">Back to recipes</a>
    </div>
  `,
```

- [ ] **Step 2: Run the not-found spec**

Run: `cd frontend && npm test -- --watch=false --browsers=ChromeHeadless --include='**/not-found.spec.ts'`
Expected: PASS.

- [ ] **Step 3: Full accessibility + contrast pass (manual)**

Run the app and verify in **both** themes:
- Text/badges/chips meet WCAG AA contrast (spot-check muted text, the green duration badge, active violet chips).
- Every interactive element shows the violet focus ring on keyboard `Tab`.
- The theme toggle has `aria-label` and toggles `aria-pressed`; filter chips expose `aria-pressed`.
- Keyboard: Tab through sidebar → top bar → content; activate chips/toggle with Enter/Space.

Fix any contrast misses by nudging the relevant token in `styles.scss`.

- [ ] **Step 4: Run the FULL suite**

Run: `cd frontend && npm test -- --watch=false --browsers=ChromeHeadless`
Expected: ALL specs across all 8 files green.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/app/components/not-found/not-found.ts frontend/src/styles.scss
git commit -m "Re-skin not-found page and finish accessibility pass"
```

---

## Known Follow-ups (out of scope for this plan)

- **Unsaved-form data loss:** the filter sidebar is always visible (approved design), so
  changing a filter or "Reset filters" while editing the New/Edit recipe form navigates to
  the list and discards unsaved input. A `CanDeactivate` guard with a "discard changes?"
  confirm should be added in a follow-up PR. Not implemented here to keep scope to the redesign.
- **`load()` has no in-flight cancellation:** `resetFilters()` (sets sort + navigates) can fire
  two concurrent list loads when a non-default sort AND an active search are both cleared at once.
  The two requests build identical params, so the race is benign (one redundant request, no wrong
  data). A `switchMap`/`exhaustMap` over a load trigger would tighten it — deferred as minor.

## Self-Review

**1. Spec coverage:**
- §3 tokens → Task 1 (full token tables, both themes). ✓
- §4 theme switching (toggle, persistence, system pref) → Task 2 + toggle UI in Task 4. ✓
- §5 app shell (sidebar filters, top bar, breadcrumb, toggle, new recipe) → Task 4. ✓
- §6.1 list (cards, filters, states, preview) → Task 5. ✓
- §6.2 detail (hero, panels, notes, modal, image, states, temperature) → Task 6. ✓
- §6.3 form (themed inputs, validation, FormArray, positive button) → Task 7. ✓
- §6.4 not-found → Task 8. ✓
- §6.5 global styles → Task 1. ✓
- §7 accessibility → Task 8 Step 3 + aria in Task 4. ✓
- §8 testing (re-run all, new ThemeService/filter/list tests, consolidate sort test) → Tasks 2,3,5 + full run Task 8. ✓
- §9 decisions (signal service, client-side filters, gradient placeholder) → implemented in Tasks 3,5,6. ✓

**2. Placeholder scan:** No TBD/TODO; every code step shows complete code. ✓

**3. Type/name consistency:** `RecipeFilterService` API (`sort`/`duration`/`ingredients`/`reset`/`matches`) is used identically in Tasks 3, 4, 5. `ThemeService.theme()`/`toggle()` consistent in Tasks 2, 4. `DurationFilter`/`IngredientFilter`/`SortOption` exported from the filter service and imported in the App component. `filteredRecipes` used in list component + template. ✓

**Scope note resolved:** UI strings remain English throughout to keep existing specs valid.

---

## Execution Handoff

See the prompt after this plan for execution-mode options.
