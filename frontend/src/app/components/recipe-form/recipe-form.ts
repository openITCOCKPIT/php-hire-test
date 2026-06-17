import { Component, inject, signal } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { RecipeService } from '../../services/recipe.service';
import { NewRecipe } from '../../models/recipe';

@Component({
  selector: 'app-recipe-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './recipe-form.html',
  styleUrl: './recipe-form.scss',
})
export class RecipeForm {
  private readonly fb = inject(FormBuilder);
  private readonly recipeService = inject(RecipeService);
  private readonly router = inject(Router);

  protected readonly submitting = signal(false);
  protected readonly submitError = signal<string | null>(null);

  protected readonly form = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(255)]],
    description: [''],
    ingredients: this.fb.array([this.createIngredient()]),
  });

  protected get ingredients(): FormArray {
    return this.form.get('ingredients') as FormArray;
  }

  protected createIngredient(): FormGroup {
    return this.fb.group({
      name: ['', Validators.required],
      amount: [null, [Validators.required, Validators.min(0.01)]],
      unit: ['', Validators.required],
    });
  }

  protected addIngredient(): void {
    this.ingredients.push(this.createIngredient());
  }

  protected removeIngredient(index: number): void {
    if (this.ingredients.length > 1) {
      this.ingredients.removeAt(index);
    }
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.submitError.set(null);

    this.recipeService.createRecipe(this.form.value as NewRecipe).subscribe({
      next: () => this.router.navigate(['/']),
      error: (err: HttpErrorResponse) => {
        this.submitting.set(false);
        this.applyServerErrors(err);
      },
    });
  }

  /** Map a 422 {"errors": {...}} body back onto the form controls. */
  private applyServerErrors(err: HttpErrorResponse): void {
    const errors = err.status === 422 ? err.error?.errors : null;
    if (!errors) {
      this.submitError.set('Could not save the recipe. Please try again.');
      return;
    }

    if (errors.title) {
      this.form.get('title')?.setErrors({ server: Object.values(errors.title)[0] });
    }
    if (Array.isArray(errors.ingredients)) {
      errors.ingredients.forEach((fieldErrors: Record<string, Record<string, string>>, i: number) => {
        const group = this.ingredients.at(i);
        Object.entries(fieldErrors ?? {}).forEach(([field, messages]) => {
          group?.get(field)?.setErrors({ server: Object.values(messages)[0] });
        });
      });
    } else if (errors.ingredients) {
      this.submitError.set('At least one ingredient is required.');
    }
  }
}
