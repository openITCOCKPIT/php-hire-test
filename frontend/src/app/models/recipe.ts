/**
 * Domain models mirroring the CakePHP JSON API.
 *
 * `amount` is a decimal string (e.g. "100.00") because the backend stores it as
 * DECIMAL(8,2) and serialises it as a string to preserve exact values.
 */
export interface Ingredient {
  id: number;
  recipe_id: number;
  name: string;
  amount: string;
  unit: string;
}

export interface Recipe {
  id: number;
  title: string;
  description: string | null;
  created: string;
  ingredients: Ingredient[];
}

/** Query parameters for the recipe list. Extended with sort/search in #10/#11. */
export interface RecipeQueryParams {
  sort?: 'title' | 'created';
  direction?: 'ASC' | 'DESC';
  search?: string;
}

/** Payload for creating a recipe (issue #9). */
export interface NewRecipe {
  title: string;
  description?: string;
  ingredients: Array<{ name: string; amount: number; unit: string }>;
}
