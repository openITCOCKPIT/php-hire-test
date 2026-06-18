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
