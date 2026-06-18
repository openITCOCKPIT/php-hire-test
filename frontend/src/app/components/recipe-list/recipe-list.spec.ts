import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, ParamMap, convertToParamMap, provideRouter } from '@angular/router';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { RecipeList } from './recipe-list';
import { environment } from '../../../environments/environment';
import { Recipe } from '../../models/recipe';

describe('RecipeList', () => {
  let httpMock: HttpTestingController;
  // The list reads its search term from the URL; drive it via this subject.
  let queryParamMap$: BehaviorSubject<ParamMap>;
  const url = `${environment.apiBaseUrl}/recipes`;

  const recipe: Recipe = {
    id: 1,
    title: 'Chocolate cake',
    description: 'Bake it.',
    temperature: 200,
    duration: 40,
    image_path: null,
    created: '2026-06-15T00:00:00+00:00',
    ingredients: [{ id: 1, recipe_id: 1, name: 'sugar', amount: '100.00', unit: 'g' }],
  };

  beforeEach(async () => {
    queryParamMap$ = new BehaviorSubject<ParamMap>(convertToParamMap({}));
    await TestBed.configureTestingModule({
      imports: [RecipeList],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ActivatedRoute, useValue: { queryParamMap: queryParamMap$.asObservable() } },
      ],
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

  it('caches the hover preview: hovering the same title twice fires one request', fakeAsync(() => {
    const fixture = TestBed.createComponent(RecipeList);
    const component = fixture.componentInstance as unknown as {
      onTitleEnter: (id: number, e: MouseEvent) => void;
      onTitleLeave: () => void;
      preview: () => unknown;
    };
    fixture.detectChanges();
    httpMock.expectOne((r) => r.url === url).flush({ recipes: [] });

    const event = { target: document.createElement('a') } as unknown as MouseEvent;
    const previewUrl = `${url}/1/preview`;
    const previewBody = { preview: { id: 1, title: 'Chocolate cake', image_path: null, ingredients: [], descriptionExcerpt: 'x' } };

    // first hover → one request after the 200ms debounce
    component.onTitleEnter(1, event);
    tick(200);
    httpMock.expectOne(previewUrl).flush(previewBody);
    expect(component.preview()).toBeTruthy();

    component.onTitleLeave();
    expect(component.preview()).toBeNull();

    // second hover of the same id → served from cache, NO new request
    component.onTitleEnter(1, event);
    tick(200);
    httpMock.expectNone(previewUrl);
    expect(component.preview()).toBeTruthy();
  }));

  it('does not fetch a preview if the cursor leaves during the debounce window', fakeAsync(() => {
    const fixture = TestBed.createComponent(RecipeList);
    const component = fixture.componentInstance as unknown as {
      onTitleEnter: (id: number, e: MouseEvent) => void;
      onTitleLeave: () => void;
    };
    fixture.detectChanges();
    httpMock.expectOne((r) => r.url === url).flush({ recipes: [] });

    const event = { target: document.createElement('a') } as unknown as MouseEvent;
    component.onTitleEnter(2, event);
    tick(100); // leave before the 200ms debounce elapses
    component.onTitleLeave();
    tick(200);

    httpMock.expectNone(`${url}/2/preview`);
  }));

  it('reloads with the search filter when the URL ?search= changes', () => {
    const fixture = TestBed.createComponent(RecipeList);
    fixture.detectChanges();

    // initial load with no search term
    const initial = httpMock.expectOne((r) => r.url === url);
    expect(initial.request.params.has('search')).toBeFalse();
    initial.flush({ recipes: [] });

    // the navbar pushes a new term into the URL
    queryParamMap$.next(convertToParamMap({ search: 'choc' }));

    const filtered = httpMock.expectOne((r) => r.url === url);
    expect(filtered.request.params.get('search')).toBe('choc');
    filtered.flush({ recipes: [recipe] });

    expect(fixture.componentInstance['search']).toBe('choc');
  });

  it('does not reload when the search term is unchanged', () => {
    const fixture = TestBed.createComponent(RecipeList);
    fixture.detectChanges();
    httpMock.expectOne((r) => r.url === url).flush({ recipes: [] });

    // an emission with the same (empty) term must not trigger a second request
    queryParamMap$.next(convertToParamMap({ other: 'x' }));
    httpMock.expectNone((r) => r.url === url);
  });
});
