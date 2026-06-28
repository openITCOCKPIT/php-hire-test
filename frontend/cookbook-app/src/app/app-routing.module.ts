import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {path: '', loadChildren: () => import('./modules/welcome/welcome.module').then(imports => imports.WelcomeModule)},
  {path: 'cookbook', loadChildren: () => import('./modules/cookbook-main/cookbook-main.module').then(imports => imports.CookbookMainModule)},
  {path: '**', redirectTo: ''},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule { }