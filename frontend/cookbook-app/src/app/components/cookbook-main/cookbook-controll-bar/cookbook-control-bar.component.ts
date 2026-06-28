import {Component, EventEmitter, Input, Output} from '@angular/core';
import {RecipeSortSetting} from "../../../../model/recipeSortSetting";
import {Router} from "@angular/router";

@Component({
  selector: 'app-cookbook-controll-bar',
  templateUrl: './cookbook-control-bar.component.html'
})
export class CookbookControlBarComponent {
  @Input() chooseCategoryFilter: string = '';
  @Input() chooseSortField: string = 'title'
  @Input() chooseSortDir: string = 'asc';

  @Output() chooseFilter: EventEmitter<string> = new EventEmitter<string>();
  @Output() chooseSorting: EventEmitter<RecipeSortSetting> = new EventEmitter<RecipeSortSetting>();
  @Output() searchRecipe: EventEmitter<string> = new EventEmitter<string>();

  public searchValue: string = ''

  constructor(public router: Router) {
  }

  public onChooseFilter(category: string) {
    this.chooseFilter.emit(category);
  }

  public onChooseSortFieldAndDir(field: string, dir: string) {
    this.chooseSorting.emit(new RecipeSortSetting(field, dir));
  }

  public onCreateNewRecipe() {
    this.router.navigate(['cookbook/createRecipe/']);
  }
}
