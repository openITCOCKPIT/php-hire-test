import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { RecipeService } from '../../services/recipe.service';
import { Ingredient, Recipe } from '../../models/recipe';

type LoadState = 'loading' | 'loaded' | 'notfound' | 'error';
type MailState = 'idle' | 'sending' | 'sent' | 'error';

@Component({
  selector: 'app-recipe-detail',
  imports: [DatePipe, RouterLink, FormsModule],
  templateUrl: './recipe-detail.html',
  styleUrl: './recipe-detail.scss',
})
export class RecipeDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly recipeService = inject(RecipeService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly recipe = signal<Recipe | null>(null);
  protected readonly state = signal<LoadState>('loading');

  // E-mail share modal (#13).
  protected readonly mailModalOpen = signal(false);
  protected readonly mailState = signal<MailState>('idle');
  protected readonly mailError = signal<string | null>(null);
  protected mailTo = '';

  // Delete (#17).
  protected readonly deleting = signal(false);

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

  // --- Delete (#17) ---

  protected deleteRecipe(): void {
    const recipe = this.recipe();
    if (!recipe || !confirm(`Delete “${recipe.title}”? This cannot be undone.`)) {
      return;
    }
    this.deleting.set(true);
    this.recipeService.deleteRecipe(recipe.id).subscribe({
      next: () => this.router.navigate(['/']),
      error: () => {
        this.deleting.set(false);
        this.state.set('error');
      },
    });
  }

  // --- E-mail share (#13) ---

  protected openMailModal(): void {
    this.mailTo = '';
    this.mailState.set('idle');
    this.mailError.set(null);
    this.mailModalOpen.set(true);
  }

  protected closeMailModal(): void {
    this.mailModalOpen.set(false);
  }

  protected sendMail(): void {
    const recipe = this.recipe();
    if (!recipe) {
      return;
    }
    // Client-side check; the server validates authoritatively.
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.mailTo.trim())) {
      this.mailError.set('Please enter a valid e-mail address.');
      return;
    }

    this.mailState.set('sending');
    this.mailError.set(null);
    this.recipeService.sendRecipeEmail(recipe.id, this.mailTo.trim()).subscribe({
      next: () => this.mailState.set('sent'),
      error: (err: HttpErrorResponse) => {
        this.mailState.set('error');
        const serverMsg = err.status === 422 ? err.error?.errors?.email?.[0] : null;
        this.mailError.set(serverMsg ?? 'Could not send the e-mail. Please try again.');
      },
    });
  }
}
