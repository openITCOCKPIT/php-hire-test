import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Recipe } from '../../models/recipe.model';

@Component({
  selector: 'app-recipe-preview',
  standalone: true,
  imports: [CommonModule],
  template: `
  <div class="modal d-block" style="background: rgba(0,0,0,0.4);" (click)="close.emit()">
    <div class="modal-dialog modal-lg modal-dialog-centered">
      <div class="modal-content shadow-lg border-0">
        <div class="modal-header  p-3">
          <h5 class="modal-title">Rezept Vorschau</h5>
          <button class="btn-close " (click)="close.emit()"></button>
        </div>
        
        <div class="modal-body p-4">
          <h3 class="fw-bold text-dark mb-3">{{ recipe?.title }}</h3>
          <p class="text-secondary">{{ recipe?.description }}</p>
          
          <hr>
          
          <h6 class="fw-bold mb-3"><i class="bi bi-journal-text"></i> ZUTATEN:</h6>
          <div class="list-group">
            @for (ing of recipe?.ingredients; track $index) {
              <div class="list-group-item d-flex justify-content-between align-items-center border-start-0 border-end-0">
                <span>{{ ing.name }}</span>
                <span class="badge bg-secondary rounded-pill">{{ ing.amount }}</span>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  </div>
`
})
export class RecipePreviewComponent {
  @Input() recipe: Recipe | null = null;
  @Output() close = new EventEmitter<void>();
}