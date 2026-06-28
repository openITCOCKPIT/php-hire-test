import {Component, Input} from '@angular/core';
import {Recipe} from "../../../../model/recipe";
import {Router} from "@angular/router";
import {CookbookService} from "../../../../services/cookbook.service";

@Component({
  selector: 'app-recipe-list',
  templateUrl: './recipe-list.component.html'
})
export class RecipeListComponent {
  @Input() recipes: Recipe[];
  @Input() filterOrSearchActive: boolean = false;

  public previewRecipe: Recipe = new Recipe();
  public detailRecipe: Recipe = new Recipe();

  constructor(public cookbookService: CookbookService, public router: Router) {
  }

  public onShowPreview(recipe: Recipe) {
    this.cookbookService.loadRecipeById(recipe).then((recipe: Recipe) => {
      this.detailRecipe = recipe;
    });
  }

  public onHidePreview() {
    this.previewRecipe = new Recipe();
    this.detailRecipe = new Recipe();
  }

  public onAddRecipe() {
    this.router.navigate(['cookbook/create/']);
  }

  public onEditRecipe(recipeId: number) {
    this.router.navigate(['cookbook/editRecipe/'+recipeId]);
  }

  public getPreviewClass(isHidden: boolean) {
    return ('col-12 cookbook-details-preview '+(isHidden? 'cookbook-details-preview-hidden':''));
  }

  public showDescription(recipe: Recipe) {
    return recipe.description;
    // return recipe.description.replace(/(?:\r\n|\r|\n)/g, '<br>')
  }
}