import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Router, provideRouter } from '@angular/router';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { App } from './app';
import { routes } from './app.routes';
import { RecipeFilterService } from './services/recipe-filter.service';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
  });

  const members = (fixture: ReturnType<typeof TestBed.createComponent<App>>) =>
    fixture.componentInstance as unknown as {
      searchTerm: string;
      onSearchInput: () => void;
      setDuration: (v: string) => void;
      resetFilters: () => void;
    };

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders the brand title', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.navbar-brand')?.textContent).toContain('Recipe Collection');
  });

  it('navigates to the filtered list after typing settles', fakeAsync(() => {
    const fixture = TestBed.createComponent(App);
    const router = TestBed.inject(Router);
    const navigateSpy = spyOn(router, 'navigate').and.resolveTo(true);
    fixture.detectChanges();
    const app = members(fixture);

    app.searchTerm = 'cake';
    app.onSearchInput();
    tick(300);

    expect(navigateSpy).toHaveBeenCalledWith(['/'], { queryParams: { search: 'cake' } });
  }));

  it('clears the query param when the search box is emptied', fakeAsync(() => {
    const fixture = TestBed.createComponent(App);
    const router = TestBed.inject(Router);
    const navigateSpy = spyOn(router, 'navigate').and.resolveTo(true);
    fixture.detectChanges();
    const app = members(fixture);

    app.searchTerm = '';
    app.onSearchInput();
    tick(300);

    expect(navigateSpy).toHaveBeenCalledWith(['/'], { queryParams: { search: null } });
  }));

  it('updates the filter service when a duration chip is chosen', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    members(fixture).setDuration('lt15');
    expect(TestBed.inject(RecipeFilterService).duration()).toBe('lt15');
  });

  it('preserves an active search: changing a filter while on /?search= does not navigate', () => {
    const fixture = TestBed.createComponent(App);
    const router = TestBed.inject(Router);
    const navigateSpy = spyOn(router, 'navigate').and.resolveTo(true);
    fixture.detectChanges();
    (fixture.componentInstance as unknown as { currentUrl: { set(v: string): void } }).currentUrl.set(
      '/?search=cake',
    );
    members(fixture).setDuration('lt15');
    expect(navigateSpy).not.toHaveBeenCalled();
  });

  it('navigates to the list when a filter changes from a detail page', () => {
    const fixture = TestBed.createComponent(App);
    const router = TestBed.inject(Router);
    const navigateSpy = spyOn(router, 'navigate').and.resolveTo(true);
    fixture.detectChanges();
    (fixture.componentInstance as unknown as { currentUrl: { set(v: string): void } }).currentUrl.set(
      '/recipes/5',
    );
    members(fixture).setDuration('lt15');
    expect(navigateSpy).toHaveBeenCalledWith(['/']);
  });
});
