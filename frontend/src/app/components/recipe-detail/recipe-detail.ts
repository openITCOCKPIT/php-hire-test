import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs/operators';
import { RecipeService } from '../../services/recipe.service';
import { Ingredient, Recipe } from '../../models/recipe';

type LoadState = 'loading' | 'loaded' | 'notfound' | 'error';

@Component({
  selector: 'app-recipe-detail',
  imports: [DatePipe, RouterLink],
  templateUrl: './recipe-detail.html',
  styleUrl: './recipe-detail.scss',
})
export class RecipeDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly recipeService = inject(RecipeService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly recipe = signal<Recipe | null>(null);
  protected readonly state = signal<LoadState>('loading');

  ngOnInit(): void {
    // paramMap (not snapshot) so navigating directly between detail pages reloads.
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          this.state.set('loading');
          return this.recipeService.getRecipe(Number(params.get('id')));
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (recipe) => {
          this.recipe.set(recipe);
          this.state.set('loaded');
        },
        error: (err) => this.state.set(err?.status === 404 ? 'notfound' : 'error'),
      });
  }

  /** "100.00" -> "100", "1.50" -> "1.5" for cleaner display. */
  protected formatIngredient(ingredient: Ingredient): string {
    const amount = parseFloat(ingredient.amount);
    return `${amount}${ingredient.unit} ${ingredient.name}`;
  }
}
