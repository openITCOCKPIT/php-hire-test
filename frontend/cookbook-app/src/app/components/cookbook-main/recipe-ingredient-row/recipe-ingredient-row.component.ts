import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Ingredient} from "../../../../model/ingredient";

@Component({
  selector: 'app-recipe-ingredient-row',
  templateUrl: './recipe-ingredient-row.component.html'
})
export class RecipeIngredientRowComponent implements OnInit {
  @Input() ingredient: Ingredient
  @Output() removeIngredient: EventEmitter<Ingredient> = new EventEmitter<Ingredient>();

  constructor() {
  }

  ngOnInit(): void {
  }
}
