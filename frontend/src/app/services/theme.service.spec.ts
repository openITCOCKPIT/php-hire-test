import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  beforeEach(() => localStorage.removeItem('recipe-theme'));
  afterEach(() => {
    localStorage.removeItem('recipe-theme');
    document.documentElement.setAttribute('data-bs-theme', 'dark');
    document.documentElement.setAttribute('data-theme', 'cockpit-dark');
  });

  it('uses the stored theme when one is saved', () => {
    localStorage.setItem('recipe-theme', 'light');
    const service = TestBed.inject(ThemeService);
    expect(service.theme()).toBe('light');
    expect(document.documentElement.getAttribute('data-bs-theme')).toBe('light');
  });

  it('toggles, reflects to the document, and persists', () => {
    const service = TestBed.inject(ThemeService);
    const start = service.theme();
    service.toggle();
    const flipped = start === 'dark' ? 'light' : 'dark';
    expect(service.theme()).toBe(flipped);
    expect(document.documentElement.getAttribute('data-bs-theme')).toBe(flipped);
    expect(document.documentElement.getAttribute('data-theme')).toBe(
      flipped === 'dark' ? 'cockpit-dark' : 'cockpit-light',
    );
    expect(localStorage.getItem('recipe-theme')).toBe(flipped);
  });
});
