import { Component, OnInit, inject, signal } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { RecipeService } from '../../services/recipe.service';
import { NewRecipe, Recipe } from '../../models/recipe';

@Component({
  selector: 'app-recipe-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './recipe-form.html',
  styleUrl: './recipe-form.scss',
})
export class RecipeForm implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly recipeService = inject(RecipeService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly submitting = signal(false);
  protected readonly submitError = signal<string | null>(null);
  protected readonly editId = signal<number | null>(null);

  protected readonly form = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(255)]],
    description: [''],
    temperature: [null as number | null, [Validators.min(0), Validators.max(500)]],
    duration: [null as number | null, [Validators.min(0), Validators.max(1440)]],
    ingredients: this.fb.array([this.createIngredient()]),
  });

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      const id = Number(idParam);
      this.editId.set(id);
      this.recipeService.getRecipe(id).subscribe({
        next: (recipe) => this.populate(recipe),
        error: () => this.submitError.set('Could not load the recipe to edit.'),
      });
    }
  }

  /** Fill the form (incl. rebuilding the ingredient rows) from an existing recipe. */
  private populate(recipe: Recipe): void {
    this.form.patchValue({
      title: recipe.title,
      description: recipe.description ?? '',
      temperature: recipe.temperature,
      duration: recipe.duration,
    });
    this.ingredients.clear();
    recipe.ingredients.forEach((ingredient) => {
      const group = this.createIngredient();
      group.patchValue({
        name: ingredient.name,
        amount: parseFloat(ingredient.amount),
        unit: ingredient.unit,
      });
      this.ingredients.push(group);
    });
    if (this.ingredients.length === 0) {
      this.ingredients.push(this.createIngredient());
    }
  }

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

    const payload = this.form.value as NewRecipe;
    const id = this.editId();
    const request$ = id
      ? this.recipeService.updateRecipe(id, payload)
      : this.recipeService.createRecipe(payload);

    request$.subscribe({
      next: () => this.router.navigate(id ? ['/recipes', id] : ['/']),
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
