export class Ingredient {
    public id: number = 0;
    public recipeId: number = 0;
    public ingredientName: string = '';
    public unitOfMeasure: string = '';
    public amount: number = 0;

    public static import(rawIngredient: any): Ingredient {
        const ingredient: Ingredient = new Ingredient();

        ingredient.id = parseInt(rawIngredient.id);
        ingredient.ingredientName = rawIngredient.ingredientName;
        ingredient.recipeId = parseInt(rawIngredient.recipeId);
        ingredient.unitOfMeasure = rawIngredient.unitOfMeasure;
        ingredient.amount = parseFloat(rawIngredient.amount);

        return ingredient
    }

    public isValid(): boolean {
        const ingredientName: boolean = (this.ingredientName.trim() !== '');
        const amount: boolean = (this.amount > 0);

        return (ingredientName && amount);
    }
}