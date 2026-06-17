export interface Ingredient {
  id?: number;
  amount: string;
  name: string;
}

export interface Recipe {
  id: number;
  title: string;
  description: string;
  temperature: number | null;
  duration: number | null;
  created_at: string;
  ingredients: Ingredient[];
}

export interface RecipePreview {
  id: number;
  title: string;
  description: string;
  temperature: number | null;
  duration: number | null;
  created_at: string;
  ingredients: Ingredient[];
}

export interface RecipeListItem {
  id: number;
  title: string;
  description: string;
  temperature: number | null;
  duration: number | null;
  created_at: string;
}

export interface RecipeFormData {
  title: string;
  description: string;
  temperature: number | null;
  duration: number | null;
  ingredients: Ingredient[];
}

export type SortField = 'title' | 'created_at' | 'duration';
export type SortDirection = 'ASC' | 'DESC';
