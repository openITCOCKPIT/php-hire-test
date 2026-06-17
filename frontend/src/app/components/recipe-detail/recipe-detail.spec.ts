import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { convertToParamMap, ParamMap } from '@angular/router';
import { RecipeDetail } from './recipe-detail';
import { environment } from '../../../environments/environment';
import { Recipe } from '../../models/recipe';

describe('RecipeDetail', () => {
  let httpMock: HttpTestingController;
  let paramMap$: BehaviorSubject<ParamMap>;
  const base = `${environment.apiBaseUrl}/recipes`;

  const recipe: Recipe = {
    id: 1,
    title: 'Chocolate cake',
    description: 'Bake it at 200°C.',
    temperature: 200,
    duration: 40,
    created: '2026-06-15T00:00:00+00:00',
    ingredients: [
      { id: 1, recipe_id: 1, name: 'sugar', amount: '100.00', unit: 'g' },
      { id: 2, recipe_id: 1, name: 'milk', amount: '1.50', unit: 'l' },
    ],
  };

  beforeEach(async () => {
    paramMap$ = new BehaviorSubject<ParamMap>(convertToParamMap({ id: '1' }));

    await TestBed.configureTestingModule({
      imports: [RecipeDetail],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ActivatedRoute, useValue: { paramMap: paramMap$.asObservable() } },
      ],
    }).compileComponents();
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('loads and renders the recipe with formatted ingredients', () => {
    const fixture = TestBed.createComponent(RecipeDetail);
    fixture.detectChanges();

    httpMock.expectOne(`${base}/1`).flush({ recipe });
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Chocolate cake');
    expect(text).toContain('15.06.2026');
    expect(text).toContain('100g sugar'); // "100.00" -> "100"
    expect(text).toContain('1.5l milk'); // "1.50" -> "1.5"
  });

  it('shows a not-found message on a 404', () => {
    const fixture = TestBed.createComponent(RecipeDetail);
    fixture.detectChanges();

    httpMock.expectOne(`${base}/1`).flush({ message: 'Recipe not found' }, {
      status: 404,
      statusText: 'Not Found',
    });
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('No recipe found');
  });

  it('reloads when the route id changes', () => {
    const fixture = TestBed.createComponent(RecipeDetail);
    fixture.detectChanges();
    httpMock.expectOne(`${base}/1`).flush({ recipe });

    paramMap$.next(convertToParamMap({ id: '2' }));
    fixture.detectChanges();

    const req = httpMock.expectOne(`${base}/2`);
    expect(req.request.method).toBe('GET');
    req.flush({ recipe: { ...recipe, id: 2, title: 'Pancakes' } });
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Pancakes');
  });

  it('sends the recipe by e-mail and shows a success message', () => {
    const fixture = TestBed.createComponent(RecipeDetail);
    const component = fixture.componentInstance as unknown as {
      openMailModal: () => void;
      sendMail: () => void;
      mailTo: string;
      mailState: () => string;
    };
    fixture.detectChanges();
    httpMock.expectOne(`${base}/1`).flush({ recipe });

    component.openMailModal();
    component.mailTo = 'friend@example.com';
    component.sendMail();

    const req = httpMock.expectOne(`${base}/1/send-mail`);
    expect(req.request.body).toEqual({ email: 'friend@example.com' });
    req.flush({ sent: true });

    expect(component.mailState()).toBe('sent');
  });

  it('deletes the recipe after confirmation and navigates to the list', () => {
    const fixture = TestBed.createComponent(RecipeDetail);
    const router = TestBed.inject(Router);
    const navigateSpy = spyOn(router, 'navigate');
    spyOn(window, 'confirm').and.returnValue(true);
    const component = fixture.componentInstance as unknown as { deleteRecipe: () => void };
    fixture.detectChanges();
    httpMock.expectOne(`${base}/1`).flush({ recipe });

    component.deleteRecipe();

    const req = httpMock.expectOne(`${base}/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush({ deleted: true });

    expect(navigateSpy).toHaveBeenCalledWith(['/']);
  });

  it('does not delete when the confirmation is cancelled', () => {
    const fixture = TestBed.createComponent(RecipeDetail);
    spyOn(window, 'confirm').and.returnValue(false);
    const component = fixture.componentInstance as unknown as { deleteRecipe: () => void };
    fixture.detectChanges();
    httpMock.expectOne(`${base}/1`).flush({ recipe });

    component.deleteRecipe();

    httpMock.expectNone((r) => r.method === 'DELETE');
  });

  it('rejects an invalid e-mail without calling the API', () => {
    const fixture = TestBed.createComponent(RecipeDetail);
    const component = fixture.componentInstance as unknown as {
      openMailModal: () => void;
      sendMail: () => void;
      mailTo: string;
      mailError: () => string | null;
    };
    fixture.detectChanges();
    httpMock.expectOne(`${base}/1`).flush({ recipe });

    component.openMailModal();
    component.mailTo = 'not-an-email';
    component.sendMail();

    httpMock.expectNone(`${base}/1/send-mail`);
    expect(component.mailError()).toBeTruthy();
  });
});
