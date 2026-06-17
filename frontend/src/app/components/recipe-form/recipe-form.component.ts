import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { RecipeService } from '../../services/recipe.service';
import { Ingredient, RecipeFormData } from '../../models/recipe.model';

@Component({
  selector: 'app-recipe-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="container" style="max-width: 700px;">
      <a routerLink="/" class="btn btn-link text-decoration-none mb-3 ps-0">
        <i class="bi bi-arrow-left me-1"></i>Back to recipes
      </a>

      <div class="card shadow-sm">
        <div class="card-body p-4">
          <h1 class="h3 mb-4">
            <i class="bi bi-{{ isEditMode ? 'pencil' : 'plus-circle' }} me-2 text-primary"></i>
            {{ isEditMode ? 'Edit Recipe' : 'New Recipe' }}
          </h1>

          @if (loading) {
            <div class="spinner-overlay">
              <div class="spinner-border text-primary" role="status"></div>
            </div>
          } @else {
            <form (ngSubmit)="onSubmit()" #form="ngForm">
              <div class="mb-3">
                <label class="form-label fw-semibold">Title <span class="text-danger">*</span></label>
                <input
                  type="text"
                  class="form-control"
                  [(ngModel)]="formData.title"
                  name="title"
                  required
                  maxlength="255"
                  placeholder="e.g. Chocolate Cake"
                >
                @if (errors['title']) {
                  <small class="text-danger">{{ errors['title'] }}</small>
                }
              </div>

              <div class="row mb-3">
                <div class="col-md-6">
                  <label class="form-label fw-semibold">Temperature (°C)</label>
                  <input
                    type="number"
                    class="form-control"
                    [(ngModel)]="formData.temperature"
                    name="temperature"
                    placeholder="e.g. 200"
                  >
                </div>
                <div class="col-md-6">
                  <label class="form-label fw-semibold">Duration (minutes)</label>
                  <input
                    type="number"
                    class="form-control"
                    [(ngModel)]="formData.duration"
                    name="duration"
                    placeholder="e.g. 40"
                  >
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label fw-semibold">Ingredients</label>
                @for (ing of formData.ingredients; track $index; let i = $index) {
                  <div class="ingredient-row">
                    <input
                      type="text"
                      class="form-control"
                      style="max-width: 120px;"
                      placeholder="Amount"
                      [(ngModel)]="ing.amount"
                      name="ing-amount-{{i}}"
                    >
                    <input
                      type="text"
                      class="form-control"
                      placeholder="Ingredient name"
                      [(ngModel)]="ing.name"
                      name="ing-name-{{i}}"
                    >
                    <button
                      type="button"
                      class="btn btn-outline-danger btn-sm"
                      (click)="removeIngredient(i)"
                      title="Remove ingredient"
                    >
                      <i class="bi bi-x-lg"></i>
                    </button>
                  </div>
                }
                <button type="button" class="btn btn-outline-primary btn-sm mt-1" (click)="addIngredient()">
                  <i class="bi bi-plus-lg me-1"></i>Add Ingredient
                </button>
              </div>

              <div class="mb-3">
                <label class="form-label fw-semibold">Description <span class="text-danger">*</span></label>
                <textarea
                  class="form-control"
                  rows="6"
                  [(ngModel)]="formData.description"
                  name="description"
                  required
                  placeholder="Describe how to prepare this recipe..."
                ></textarea>
                @if (errors['description']) {
                  <small class="text-danger">{{ errors['description'] }}</small>
                }
              </div>

              @if (submitError) {
                <div class="alert alert-danger">{{ submitError }}</div>
              }

              <div class="d-flex gap-2 justify-content-end">
                <a routerLink="/" class="btn btn-outline-secondary">Cancel</a>
                <button type="submit" class="btn btn-primary" [disabled]="submitting">
                  @if (submitting) {
                    <span class="spinner-border spinner-border-sm me-1"></span>
                  }
                  {{ isEditMode ? 'Save Changes' : 'Create Recipe' }}
                </button>
              </div>
            </form>
          }
        </div>
      </div>
    </div>
  `
})
export class RecipeFormComponent implements OnInit {
  isEditMode = false;
  recipeId: number | null = null;
  loading = false;
  submitting = false;
  submitError = '';
  errors: Record<string, string> = {};

  formData: RecipeFormData = {
    title: '',
    description: '',
    temperature: null,
    duration: null,
    ingredients: []
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private recipeService: RecipeService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');

    if (idParam) {
      this.isEditMode = true;
      this.recipeId = Number(idParam);
      this.loadRecipe(this.recipeId);
    } else {
      // Start with one empty ingredient row for convenience
      this.addIngredient();
    }
  }

  loadRecipe(id: number): void {
    this.loading = true;
    this.recipeService.getRecipe(id).subscribe({
      next: (recipe) => {
        this.formData = {
          title: recipe.title,
          description: recipe.description,
          temperature: recipe.temperature,
          duration: recipe.duration,
          ingredients: recipe.ingredients.length
            ? recipe.ingredients.map(i => ({ amount: i.amount, name: i.name }))
            : []
        };
        if (this.formData.ingredients.length === 0) {
          this.addIngredient();
        }
        this.loading = false;
      },
      error: () => {
        this.submitError = 'Failed to load recipe.';
        this.loading = false;
      }
    });
  }

  addIngredient(): void {
    this.formData.ingredients.push({ amount: '', name: '' });
  }

  removeIngredient(index: number): void {
    this.formData.ingredients.splice(index, 1);
  }

  onSubmit(): void {
    this.errors = {};
    this.submitError = '';

    if (!this.formData.title.trim()) {
      this.errors['title'] = 'Title is required';
    }
    if (!this.formData.description.trim()) {
      this.errors['description'] = 'Description is required';
    }
    if (Object.keys(this.errors).length > 0) {
      return;
    }

    this.submitting = true;

    // Filter out empty ingredient rows
    const payload: RecipeFormData = {
      ...this.formData,
      ingredients: this.formData.ingredients.filter((i: Ingredient) => i.name.trim() !== '')
    };

    const request = this.isEditMode && this.recipeId
      ? this.recipeService.updateRecipe(this.recipeId, payload)
      : this.recipeService.createRecipe(payload);

    request.subscribe({
      next: (recipe) => {
        this.submitting = false;
        this.router.navigate(['/recipes', recipe.id]);
      },
      error: (err) => {
        this.submitting = false;
        if (err.status === 422 && err.error?.errors) {
          this.errors = err.error.errors;
        } else {
          this.submitError = 'Failed to save recipe. Please try again.';
        }
      }
    });
  }
}
