import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RecipeService } from './recipe.service';
import { environment } from '../../environments/environment';
import { Recipe } from '../models/recipe';

describe('RecipeService', () => {
  let service: RecipeService;
  let httpMock: HttpTestingController;
  const base = `${environment.apiBaseUrl}/recipes`;

  const sampleRecipe: Recipe = {
    id: 1,
    title: 'Chocolate cake',
    description: 'Bake it.',
    created: '2026-06-15T00:00:00+00:00',
    ingredients: [{ id: 1, recipe_id: 1, name: 'sugar', amount: '100.00', unit: 'g' }],
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RecipeService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(RecipeService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('getRecipes() unwraps the recipes array', () => {
    let result: Recipe[] | undefined;
    service.getRecipes().subscribe((r) => (result = r));

    const req = httpMock.expectOne(base);
    expect(req.request.method).toBe('GET');
    req.flush({ recipes: [sampleRecipe] });

    expect(result?.length).toBe(1);
    expect(result?.[0].title).toBe('Chocolate cake');
  });

  it('getRecipes() forwards sort/search query params', () => {
    service.getRecipes({ sort: 'title', direction: 'ASC', search: 'choc' }).subscribe();

    const req = httpMock.expectOne((r) => r.url === base);
    expect(req.request.params.get('sort')).toBe('title');
    expect(req.request.params.get('direction')).toBe('ASC');
    expect(req.request.params.get('search')).toBe('choc');
    req.flush({ recipes: [] });
  });

  it('getRecipe(id) unwraps a single recipe', () => {
    let result: Recipe | undefined;
    service.getRecipe(1).subscribe((r) => (result = r));

    httpMock.expectOne(`${base}/1`).flush({ recipe: sampleRecipe });
    expect(result?.id).toBe(1);
  });

  it('getRecipePreview(id) calls the preview endpoint and unwraps it', () => {
    let result: { id: number; title: string } | undefined;
    service.getRecipePreview(1).subscribe((p) => (result = p));

    const req = httpMock.expectOne(`${base}/1/preview`);
    expect(req.request.method).toBe('GET');
    req.flush({ preview: { id: 1, title: 'Chocolate cake', ingredients: [], descriptionExcerpt: 'x' } });

    expect(result?.title).toBe('Chocolate cake');
  });

  it('sendRecipeEmail(id, email) POSTs to the send-mail endpoint', () => {
    service.sendRecipeEmail(1, 'friend@example.com').subscribe();

    const req = httpMock.expectOne(`${base}/1/send-mail`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ email: 'friend@example.com' });
    req.flush({ sent: true });
  });
});
