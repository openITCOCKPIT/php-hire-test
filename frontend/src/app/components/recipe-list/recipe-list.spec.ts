import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
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

    httpMock.expectOne((r) => r.url === url).flush({ recipes: [recipe] });
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

    httpMock.expectOne((r) => r.url === url).flush({ recipes: [] });
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('No recipes yet');
  });

  it('shows an error state when the request fails', () => {
    const fixture = TestBed.createComponent(RecipeList);
    fixture.detectChanges();

    httpMock.expectOne((r) => r.url === url).error(new ProgressEvent('network error'));
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Could not load recipes');
  });

  it('requests the default sort on load and re-requests on sort change', () => {
    const fixture = TestBed.createComponent(RecipeList);
    const component = fixture.componentInstance as unknown as {
      sort: string;
      onSortChange: () => void;
    };
    fixture.detectChanges();

    const first = httpMock.expectOne((r) => r.url === url);
    expect(first.request.params.get('sort')).toBe('created');
    expect(first.request.params.get('direction')).toBe('DESC');
    first.flush({ recipes: [] });

    component.sort = 'title-ASC';
    component.onSortChange();

    const second = httpMock.expectOne((r) => r.url === url);
    expect(second.request.params.get('sort')).toBe('title');
    expect(second.request.params.get('direction')).toBe('ASC');
    second.flush({ recipes: [] });
  });

  it('debounces the search and issues a single request after typing settles', fakeAsync(() => {
    const fixture = TestBed.createComponent(RecipeList);
    const component = fixture.componentInstance as unknown as {
      search: string;
      onSearchChange: () => void;
    };
    fixture.detectChanges();

    // initial load() request
    httpMock.expectOne((r) => r.url === url).flush({ recipes: [] });

    // rapid typing — three keystrokes within the debounce window
    component.search = 'c';
    component.onSearchChange();
    tick(100);
    component.search = 'ch';
    component.onSearchChange();
    tick(100);
    component.search = 'choc';
    component.onSearchChange();

    // before the debounce elapses, no request has gone out
    httpMock.expectNone((r) => r.url === url);

    tick(300);

    // exactly one request, for the final term
    const req = httpMock.expectOne((r) => r.url === url);
    expect(req.request.params.get('search')).toBe('choc');
    req.flush({ recipes: [] });
  }));
});
