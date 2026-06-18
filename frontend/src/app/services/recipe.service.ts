import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { NewRecipe, Recipe, RecipePreview, RecipeQueryParams } from '../models/recipe';

/**
 * Single HTTP abstraction for recipes. Components depend on this, not on
 * HttpClient directly, so transport and presentation stay separate.
 */
@Injectable({ providedIn: 'root' })
export class RecipeService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/recipes`;

  /** GET /recipes — list, optionally filtered/sorted (params used from #10/#11). */
  getRecipes(params: RecipeQueryParams = {}): Observable<Recipe[]> {
    let httpParams = new HttpParams();
    if (params.sort) {
      httpParams = httpParams.set('sort', params.sort);
    }
    if (params.direction) {
      httpParams = httpParams.set('direction', params.direction);
    }
    if (params.search) {
      httpParams = httpParams.set('search', params.search);
    }

    return this.http
      .get<{ recipes: Recipe[] }>(this.baseUrl, { params: httpParams })
      .pipe(map((response) => response.recipes));
  }

  /** GET /recipes/{id} — a single recipe with its ingredients. */
  getRecipe(id: number): Observable<Recipe> {
    return this.http
      .get<{ recipe: Recipe }>(`${this.baseUrl}/${id}`)
      .pipe(map((response) => response.recipe));
  }

  /** GET /recipes/{id}/preview — trimmed payload for the hover preview (#12). */
  getRecipePreview(id: number): Observable<RecipePreview> {
    return this.http
      .get<{ preview: RecipePreview }>(`${this.baseUrl}/${id}/preview`)
      .pipe(map((response) => response.preview));
  }

  /** POST /recipes — create a recipe (issue #9). */
  createRecipe(recipe: NewRecipe): Observable<Recipe> {
    return this.http
      .post<{ recipe: Recipe }>(this.baseUrl, recipe)
      .pipe(map((response) => response.recipe));
  }

  /** PUT /recipes/{id} — update a recipe and replace its ingredients (issue #17). */
  updateRecipe(id: number, recipe: NewRecipe): Observable<Recipe> {
    return this.http
      .put<{ recipe: Recipe }>(`${this.baseUrl}/${id}`, recipe)
      .pipe(map((response) => response.recipe));
  }

  /** DELETE /recipes/{id} — delete a recipe (issue #17). */
  deleteRecipe(id: number): Observable<{ deleted: boolean }> {
    return this.http.delete<{ deleted: boolean }>(`${this.baseUrl}/${id}`);
  }

  /** POST /recipes/{id}/send-mail — e-mail a recipe to an address (issue #13). */
  sendRecipeEmail(id: number, email: string): Observable<{ sent: boolean }> {
    return this.http.post<{ sent: boolean }>(`${this.baseUrl}/${id}/send-mail`, { email });
  }

  /** POST /recipes/{id}/image — upload (multipart) a hero image (issue #19). */
  uploadRecipeImage(id: number, file: File): Observable<Recipe> {
    const form = new FormData();
    form.append('image', file);
    return this.http
      .post<{ recipe: Recipe }>(`${this.baseUrl}/${id}/image`, form)
      .pipe(map((response) => response.recipe));
  }

  /** DELETE /recipes/{id}/image — remove the hero image (issue #19). */
  deleteRecipeImage(id: number): Observable<{ deleted: boolean }> {
    return this.http.delete<{ deleted: boolean }>(`${this.baseUrl}/${id}/image`);
  }
}
