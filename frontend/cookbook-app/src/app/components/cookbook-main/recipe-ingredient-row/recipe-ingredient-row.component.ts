import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Ingredient} from "../../../../model/ingredient";

@Component({
  selector: 'app-recipe-ingredient-row',
  templateUrl: './recipe-ingredient-row.component.html'
})
export class RecipeIngredientRowComponent {
  @Input() ingredient: Ingredient
  @Output() removeIngredient: EventEmitter<Ingredient> = new EventEmitter<Ingredient>();
}
