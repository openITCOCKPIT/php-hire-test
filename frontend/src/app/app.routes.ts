import { Routes } from '@angular/router';
import { RecipeList } from './components/recipe-list/recipe-list';
import { RecipeDetail } from './components/recipe-detail/recipe-detail';

export const routes: Routes = [
  { path: '', component: RecipeList },
  // 'recipes/new' (issue #9) must precede 'recipes/:id' so "new" is not matched as an id.
  { path: 'recipes/:id', component: RecipeDetail },
];
