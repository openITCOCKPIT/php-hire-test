import { Injectable } from '@angular/core';
import {AppService} from "./app-service.service";
import {Recipe} from "../model/recipe";
import * as moment from "moment";

@Injectable()
export class CookbookService {
    constructor(appService: AppService) {
    }

    public searchRecipe(recipeList: Recipe[], recipeName: string ) {
        if (recipeList.length === 0 || recipeName.trim() === '') {
            return recipeList;
        }

        var directMatches: Recipe[] = recipeList.filter((recipe: Recipe) => {
            return (recipe.title.toLowerCase() === recipeName.toLowerCase())
        });

        if (directMatches.length > 0) {
            return directMatches;
        }

        var indirectMatches: Recipe[] =  recipeList.filter((recipe: Recipe) => {
            return (recipe.title.includes(recipeName.toLowerCase()))
        });

        return indirectMatches;
    }

    public filterRecipes(recipeList: Recipe[], category: string): Recipe[] {
        return recipeList.filter((recipe: Recipe)=> recipe.category === category);
    }

    public sortRecipesByTitle(recipeList: Recipe[], direction: string): Recipe[] {
        if (direction === 'asc') {
            return recipeList.sort((a: Recipe, b:Recipe) => {
                return a.title.toLowerCase().localeCompare(b.title.toLowerCase());
            });
        } else {
            return recipeList.sort((a: Recipe, b:Recipe) => {
                return (a.title.toLowerCase().localeCompare(b.title.toLowerCase()) *-1);
            });
        }
    }

    public sortRecipesByCreatedDate(recipeList: Recipe[], direction: string): Recipe[] {
        return recipeList.sort((a: Recipe, b: Recipe) => {
            const timestampA = moment(a.created).unix();
            const timestampB = moment(b.created).unix();

            if (timestampA === timestampB) {
                return 0;
            }

            if (direction === 'asc') {
                return (timestampA < timestampB? -1: 1);
            } else {
                return (timestampA < timestampB? 1: -1);
            }
        });
    }
}