import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { environment } from '../environments/environment';

describe('App', () => {
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    httpMock.expectOne(`${environment.apiBaseUrl}/status`).flush({ status: 'ok' });
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the app title', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    httpMock.expectOne(`${environment.apiBaseUrl}/status`).flush({ status: 'ok' });
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Recipe Collection');
  });

  it('should mark the API reachable when /status returns ok', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    httpMock.expectOne(`${environment.apiBaseUrl}/status`).flush({ status: 'ok' });
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.alert-success')).toBeTruthy();
  });

  it('should mark the API unreachable on error', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    httpMock
      .expectOne(`${environment.apiBaseUrl}/status`)
      .error(new ProgressEvent('network error'));
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.alert-danger')).toBeTruthy();
  });
});
