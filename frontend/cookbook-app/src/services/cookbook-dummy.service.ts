import {AppService} from "./app-service.service";
import {Recipe} from "../model/recipe";
import {Ingredient} from "../model/ingredient";
import {Injectable} from "@angular/core";
import * as moment from "moment";

@Injectable()
export class CookbookDummyService {
    constructor(public appService: AppService) {
    }

    public async loadAllRecipes(): Promise<Recipe[]> {
        const recipes: Recipe[] = []

        const sugar: Ingredient = new Ingredient();
        sugar.ingredientName = 'sugar';
        sugar.unitOfMeasure = 'g';
        sugar.amount = 100;

        const flour: Ingredient = new Ingredient();
        flour.ingredientName = 'flour';
        flour.unitOfMeasure = 'g';
        flour.amount = 50;

        const eggs: Ingredient = new Ingredient();
        eggs.ingredientName = 'eggs';
        eggs.unitOfMeasure = '';
        eggs.amount = 2;

        const chocolate: Ingredient = new Ingredient();
        chocolate.ingredientName = 'chocolate';
        chocolate.unitOfMeasure = 'g';
        chocolate.amount = 150;

        const milk: Ingredient = new Ingredient();
        milk.ingredientName = 'milk';
        milk.unitOfMeasure = 'g';
        milk.amount = 50;

        const apples: Ingredient = new Ingredient();
        apples.ingredientName = 'apples';
        apples.unitOfMeasure = '';
        apples.amount = 5;

        const chocolateCake: Recipe = new Recipe();
        chocolateCake.id = 1;
        chocolateCake.title = 'Chocolate Cake';
        chocolateCake.category = 'dessert';
        chocolateCake.description = 'Bake it at 200°C for 40 minutes.\n' +
            '\n' +
            'This is an example recipe for our hiring test - Om Nom Nom\n' +
            '\n' +
            'This is just a example we never tasted, so maybe don\'t bake it :)';
        chocolateCake.created =  moment('16.06.2026', 'DD.MM.YYYY').toDate();

        chocolateCake.ingredients.push(sugar, flour, eggs, chocolate, milk);

        const appleCake: Recipe = new Recipe();
        appleCake.id = 2;
        appleCake.title = 'Apple Cake';
        appleCake.category = 'hauptgericht';
        appleCake.description = 'Bake it at 200°C for 40 minutes.\n' +
            '\n' +
            'This is an example recipe for our hiring test - Om Nom Nom\n' +
            '\n' +
            'This is just a example we never tasted, so maybe don\'t bake it :)';
        chocolateCake.created =  moment('20.06.2026', 'DD.MM.YYYY').toDate();
        appleCake.ingredients.push(sugar, flour, eggs, apples, milk);

        recipes.push(chocolateCake);
        recipes.push(appleCake);

        return new Promise((resolve, reject) => {
            setTimeout(()=> {
                resolve(this.sortRecipesByTitle(recipes, 'asc'));
            }, 1500);
        });
    }

    public async loadRecipeById(id: number): Promise<Recipe> {
        const allRecipes: Recipe[] = await this.loadAllRecipes();
        const foundRecipes: Recipe[] = allRecipes.filter((recipe: Recipe)=> recipe.id === id);

        if(foundRecipes.length === 0) {
            return new Recipe();
        }

        return foundRecipes[0];
    }

    public async createRecipe(recipe: Recipe): Promise<number> {
        return new Promise((resolve, reject) => {
            setTimeout(()=> {
                resolve(recipe.id);
            }, 1500);
        });
    }

    public async updateRecipe(recipe: Recipe): Promise<boolean> {
        return new Promise((resolve, reject) => {
            setTimeout(()=> {
                resolve(true);
            }, 1500);
        });
    }

    public async deleteRecipe(recipeId: number): Promise<boolean> {
        return new Promise((resolve, reject) => {
            setTimeout(()=> {
                resolve(true);
            }, 1500);
        });
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