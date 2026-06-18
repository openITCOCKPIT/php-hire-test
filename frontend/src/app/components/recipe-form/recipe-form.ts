import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, map, of, switchMap } from 'rxjs';
import { RecipeService } from '../../services/recipe.service';
import { NewRecipe, Recipe } from '../../models/recipe';
import { recipeImageUrl } from '../../shared/image-url';

@Component({
  selector: 'app-recipe-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './recipe-form.html',
  styleUrl: './recipe-form.scss',
})
export class RecipeForm implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly recipeService = inject(RecipeService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly submitting = signal(false);
  protected readonly submitError = signal<string | null>(null);
  protected readonly editId = signal<number | null>(null);

  // Image (#19): selected file held until the recipe is saved, then uploaded.
  protected readonly existingImage = signal<string | null>(null);
  protected readonly previewUrl = signal<string | null>(null);
  private selectedImage: File | null = null;
  private removeExistingImage = false;

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

  ngOnDestroy(): void {
    this.revokePreview();
  }

  // --- Image selection (#19) ---

  /** The image to show: a freshly chosen file's preview, or the existing one. */
  protected imageUrl(): string | null {
    return this.previewUrl() ?? recipeImageUrl(this.existingImage());
  }

  protected onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    input.value = '';
    if (!file) {
      return;
    }
    this.revokePreview();
    this.selectedImage = file;
    this.removeExistingImage = false;
    this.previewUrl.set(URL.createObjectURL(file));
  }

  protected clearImage(): void {
    this.revokePreview();
    this.selectedImage = null;
    // In edit mode, a recipe that had an image must have it deleted on save.
    this.removeExistingImage = this.editId() !== null && this.existingImage() !== null;
    this.existingImage.set(null);
  }

  private revokePreview(): void {
    const url = this.previewUrl();
    if (url) {
      URL.revokeObjectURL(url);
      this.previewUrl.set(null);
    }
  }

  /** Fill the form (incl. rebuilding the ingredient rows) from an existing recipe. */
  private populate(recipe: Recipe): void {
    this.existingImage.set(recipe.image_path);
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

    // Save the recipe, then upload the chosen image to its id (a second step,
    // since the upload endpoint needs an existing recipe). An image failure does
    // not block navigation — the recipe is already saved.
    request$
      .pipe(
        switchMap((saved) => {
          if (this.selectedImage) {
            return this.recipeService
              .uploadRecipeImage(saved.id, this.selectedImage)
              .pipe(map(() => saved), catchError(() => of(saved)));
          }
          if (this.removeExistingImage) {
            return this.recipeService
              .deleteRecipeImage(saved.id)
              .pipe(map(() => saved), catchError(() => of(saved)));
          }
          return of(saved);
        }),
      )
      .subscribe({
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
