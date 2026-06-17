import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router, provideRouter } from '@angular/router';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RecipeForm } from './recipe-form';
import { environment } from '../../../environments/environment';

describe('RecipeForm', () => {
  let fixture: ComponentFixture<RecipeForm>;
  let component: RecipeForm;
  let httpMock: HttpTestingController;
  let router: Router;
  const url = `${environment.apiBaseUrl}/recipes`;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecipeForm],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(RecipeForm);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  /** Access protected members for testing. */
  const c = () => component as unknown as {
    form: import('@angular/forms').FormGroup;
    ingredients: import('@angular/forms').FormArray;
    addIngredient: () => void;
    removeIngredient: (i: number) => void;
    submit: () => void;
  };

  it('starts with one ingredient row and is invalid when empty', () => {
    expect(c().ingredients.length).toBe(1);
    expect(c().form.invalid).toBeTrue();
  });

  it('adds and removes ingredient rows, keeping at least one', () => {
    c().addIngredient();
    expect(c().ingredients.length).toBe(2);

    c().removeIngredient(1);
    expect(c().ingredients.length).toBe(1);

    // cannot remove the last remaining row
    c().removeIngredient(0);
    expect(c().ingredients.length).toBe(1);
  });

  it('does not POST when the form is invalid', () => {
    c().submit();
    httpMock.expectNone(url);
    expect(c().form.touched).toBeTrue();
  });

  it('POSTs a valid recipe and navigates to the list on success', () => {
    const navigateSpy = spyOn(router, 'navigate');
    c().form.patchValue({ title: 'Pancakes', description: 'Mix' });
    c().ingredients.at(0).patchValue({ name: 'flour', amount: 200, unit: 'g' });

    c().submit();

    const req = httpMock.expectOne(url);
    expect(req.request.method).toBe('POST');
    expect(req.request.body.title).toBe('Pancakes');
    req.flush({ recipe: { id: 5, title: 'Pancakes', description: 'Mix', temperature: null, duration: null, created: '', ingredients: [] } });

    expect(navigateSpy).toHaveBeenCalledWith(['/']);
  });

  it('maps a 422 title error back onto the title control', () => {
    c().form.patchValue({ title: 'x' });
    c().ingredients.at(0).patchValue({ name: 'flour', amount: 200, unit: 'g' });

    c().submit();

    httpMock.expectOne(url).flush(
      { errors: { title: { _required: 'This field is required' } } },
      { status: 422, statusText: 'Unprocessable Entity' },
    );

    expect(c().form.get('title')?.hasError('server')).toBeTrue();
  });
});
