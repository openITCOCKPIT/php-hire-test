import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { RecipeListItem } from '../../models/recipe.model';

@Component({
  selector: 'app-recipe-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div
      class="card recipe-card shadow-sm"
      (mouseenter)="hoverStart.emit(recipe.id)"
      (mouseleave)="hoverEnd.emit()"
      [routerLink]="['/recipes', recipe.id]"
    >
      <div class="card-body d-flex flex-column">
        <h5 class="card-title text-truncate mb-2">{{ recipe.title }}</h5>
        <p class="card-text text-muted small flex-grow-1">
          {{ recipe.description | slice:0:100 }}{{ recipe.description.length > 100 ? '…' : '' }}
        </p>
        <div class="d-flex justify-content-between align-items-center mt-2">
          <div class="d-flex gap-2">
            @if (recipe.temperature) {
              <span class="badge bg-light text-dark border">
                <i class="bi bi-thermometer-half me-1"></i>{{ recipe.temperature }}°C
              </span>
            }
            @if (recipe.duration) {
              <span class="badge bg-light text-dark border">
                <i class="bi bi-clock me-1"></i>{{ recipe.duration }} min
              </span>
            }
          </div>
          <small class="text-muted">{{ recipe.created_at | date:'dd.MM.yyyy' }}</small>
        </div>
      </div>
    </div>
  `
})
export class RecipeCardComponent {
  @Input({ required: true }) recipe!: RecipeListItem;
  @Output() hoverStart = new EventEmitter<number>();
  @Output() hoverEnd = new EventEmitter<void>();
}
