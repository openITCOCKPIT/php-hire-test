import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Router, provideRouter } from '@angular/router';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { App } from './app';
import { routes } from './app.routes';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
  });

  /** Access protected members for testing. */
  const members = (fixture: ReturnType<typeof TestBed.createComponent<App>>) =>
    fixture.componentInstance as unknown as {
      searchOpen: () => boolean;
      searchTerm: string;
      toggleSearch: () => void;
      onSearchInput: () => void;
    };

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the brand title in the navbar', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.navbar-brand')?.textContent).toContain('Recipe Collection');
  });

  it('keeps the search field collapsed until the magnifier is clicked', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const app = members(fixture);

    expect(app.searchOpen()).toBeFalse();
    app.toggleSearch();
    expect(app.searchOpen()).toBeTrue();
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
});
