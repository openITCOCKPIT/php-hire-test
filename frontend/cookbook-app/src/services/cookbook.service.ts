import { Injectable } from '@angular/core';
import {AppService} from "./app-service.service";
import {Recipe} from "../model/recipe";
import {HttpClient} from "@angular/common/http";
import * as moment from "moment";

@Injectable()
export class CookbookService {
    constructor(private appService: AppService, private http: HttpClient) {
    }

    public async checkExistRecipes(): Promise<boolean> {
        const params: any = {
            action: 'checkExistRecipes'
        };
        const promise = this.http.post(AppService.generateApplicationUrl(), JSON.stringify(params)).toPromise();

        return await promise.then((response: any) => {
            return (response.checkExistRecipes);
        }).catch((error: any)=> {
            console.error(error);
            this.appService.showErrorDlg('Fehler: Der Dienst zum prüfen der Rezepte ist nicht erreichbar!');
            return false;
        });
    }

    public async setupExampleRecipes(): Promise<boolean> {
        const params: any = {
            action: 'setupExampleRecipes'
        };
        const promise = this.http.post(AppService.generateApplicationUrl(), JSON.stringify(params)).toPromise();

        return await promise.then((response: any) => {
            return true;
        }).catch((error: any)=> {
            console.error(error);
            this.appService.showErrorDlg('Fehler: Die Beispielrezepte konnten nicht angelegt werden!');
            return false;
        });

    }

    public async loadAllRecipes(): Promise<Recipe[]> {
        let recipes: Recipe[] = [];

        const options: any = {
            params: {
                action: 'recipeList',
            }
        };
        const promise = this.http.get(AppService.generateApplicationUrl(), options).toPromise();

        return await promise.then((response: any) => {
            if (response.recipes.length === 0) {
                return recipes;
            }
            return response.recipes.map((rawRecipe: any) => {
                return Recipe.import(rawRecipe);
            });
        }).catch((error) => {
            console.error(error);
            this.appService.showErrorDlg('Die Rezepteliste konnte nicht geladen werden!');
            return recipes;
        });
    }

    public async loadRecipeById(recipe: Recipe):Promise<Recipe> {
        const options: any = {
            params: {
                action: 'recipeDetails',
                recipeId: recipe.id,
            }
        };
        const promise = this.http.get(AppService.generateApplicationUrl(), options).toPromise();

        return promise.then((response: any): Recipe => {
            if (!response.recipe) {
                return recipe;
            }
            return Recipe.import(response.recipe);
        }).catch((error) => {
            console.error(error);

            if(recipe.title.trim() !== '') {
                this.appService.showErrorDlg('Die Details für das Rezept '+recipe.title+' konnten nicht geladen werden!');
            } else {
                this.appService.showErrorDlg('Das Rezept konnten nicht geladen werden!');
            }

            return recipe;
        });
    }

    public async createRecipe(recipe: Recipe): Promise<number> {
        const params: any = {
            action: 'createRecipe',
            recipe: recipe
        };
        const promise = this.http.post(AppService.generateApplicationUrl(), JSON.stringify(params)).toPromise();

        return await promise.then((response: any) => {
            return parseInt(response.newRecipeId);
        }).catch((error: any)=> {
            console.error(error);

            this.appService.showErrorDlg('Fehler: Das Rezept konnte nicht anglegt werden!');
            return 0;
        });
    }

    public async updateRecipe(recipe: Recipe): Promise<boolean> {
        const params: any = {
            action: 'editRecipe',
            recipe: recipe
        };
        const promise = this.http.post(AppService.generateApplicationUrl(), JSON.stringify(params)).toPromise();

        return await promise.then((response: any) => {
            return true;
        }).catch((error: any)=> {
            console.error(error);
            this.appService.showErrorDlg('Fehler: Das Rezept konnte nicht gespeichert werden!');
            return false;
        });
    }

    public async deleteRecipe(recipeId: number): Promise<boolean> {
        const params: any = {
            action: 'deleteRecipe',
            recipeId: recipeId
        };
        const promise = this.http.post(AppService.generateApplicationUrl(), JSON.stringify(params)).toPromise();

        return await promise.then((response: any) => {
            return true;
        }).catch((error: any)=> {
            console.error(error);
            this.appService.showErrorDlg('Fehler: Das Rezept konnte nicht gelöscht werden!');
            return false;
        });
    }

    public searchRecipe(recipeList: Recipe[], recipeName: string ) {
        if (recipeList.length === 0 || recipeName.trim() === '') {
            return recipeList;
        }

        const directMatches: Recipe[] = recipeList.filter((recipe: Recipe) => {
            return (recipe.title.toLowerCase() === recipeName.toLowerCase())
        });

        if (directMatches.length > 0) {
            return directMatches;
        }

        return recipeList.filter((recipe: Recipe) => {
            return (recipe.title.toLowerCase().includes(recipeName.toLowerCase()))
        });
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