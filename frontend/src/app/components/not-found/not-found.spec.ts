import { provideRouter } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { NotFound } from './not-found';

describe('NotFound', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotFound],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('renders a not-found message with a link back to the list', () => {
    const fixture = TestBed.createComponent(NotFound);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Page not found');
    expect(el.querySelector('a[href="/"]')).toBeTruthy();
  });
});
