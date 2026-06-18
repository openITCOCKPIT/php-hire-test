import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, of, switchMap, takeUntil, tap } from 'rxjs';
import { RecipeService } from '../../services/recipe.service';
import { Recipe, RecipePreview, RecipeQueryParams } from '../../models/recipe';
import { recipeImageUrl } from '../../shared/image-url';

type LoadState = 'loading' | 'loaded' | 'error';
type SortOption = 'created-DESC' | 'created-ASC' | 'title-ASC' | 'title-DESC';

@Component({
  selector: 'app-recipe-list',
  imports: [DatePipe, RouterLink, FormsModule],
  templateUrl: './recipe-list.html',
  styleUrl: './recipe-list.scss',
})
export class RecipeList implements OnInit {
  private readonly recipeService = inject(RecipeService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly searchInput$ = new Subject<string>();

  // Hover preview (#12).
  private readonly hover$ = new Subject<number>();
  private readonly leave$ = new Subject<void>();
  private readonly previewCache = new Map<number, RecipePreview>();
  private hoveredId: number | null = null;

  protected readonly recipes = signal<Recipe[]>([]);
  protected readonly state = signal<LoadState>('loading');
  protected readonly preview = signal<RecipePreview | null>(null);
  protected readonly previewPos = signal<{ top: number; left: number }>({ top: 0, left: 0 });
  protected sort: SortOption = 'created-DESC';
  protected search = '';

  ngOnInit(): void {
    this.setupHoverPreview();

    // Debounce the search box and cancel any in-flight request when a newer
    // term arrives (switchMap), so fast typing never floods the API or shows a
    // stale response. distinctUntilChanged skips duplicate consecutive terms.
    this.searchInput$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        tap(() => this.state.set('loading')),
        switchMap((search) =>
          this.recipeService.getRecipes(this.params(search)).pipe(
            catchError(() => {
              this.state.set('error');
              return of<Recipe[]>([]);
            }),
          ),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((recipes) => {
        this.recipes.set(recipes);
        if (this.state() !== 'error') {
          this.state.set('loaded');
        }
      });

    this.load();
  }

  /** Sort changes reload immediately (no debounce). */
  protected onSortChange(): void {
    this.load();
  }

  /** Push the current term onto the debounced search stream. */
  protected onSearchChange(): void {
    this.searchInput$.next(this.search.trim());
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

  /** "100.00" -> "100", "1.50" -> "1.5" (matches the detail view). */
  protected formatAmount(amount: string): number {
    return parseFloat(amount);
  }

  /** Public URL for an uploaded image, or null. */
  protected imageUrl(imagePath: string | null): string | null {
    return recipeImageUrl(imagePath);
  }

  private params(search: string): RecipeQueryParams {
    const [sort, direction] = this.sort.split('-') as [
      RecipeQueryParams['sort'],
      RecipeQueryParams['direction'],
    ];
    return search ? { sort, direction, search } : { sort, direction };
  }

  // --- Hover preview (#12) ---

  /**
   * mouseenter on a recipe title: remember where to anchor the popover and push
   * the id onto the hover stream.
   */
  protected onTitleEnter(id: number, event: MouseEvent): void {
    this.hoveredId = id;
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    // Anchor below the title; keep it inside the viewport on the right edge.
    const width = 280;
    const left = Math.min(rect.left, window.innerWidth - width - 16);
    this.previewPos.set({ top: rect.bottom + window.scrollY + 4, left: left + window.scrollX });
    this.hover$.next(id);
  }

  /** mouseleave: hide immediately and cancel any in-flight preview request. */
  protected onTitleLeave(): void {
    this.hoveredId = null;
    this.leave$.next();
    this.preview.set(null);
  }

  private setupHoverPreview(): void {
    this.hover$
      .pipe(
        // A small debounce means titles merely passed over in transit never
        // trigger a request — only a title the cursor pauses on does. (No
        // distinctUntilChanged here: re-hovering the same title after leaving
        // must re-show its cached preview.)
        debounceTime(200),
        // switchMap cancels a superseded request when the cursor moves on.
        switchMap((id) => {
          // Cursor already left (or moved on) during the debounce window.
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
          // takeUntil(leave$) cancels the in-flight request the moment the
          // cursor leaves, so a late response never pops up over nothing.
          return source$.pipe(takeUntil(this.leave$));
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      // Only show if the cursor is still on the title the preview is for.
      .subscribe((preview) => {
        if (preview && this.hoveredId === preview.id) {
          this.preview.set(preview);
        }
      });
  }
}
