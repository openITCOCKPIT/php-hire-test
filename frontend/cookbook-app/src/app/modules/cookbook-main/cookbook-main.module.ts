import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {CookbookControlBarComponent} from "../../components/cookbook-main/cookbook-controll-bar/cookbook-control-bar.component";
import {CookbookMainComponent} from "../../components/cookbook-main/cookbook-main.component";
import {RecipeListComponent} from "../../components/cookbook-main/recipe-list/recipe-list.component";
import {RecipeFormComponent} from "../../components/cookbook-main/recipe-form/recipe-form.component";
import {RecipeIngredientRowComponent} from "../../components/cookbook-main/recipe-ingredient-row/recipe-ingredient-row.component";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {SharedComponentsModule} from "../shared-componens/shared-components.module";
import {CookbookRoutingModule} from "./cookbook-routing.module";



@NgModule({
    declarations: [
        CookbookMainComponent,
        CookbookControlBarComponent,
        RecipeListComponent,
        RecipeFormComponent,
        RecipeIngredientRowComponent
    ],
    exports: [
        CookbookControlBarComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        SharedComponentsModule,
        CookbookRoutingModule
    ]
})
export class CookbookMainModule { }
