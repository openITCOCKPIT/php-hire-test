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
