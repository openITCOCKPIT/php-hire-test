export interface Ingredient {
    name: string;
    amount: string;
}

export interface Recipe {
    id?: number;
    title: string;
    description: string;
    created?: string;
    ingredients?: Ingredient[];
}

export interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
    errors?: any;
}