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

  private readonly currentUrl = signal(this.router.url);
  protected readonly crumb = computed(() => {
    const url = this.currentUrl();
    if (url.includes('/new') || url.endsWith('/edit')) return 'New / edit recipe';
    if (url.startsWith('/recipes/')) return 'Recipe';
    return 'Recipes';
  });

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
