import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {Recipe} from "../../../../model/recipe";
import {CookbookService} from "../../../../services/cookbook.service";
import {AppService} from "../../../../services/app-service.service";
import {Ingredient} from "../../../../model/ingredient";
import {ConfirmDialogHelper} from "../../../../helper/ConfirmDialogHelper";
import {MatDialog} from "@angular/material/dialog";

@Component({
  selector: 'app-recipe-form',
  templateUrl: './recipe-form.component.html'
})
export class RecipeFormComponent implements OnInit {
  public recipeToLoad: Recipe;
  public recipe: Recipe;
  public editRecipe: Recipe = new Recipe();

  constructor(
      public route: ActivatedRoute,
      public router: Router,
      public appService: AppService,
      public cookbookService: CookbookService,
      public dialog: MatDialog) {
  }

  ngOnInit(){
    this.appService.openPageLoading();

    this.route.paramMap.subscribe((paramsMap: any) => {
      this.recipeToLoad = new Recipe();
      this.recipeToLoad.id = parseInt(paramsMap.params.id);;

      if (this.recipeToLoad.id ) {
        this.cookbookService.loadRecipeById(this.recipeToLoad).then((recipe: Recipe) => {
          this.recipe = recipe;
          this.editRecipe = Recipe.deepCopy(recipe);
          this.appService.closePageLoading();
        });
      } else {
        this.recipe = new Recipe();
        this.editRecipe = new Recipe();
        this.appService.closePageLoading();
      }
    });
  }

  public onAddIngredient() {
    this.editRecipe.ingredients.push(new Ingredient());
  }

  public onRemoveIngredient(ingredientToRemove: Ingredient) {
    const removeIndex: number = this.editRecipe.ingredients.findIndex((ingredient: Ingredient) => ingredient === ingredientToRemove);

    if(removeIndex !== -1) {
      this.editRecipe.ingredients.splice(removeIndex, 1);
    }
  }

  public onSaveRecipe() {
    if(!this.editRecipe.isValid()) {
      return;
    }

    if(this.editRecipe.id > 0) {
      this.editExistRecipe();
    } else {
      this.createRecipe();
    }
  }

  private createRecipe() {
    this.appService.openPageLoading();

    this.cookbookService.createRecipe(this.editRecipe).then((newRecipeId: number)=> {
      if(newRecipeId > 0) {
        this.cookbookService.loadRecipeById(Recipe.createDummyForLoading(newRecipeId)).then((recipe: Recipe) => {
          this.appService.closePageLoading();
          this.appService.showSuccessDlg('Das Rezept wurde erfolgreich erstellt.');

          this.router.navigate(['cookbook/editRecipe/'+newRecipeId]);
        });
      }
    });
  }

  private editExistRecipe() {
    this.appService.openPageLoading();

    this.cookbookService.updateRecipe(this.editRecipe).then((success: boolean)=> {
      if(success) {
        this.recipe = this.editRecipe;
        this.editRecipe = Recipe.deepCopy(this.recipe);

        this.appService.closePageLoading();
        this.appService.showSuccessDlg('Das Rezept wurde erfolgreich gespeichert');
      }
    });
  }

  public onDeleteRecipe() {
    const dailogHelper = new ConfirmDialogHelper(
        this.dialog, '' +
        'Löschen bestätigen',
        'Möchten sie das Rezept '+this.editRecipe.title+' wirklich löschen?'
    );

    dailogHelper.afterDecision().then((result: boolean)=> {
      if (result) {
        this.appService.openPageLoading();

        this.cookbookService.deleteRecipe(this.editRecipe.id).then((result: boolean)=> {
          if (result) {
            this.appService.showSuccessDlg('Das Rezept wurde erfolgreich entfernt');
            this.onCloseForm();
          }
        });
      }
    });
  }

  public onCloseForm() {
    this.router.navigate(['cookbook/']);
  }
}
