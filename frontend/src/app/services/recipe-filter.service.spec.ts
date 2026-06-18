import { TestBed } from '@angular/core/testing';
import { RecipeFilterService } from './recipe-filter.service';
import { Recipe } from '../models/recipe';

function recipe(duration: number | null, ingredientCount: number): Recipe {
  return {
    id: 1,
    title: 't',
    description: null,
    temperature: null,
    duration,
    image_path: null,
    created: '2026-06-15T00:00:00+00:00',
    ingredients: Array.from({ length: ingredientCount }, (_, i) => ({
      id: i,
      recipe_id: 1,
      name: 'x',
      amount: '1.00',
      unit: 'g',
    })),
  };
}

describe('RecipeFilterService', () => {
  let service: RecipeFilterService;
  beforeEach(() => (service = TestBed.inject(RecipeFilterService)));

  it('matches everything with the default filters', () => {
    expect(service.matches(recipe(5, 3))).toBeTrue();
    expect(service.matches(recipe(null, 0))).toBeTrue();
  });

  it('filters by duration buckets at the boundaries', () => {
    service.duration.set('15to30');
    expect(service.matches(recipe(15, 1))).toBeTrue();
    expect(service.matches(recipe(30, 1))).toBeTrue();
    expect(service.matches(recipe(31, 1))).toBeFalse();
    expect(service.matches(recipe(14, 1))).toBeFalse();
    expect(service.matches(recipe(null, 1))).toBeFalse();
  });

  it('filters by ingredient count buckets', () => {
    service.ingredients.set('11plus');
    expect(service.matches(recipe(20, 11))).toBeTrue();
    expect(service.matches(recipe(20, 10))).toBeFalse();
  });

  it('reset returns every filter to its default', () => {
    service.sort.set('title-ASC');
    service.duration.set('gt60');
    service.ingredients.set('6to10');
    service.reset();
    expect(service.sort()).toBe('created-DESC');
    expect(service.duration()).toBe('all');
    expect(service.ingredients()).toBe('all');
  });

  it('filters by the remaining duration buckets at the boundaries', () => {
    service.duration.set('lt15');
    expect(service.matches(recipe(14, 1))).toBeTrue();
    expect(service.matches(recipe(15, 1))).toBeFalse();

    service.duration.set('30to60');
    expect(service.matches(recipe(30, 1))).toBeFalse(); // 30 belongs to 15to30
    expect(service.matches(recipe(31, 1))).toBeTrue();
    expect(service.matches(recipe(60, 1))).toBeTrue();
    expect(service.matches(recipe(61, 1))).toBeFalse();

    service.duration.set('gt60');
    expect(service.matches(recipe(61, 1))).toBeTrue();
    expect(service.matches(recipe(60, 1))).toBeFalse();
  });

  it('filters by the lower ingredient buckets', () => {
    service.ingredients.set('1to5');
    expect(service.matches(recipe(20, 5))).toBeTrue();
    expect(service.matches(recipe(20, 6))).toBeFalse();

    service.ingredients.set('6to10');
    expect(service.matches(recipe(20, 6))).toBeTrue();
    expect(service.matches(recipe(20, 10))).toBeTrue();
    expect(service.matches(recipe(20, 11))).toBeFalse();
  });
});
