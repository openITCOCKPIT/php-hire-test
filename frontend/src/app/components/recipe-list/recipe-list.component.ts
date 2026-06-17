import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, switchMap, of, catchError, Subscription } from 'rxjs';
import { RecipeService } from '../../services/recipe.service';
import { RecipeListItem, RecipePreview, SortField, SortDirection } from '../../models/recipe.model';
import { RecipeCardComponent } from '../recipe-card/recipe-card.component';

@Component({
  selector: 'app-recipe-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RecipeCardComponent],
  template: `
    <div class="container">
      <div class="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <h1 class="h3 mb-0">
          <i class="bi bi-egg-fried me-2 text-primary"></i>Browse Recipes
        </h1>
        <a routerLink="/recipes/new" class="btn btn-primary">
          <i class="bi bi-plus-circle me-1"></i>New Recipe
        </a>
      </div>

      <div class="row g-2 mb-4">
        <div class="col-md-6">
          <div class="input-group">
            <span class="input-group-text bg-white"><i class="bi bi-search"></i></span>
            <input
              type="text"
              class="form-control"
              placeholder="Search recipes by title or description..."
              [(ngModel)]="searchTerm"
              (ngModelChange)="onSearchChange($event)"
            >
            @if (searchTerm) {
              <button class="btn btn-outline-secondary" type="button" (click)="clearSearch()">
                <i class="bi bi-x-lg"></i>
              </button>
            }
          </div>
        </div>
        <div class="col-md-3">
          <select class="form-select" [(ngModel)]="sortBy" (ngModelChange)="onSortChange()">
            <option value="created_at">Sort by Date</option>
            <option value="title">Sort by Title</option>
            <option value="duration">Sort by Duration</option>
          </select>
        </div>
        <div class="col-md-3">
          <select class="form-select" [(ngModel)]="sortDir" (ngModelChange)="onSortChange()">
            <option value="DESC">Descending</option>
            <option value="ASC">Ascending</option>
          </select>
        </div>
      </div>

      @if (loading) {
        <div class="spinner-overlay">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
        </div>
      } @else if (error) {
        <div class="alert alert-danger">
          <i class="bi bi-exclamation-triangle me-2"></i>{{ error }}
        </div>
      } @else if (recipes.length === 0) {
        <div class="text-center py-5 text-muted">
          <i class="bi bi-journal-x display-1 d-block mb-3"></i>
          <p class="fs-5">No recipes found.</p>
          @if (searchTerm) {
            <button class="btn btn-link" (click)="clearSearch()">Clear search</button>
          } @else {
            <a routerLink="/recipes/new" class="btn btn-primary mt-2">Create your first recipe</a>
          }
        </div>
      } @else {
        <div class="row g-3">
          @for (recipe of recipes; track recipe.id) {
            <div class="col-md-6 col-lg-4 position-relative">
              <app-recipe-card
                [recipe]="recipe"
                (hoverStart)="onHoverStart($event)"
                (hoverEnd)="onHoverEnd()"
              />
              @if (hoveredRecipeId === recipe.id && previewData) {
                <div class="preview-popover">
                  <h6 class="text-primary mb-2">
                    <i class="bi bi-eye me-1"></i>{{ previewData.title }}
                  </h6>
                  <p class="small text-muted mb-2">{{ previewData.description }}</p>
                  @if (previewData.ingredients.length > 0) {
                    <div class="small">
                      <strong>Key ingredients:</strong>
                      <ul class="mb-0 ps-3">
                        @for (ing of previewData.ingredients; track ing.id) {
                          <li>{{ ing.amount }} {{ ing.name }}</li>
                        }
                      </ul>
                    </div>
                  }
                </div>
              } @else if (hoveredRecipeId === recipe.id && previewLoading) {
                <div class="preview-popover text-center">
                  <div class="spinner-border spinner-border-sm text-primary" role="status"></div>
                </div>
              }
            </div>
          }
        </div>
      }
    </div>
  `
})
export class RecipeListComponent implements OnInit, OnDestroy {
  recipes: RecipeListItem[] = [];
  loading = true;
  error = '';

  searchTerm = '';
  sortBy: SortField = 'created_at';
  sortDir: SortDirection = 'DESC';

  hoveredRecipeId: number | null = null;
  previewData: RecipePreview | null = null;
  previewLoading = false;

  private searchSubject = new Subject<string>();
  private hoverSubject = new Subject<number>();
  private subscriptions = new Subscription();

  constructor(private recipeService: RecipeService) {}

  ngOnInit(): void {
    this.loadRecipes();

    // Debounced search
    this.subscriptions.add(
      this.searchSubject.pipe(
        debounceTime(350),
        distinctUntilChanged()
      ).subscribe(() => this.loadRecipes())
    );

    // Debounced hover preview (avoids spamming API on quick mouse movement)
    this.subscriptions.add(
      this.hoverSubject.pipe(
        debounceTime(250),
        distinctUntilChanged(),
        switchMap(id => {
          this.previewLoading = true;
          return this.recipeService.getRecipePreview(id).pipe(
            catchError(() => {
              this.previewLoading = false;
              return of(null);
            })
          );
        })
      ).subscribe(preview => {
        this.previewLoading = false;
        this.previewData = preview;
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadRecipes(): void {
    this.loading = true;
    this.error = '';

    this.recipeService.getRecipes(this.searchTerm, this.sortBy, this.sortDir).subscribe({
      next: (recipes) => {
        this.recipes = recipes;
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load recipes. Please check that the API server is running.';
        this.loading = false;
      }
    });
  }

  onSearchChange(value: string): void {
    this.searchSubject.next(value);
  }

  onSortChange(): void {
    this.loadRecipes();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.loadRecipes();
  }

  onHoverStart(recipeId: number): void {
    this.hoveredRecipeId = recipeId;
    this.previewData = null;
    this.hoverSubject.next(recipeId);
  }

  onHoverEnd(): void {
    this.hoveredRecipeId = null;
    this.previewData = null;
    this.previewLoading = false;
  }
}
