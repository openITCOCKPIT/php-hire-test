import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { RecipeService } from '../../services/recipe.service';
import { Recipe } from '../../models/recipe.model';

@Component({
  selector: 'app-recipe-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="container" style="max-width: 800px;">
      @if (loading) {
        <div class="spinner-overlay">
          <div class="spinner-border text-primary" role="status"></div>
        </div>
      } @else if (error) {
        <div class="alert alert-danger">{{ error }}</div>
        <a routerLink="/" class="btn btn-outline-secondary">
          <i class="bi bi-arrow-left me-1"></i>Back to recipes
        </a>
      } @else if (recipe) {
        <a routerLink="/" class="btn btn-link text-decoration-none mb-3 ps-0">
          <i class="bi bi-arrow-left me-1"></i>Back to recipes
        </a>

        <div class="card shadow-sm">
          <div class="card-body p-4">
            <div class="d-flex justify-content-between align-items-start flex-wrap gap-2">
              <h1 class="h2">{{ recipe.title }}</h1>
              <div class="d-flex gap-2">
                <a [routerLink]="['/recipes', recipe.id, 'edit']" class="btn btn-outline-primary btn-sm">
                  <i class="bi bi-pencil me-1"></i>Edit
                </a>
                <button class="btn btn-outline-danger btn-sm" (click)="confirmDelete()">
                  <i class="bi bi-trash me-1"></i>Delete
                </button>
              </div>
            </div>

            <div class="d-flex gap-3 text-muted small mb-3">
              <span><i class="bi bi-calendar me-1"></i>{{ recipe.created_at | date:'dd.MM.yyyy' }}</span>
              @if (recipe.temperature) {
                <span><i class="bi bi-thermometer-half me-1"></i>{{ recipe.temperature }}°C</span>
              }
              @if (recipe.duration) {
                <span><i class="bi bi-clock me-1"></i>{{ recipe.duration }} min</span>
              }
            </div>

            <hr>

            <h5><i class="bi bi-basket me-2"></i>Ingredients</h5>
            <ul class="list-group list-group-flush mb-4">
              @for (ing of recipe.ingredients; track ing.id) {
                <li class="list-group-item d-flex">
                  <span class="badge bg-primary me-2" style="min-width: 60px;">{{ ing.amount }}</span>
                  {{ ing.name }}
                </li>
              }
            </ul>

            <h5><i class="bi bi-card-text me-2"></i>Description</h5>
            <p class="text-body" style="white-space: pre-line;">{{ recipe.description }}</p>

            <hr>

            <h5><i class="bi bi-envelope me-2"></i>Share by Email</h5>
            <form (ngSubmit)="sendEmail()" class="row g-2 align-items-start">
              <div class="col-md-8">
                <input
                  type="email"
                  class="form-control"
                  placeholder="recipient@example.com"
                  [(ngModel)]="emailAddress"
                  name="email"
                  required
                  [disabled]="sendingEmail"
                >
                @if (emailError) {
                  <small class="text-danger">{{ emailError }}</small>
                }
              </div>
              <div class="col-md-4">
                <button type="submit" class="btn btn-primary w-100" [disabled]="sendingEmail || !emailAddress">
                  @if (sendingEmail) {
                    <span class="spinner-border spinner-border-sm me-1"></span>
                  } @else {
                    <i class="bi bi-send me-1"></i>
                  }
                  Send Recipe
                </button>
              </div>
            </form>
            @if (emailSuccess) {
              <div class="alert alert-success mt-3 mb-0 py-2">
                <i class="bi bi-check-circle me-1"></i>{{ emailSuccess }}
              </div>
            }
          </div>
        </div>
      }
    </div>
  `
})
export class RecipeDetailComponent implements OnInit {
  recipe: Recipe | null = null;
  loading = true;
  error = '';

  emailAddress = '';
  sendingEmail = false;
  emailError = '';
  emailSuccess = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private recipeService: RecipeService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!id) {
      this.error = 'Invalid recipe ID';
      this.loading = false;
      return;
    }

    this.recipeService.getRecipe(id).subscribe({
      next: (recipe) => {
        this.recipe = recipe;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.status === 404
          ? 'Recipe not found.'
          : 'Failed to load recipe. Please check that the API server is running.';
        this.loading = false;
      }
    });
  }

  confirmDelete(): void {
    if (!this.recipe) return;

    if (confirm(`Are you sure you want to delete "${this.recipe.title}"? This cannot be undone.`)) {
      this.recipeService.deleteRecipe(this.recipe.id).subscribe({
        next: () => this.router.navigate(['/']),
        error: () => alert('Failed to delete recipe.')
      });
    }
  }

  sendEmail(): void {
    if (!this.recipe || !this.emailAddress) return;

    this.sendingEmail = true;
    this.emailError = '';
    this.emailSuccess = '';

    this.recipeService.sendRecipeByEmail(this.recipe.id, this.emailAddress).subscribe({
      next: (res) => {
        this.sendingEmail = false;
        this.emailSuccess = res.message;
        this.emailAddress = '';
      },
      error: (err) => {
        this.sendingEmail = false;
        this.emailError = err.error?.errors?.email || err.error?.error || 'Failed to send email.';
      }
    });
  }
}
