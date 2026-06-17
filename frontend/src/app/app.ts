import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { RecipeListComponent } from './components/recipe-list/recipe-list'; // <-- استيراد المكون هنا

@Component({
  selector: 'app-root',
  standalone: true, // نؤكد الاستقلالية هنا لضمان قبول الـ imports
  imports: [RouterOutlet, RecipeListComponent], // <-- حقن المكون هنا
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('recipes-frontend');
}