import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {Recipe} from "../../../../model/recipe";
import {CookbookDummyService} from "../../../../services/cookbook-dummy.service";
import {CookbookService} from "../../../../services/cookbook.service";
import {AppService} from "../../../../services/app-service.service";
import {Ingredient} from "../../../../model/ingredient";
import {ConfirmDialogHelper} from "../../../../helper/ConfirmDialogHelper";
import {MatDialog} from "@angular/material/dialog";

@Component({
  selector: 'app-recipe-form',
  templateUrl: './recipe-form.component.html',
  styleUrls: ['recipe-form.component.scss']
})
export class RecipeFormComponent implements OnInit {
  public recipeId: number = 0;
  public recipe: Recipe;
  public editRecipe: Recipe = new Recipe();

  constructor(
      public route: ActivatedRoute,
      public router: Router,
      public appService: AppService,
      public cookbookDummyService: CookbookDummyService,
      public cookbookService: CookbookService,
      public dialog: MatDialog) {
  }

  ngOnInit(){
    this.appService.openPageLoading();

    this.route.paramMap.subscribe((paramsMap: any) => {
      console.log();
      this.recipeId = parseInt(paramsMap.params.id);

      if (this.recipeId) {
        this.cookbookDummyService.loadRecipeById(this.recipeId).then((recipe: Recipe) => {
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
    const removeIndex = this.editRecipe.ingredients.findIndex((ingredient: Ingredient) => ingredient === ingredientToRemove);

    if(removeIndex !== -1) {
      this.editRecipe.ingredients.slice(removeIndex, 1);
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

    this.cookbookDummyService.createRecipe(this.editRecipe).then((newRecipeId: number)=> {

      this.cookbookDummyService.loadRecipeById(newRecipeId).then((recipe: Recipe) => {
        this.recipe = recipe;
        this.editRecipe = Recipe.deepCopy(recipe);

        this.appService.closePageLoading();
        this.appService.showSuccessDlg('Das Rezept wurde erfolgreich erstellt.');
      }).catch((error: number) => {
        this.appService.closePageLoading();
        this.appService.showErrorDlg('Fehler: Das Rezept konnte nicht erstellt werden');
      });
    });
  }

  private editExistRecipe() {
    this.appService.openPageLoading();

    this.cookbookDummyService.updateRecipe(this.editRecipe).then((success: boolean)=> {
      if(success) {
        this.recipe = this.editRecipe;
        this.editRecipe = Recipe.deepCopy(this.recipe);

        this.appService.closePageLoading();
        this.appService.showSuccessDlg('Das Rezept wurde erfolgreich gespeichert');
      }
    }).catch((error: boolean) => {
      this.appService.closePageLoading();
      this.appService.showErrorDlg('Das Rezept konnte nicht gespeichert werden!');
    });
  }

  public onDeleteRecipe() {
    this.appService.openPageLoading();

    const dailogHelper = new ConfirmDialogHelper(
        this.dialog, '' +
        'Löschen bestätigen',
        'Möchten sie das Rezept '+this.editRecipe.title+' wirklich löschen?'
    );

    dailogHelper.afterDecision().then((result: boolean)=> {
      this.appService.openPageLoading();

      if (result) {
        this.cookbookDummyService.deleteRecipe(this.editRecipe.id).then(()=>{
          this.appService.showSuccessDlg('Das Rezept wurde erfolgreich entfernt');
          this.onCloseForm();
        }).catch(()=> {
          this.appService.closePageLoading();
          this.appService.showErrorDlg('Das Löschen des Rezepts ist fehlgeschlagen!');
        });
      }
    });
  }

  public onCloseForm() {
    this.router.navigate(['cookbook/']);
  }
}
