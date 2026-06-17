import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecipeAdd } from './recipe-add';

describe('RecipeAdd', () => {
  let component: RecipeAdd;
  let fixture: ComponentFixture<RecipeAdd>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecipeAdd],
    }).compileComponents();

    fixture = TestBed.createComponent(RecipeAdd);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
