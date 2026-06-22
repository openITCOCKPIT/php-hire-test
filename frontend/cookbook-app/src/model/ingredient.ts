export class Ingredient {
    public id: number = 0;
    public ingredientName: string = '';
    public unitOfMeasure: string = '';
    public amount: number = 0;

    public isValid(): boolean {
        const ingredientName: boolean = (this.ingredientName.trim() !== '');
        const amount: boolean = (this.amount > 0);

        return (ingredientName && amount);
    }
}