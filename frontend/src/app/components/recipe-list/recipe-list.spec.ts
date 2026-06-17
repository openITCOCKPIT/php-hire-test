import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { RecipeList } from './recipe-list';
import { environment } from '../../../environments/environment';
import { Recipe } from '../../models/recipe';

describe('RecipeList', () => {
  let httpMock: HttpTestingController;
  const url = `${environment.apiBaseUrl}/recipes`;

  const recipe: Recipe = {
    id: 1,
    title: 'Chocolate cake',
    description: 'Bake it.',
    created: '2026-06-15T00:00:00+00:00',
    ingredients: [{ id: 1, recipe_id: 1, name: 'sugar', amount: '100.00', unit: 'g' }],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecipeList],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('renders a card per recipe with the date formatted dd.MM.yyyy', () => {
    const fixture = TestBed.createComponent(RecipeList);
    fixture.detectChanges();

    httpMock.expectOne(url).flush({ recipes: [recipe] });
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const cards = compiled.querySelectorAll('.card');
    expect(cards.length).toBe(1);
    expect(compiled.textContent).toContain('Chocolate cake');
    expect(compiled.textContent).toContain('15.06.2026');
    expect(compiled.textContent).toContain('1 ingredient');
  });

  it('shows the empty state when there are no recipes', () => {
    const fixture = TestBed.createComponent(RecipeList);
    fixture.detectChanges();

    httpMock.expectOne(url).flush({ recipes: [] });
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('No recipes yet');
  });

  it('shows an error state when the request fails', () => {
    const fixture = TestBed.createComponent(RecipeList);
    fixture.detectChanges();

    httpMock.expectOne(url).error(new ProgressEvent('network error'));
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Could not load recipes');
  });
});
