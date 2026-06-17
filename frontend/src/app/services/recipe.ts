import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Recipe, ApiResponse } from '../models/recipe.model';
import { environment } from '../../environments/environment';
import { HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class RecipeService {

  private apiUrl = `${environment.apiUrl}/recipes.json`;

  constructor(private http: HttpClient) { }

  // Suche, Sortierung
  getRecipes(search: string = '', sort: string = 'created', direction: string = 'desc'): Observable<ApiResponse<Recipe[]>> {
    const params = new HttpParams()
      .set('search', search)
      .set('sort', sort)
      .set('direction', direction);

    return this.http.get<ApiResponse<Recipe[]>>(this.apiUrl, { params });
  }

  /**
   * 2. ميزة جلب تفاصيل وصفة واحدة (تستخدم للـ AJAX Hover Preview والـ View Full Recipe)
   */
  getRecipeById(id: number): Observable<ApiResponse<Recipe>> {
    // بناء الرابط ديناميكياً حسب الـ ID
    return this.http.get<ApiResponse<Recipe>>(`${environment.apiUrl}/recipes/${id}.json`);
  }

  addRecipe(recipe: Recipe): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    return this.http.post(`${environment.apiUrl}/add-recipe`, recipe, { headers });
  }

  sendEmail(id: number, email: string): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(`${environment.apiUrl}/recipes/${id}/send-email`, { email });
  }

  improveDescription(description: string): Observable<any> {
    const apiKey = environment.GROQ_API_KEY;
    const url = environment.GROQ_API_URL;

    const body = {
      model: 'groq/compound-mini',
      messages: [{
        role: "user",
        content: `Du bist ein professioneller Koch-Assistent. Optimiere den folgenden Rezepttext, mache ihn ansprechend und strukturiert auf Deutsch: ${description}`
      }],
      temperature: 0.7
    };

    return this.http.post(url, body, {
      headers: { 'Authorization': `Bearer ${apiKey}` }
    });
  }

}