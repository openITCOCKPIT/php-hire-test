import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  Recipe,
  RecipeListItem,
  RecipeFormData,
  RecipePreview,
  SortField,
  SortDirection
} from '../models/recipe.model';

@Injectable({
  providedIn: 'root'
})
export class RecipeService {
  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getRecipes(
    search: string = '',
    sortBy: SortField = 'created_at',
    sortDir: SortDirection = 'DESC'
  ): Observable<RecipeListItem[]> {
    let params = new HttpParams()
      .set('sort_by', sortBy)
      .set('sort_dir', sortDir);

    if (search.trim()) {
      params = params.set('search', search.trim());
    }

    return this.http.get<RecipeListItem[]>(`${this.apiUrl}/recipes`, { params });
  }

  getRecipe(id: number): Observable<Recipe> {
    return this.http.get<Recipe>(`${this.apiUrl}/recipes/${id}`);
  }

  getRecipePreview(id: number): Observable<RecipePreview> {
    return this.http.get<RecipePreview>(`${this.apiUrl}/recipes/${id}/preview`);
  }

  createRecipe(data: RecipeFormData): Observable<Recipe> {
    return this.http.post<Recipe>(`${this.apiUrl}/recipes`, data);
  }

  updateRecipe(id: number, data: RecipeFormData): Observable<Recipe> {
    return this.http.put<Recipe>(`${this.apiUrl}/recipes/${id}`, data);
  }

  deleteRecipe(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/recipes/${id}`);
  }

  sendRecipeByEmail(id: number, email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.apiUrl}/recipes/${id}/send-email`,
      { email }
    );
  }
}
