import { Routes } from '@angular/router';
import { RecipeList } from './components/recipe-list/recipe-list';
import { RecipeDetail } from './components/recipe-detail/recipe-detail';
import { RecipeForm } from './components/recipe-form/recipe-form';
import { NotFound } from './components/not-found/not-found';

export const routes: Routes = [
  { path: '', component: RecipeList },
  // 'recipes/new' must precede 'recipes/:id' so "new" is not matched as an id.
  { path: 'recipes/new', component: RecipeForm },
  { path: 'recipes/:id', component: RecipeDetail },
  // Catch-all: any unknown path renders a friendly not-found page.
  { path: '**', component: NotFound },
];
