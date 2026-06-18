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
  temperature: number | null;
  duration: number | null;
  image_path: string | null;
  created: string;
  ingredients: Ingredient[];
}

/** A personal note attached to a recipe (#20). */
export interface Note {
  id: number;
  recipe_id: number;
  author: string | null;
  body: string;
  created: string;
}

/** Trimmed payload for the hover preview (#12) — title, ≤5 ingredients, excerpt. */
export interface RecipePreview {
  id: number;
  title: string;
  image_path: string | null;
  ingredients: Array<{ name: string; amount: string; unit: string }>;
  descriptionExcerpt: string;
}

/** Query parameters for the recipe list. Extended with sort/search in #10/#11. */
export interface RecipeQueryParams {
  sort?: 'title' | 'created';
  direction?: 'ASC' | 'DESC';
  search?: string;
}

/** Payload for creating or updating a recipe (issues #9 / #17). */
export interface NewRecipe {
  title: string;
  description?: string;
  temperature?: number | null;
  duration?: number | null;
  ingredients: Array<{ name: string; amount: number; unit: string }>;
}
