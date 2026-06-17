import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { RecipeService } from '../../services/recipe.service';
import { Recipe, RecipeQueryParams } from '../../models/recipe';

type LoadState = 'loading' | 'loaded' | 'error';
type SortOption = 'created-DESC' | 'created-ASC' | 'title-ASC' | 'title-DESC';

@Component({
  selector: 'app-recipe-list',
  imports: [DatePipe, RouterLink, FormsModule],
  templateUrl: './recipe-list.html',
  styleUrl: './recipe-list.scss',
})
export class RecipeList implements OnInit {
  private readonly recipeService = inject(RecipeService);

  protected readonly recipes = signal<Recipe[]>([]);
  protected readonly state = signal<LoadState>('loading');
  protected sort: SortOption = 'created-DESC';

  ngOnInit(): void {
    this.load();
  }

  protected onSortChange(): void {
    this.load();
  }

  protected load(): void {
    this.state.set('loading');
    const [sort, direction] = this.sort.split('-') as [
      RecipeQueryParams['sort'],
      RecipeQueryParams['direction'],
    ];
    this.recipeService.getRecipes({ sort, direction }).subscribe({
      next: (recipes) => {
        this.recipes.set(recipes);
        this.state.set('loaded');
      },
      error: () => this.state.set('error'),
    });
  }
}
