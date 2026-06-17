import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, of, switchMap, tap } from 'rxjs';
import { RecipeService } from '../../services/recipe.service';
import { Recipe, RecipeQueryParams } from '../../models/recipe';

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

  protected readonly recipes = signal<Recipe[]>([]);
  protected readonly state = signal<LoadState>('loading');
  protected sort: SortOption = 'created-DESC';
  protected search = '';

  ngOnInit(): void {
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

  private params(search: string): RecipeQueryParams {
    const [sort, direction] = this.sort.split('-') as [
      RecipeQueryParams['sort'],
      RecipeQueryParams['direction'],
    ];
    return search ? { sort, direction, search } : { sort, direction };
  }
}
