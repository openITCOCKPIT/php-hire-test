import { Component, OnInit } from '@angular/core';
import {CookbookService} from "../../../services/cookbook.service";
import {AppService} from "../../../services/app-service.service";
import {Recipe} from "../../../model/recipe";

@Component({
  selector: 'app-cookbook-main',
  templateUrl: './cookbook-main.component.html'
})
export class CookbookMainComponent implements OnInit {
  public recipeList: Recipe[];
  public sortedRecipeList: Recipe[];
  public filteredRecipeList: Recipe[];
  public sortDirection: string = 'asc';
  public sortField: string = 'title';
  public searchRecipe: string = '';
  public categoryFilter: string = '';

  constructor(public appService: AppService, public cookbookService: CookbookService) {
  }

  ngOnInit(){
    this.appService.openPageLoading();

    this.cookbookService.loadAllRecipes().then((recipes: Recipe[]) => {
      this.recipeList = recipes;
      this.sortedRecipeList = Object.assign([], this.cookbookService.sortRecipesByTitle(this.recipeList, 'asc'));
      this.filteredRecipeList = Object.assign([], this.sortedRecipeList);

      this.appService.closePageLoading();
    });
  }

  public onSearchRecipe(search: string) {
    this.recipeSearch(search);

    this.onSort(this.sortField, this.sortDirection);
    this.onFilter(this.categoryFilter);
  }

  private recipeSearch(search: string) {
    this.searchRecipe = search.trim();
    this.filteredRecipeList = this.cookbookService.searchRecipe(Object.assign([], this.recipeList), search);
  }

  public onSort(field: string, direction: string) {
    this.sortField  = field;
    this.sortDirection = direction;

    switch (field) {
      case 'title':
        this.sortedRecipeList = Object.assign([], this.cookbookService.sortRecipesByTitle(this.filteredRecipeList, direction))
        break;
      case 'createdDate':
        this.sortedRecipeList = Object.assign([], this.cookbookService.sortRecipesByCreatedDate(this.filteredRecipeList, direction))
        break;
    }
  }

  public onFilter(category: string) {
    this.categoryFilter = category;
    this.recipeSearch(this.searchRecipe);

    if(category.trim() !== '') {
      this.filteredRecipeList = Object.assign([], this.cookbookService.filterRecipes(this.filteredRecipeList, category));
    } else if(this.searchRecipe.trim() === '') {
      this.filteredRecipeList = Object.assign([], this.filteredRecipeList);
      this.onSort(this.sortField, this.sortDirection);
    }

    this.onSort(this.sortField, this.sortDirection);
  }
}