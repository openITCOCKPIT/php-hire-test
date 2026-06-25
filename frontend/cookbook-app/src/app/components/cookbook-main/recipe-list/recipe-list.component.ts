import {Component, Input, OnInit} from '@angular/core';
import {Recipe} from "../../../../model/recipe";
import {Router} from "@angular/router";
import {CookbookService} from "../../../../services/cookbook.service";

@Component({
  selector: 'app-recipe-list',
  templateUrl: './recipe-list.component.html'
})
export class RecipeListComponent implements OnInit {
  @Input() recipes: Recipe[];
  @Input() filterOrSearchActive: boolean = false;

  public previewRecipe: Recipe = new Recipe();
  public detailRecipe: Recipe = new Recipe();

  constructor(public cookbookService: CookbookService, public router: Router) {
  }

  ngOnInit(): void {
  }

  public onShowPreview(recipe: Recipe) {
    this.cookbookService.loadRecipeById(recipe).then((recipe: Recipe) => {
      this.detailRecipe = recipe;
    });
  }

  public onShowDetailsPage(recipeId: number) {
    this.router.navigate(['cookbook/recipeDetails/'+recipeId]);
  }

  public onHidePreview() {
    this.previewRecipe = new Recipe();
    this.detailRecipe = new Recipe();
  }

  public onEditRecipe(recipeId: number) {
    this.router.navigate(['cookbook/editRecipe/'+recipeId]);
  }

  public getPreviewClass(isHidden: boolean) {
    return ('col-12 cookbook-details-preview '+(isHidden? 'cookbook-details-preview-hidden':''));
  }
}