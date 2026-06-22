import {Ingredient} from "./ingredient";

export class Recipe {
    public id: number = 0;
    public title: string = '';
    public created: Date = new Date();
    public description: string = '';
    public category: string = '';
    public ingredients: Ingredient[] = [];

    public static deepCopy(recipe: Recipe): Recipe {
        const copy: Recipe = Object.assign(new Recipe(), recipe);
        copy.ingredients = [];

        recipe.ingredients.forEach((ingredient: Ingredient) => {
            copy.ingredients.push(Object.assign(new Ingredient(), ingredient));
        });

        return copy;
    }

    public isValid() {
        const title: boolean = (this.title.trim() !== '');
        const description: boolean = (this.description.trim() !== '');
        const category: boolean = (this.category.trim() !== '');

        let ingredients: boolean = (this.ingredients.length > 0);

        if(ingredients) {
            this.ingredients.forEach((ingredient: Ingredient)=> {
                ingredients = ingredients && ingredient.isValid();
            });
        }

        return (title && description && category && ingredients);
    }
}