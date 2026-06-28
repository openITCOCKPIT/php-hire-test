import {RouterModule, Routes} from "@angular/router";
import {NgModule} from "@angular/core";
import {CookbookMainComponent} from "../../components/cookbook-main/cookbook-main.component";
import {RecipeFormComponent} from "../../components/cookbook-main/recipe-form/recipe-form.component";

const routes: Routes = [
  {
    path: '',
    component: CookbookMainComponent
  },
  {
    path: 'createRecipe',
    component: RecipeFormComponent
  },
  {
    path: 'editRecipe/:id',
    component: RecipeFormComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class CookbookRoutingModule {
}
