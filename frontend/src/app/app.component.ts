import { Component } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  template: `
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary sticky-top shadow">
      <div class="container">
        <a class="navbar-brand fw-bold" routerLink="/">
          <i class="bi bi-journal-bookmark-fill me-2"></i>Recipe Collection
        </a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <ul class="navbar-nav ms-auto">
            <li class="nav-item">
              <a class="nav-link" routerLink="/"><i class="bi bi-house me-1"></i>Browse Recipes</a>
            </li>
            <li class="nav-item">
              <a class="nav-link" routerLink="/recipes/new">
                <i class="bi bi-plus-circle me-1"></i>New Recipe
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>

    <main class="py-4">
      <router-outlet />
    </main>

    <footer class="bg-dark text-white text-center py-3 mt-5">
      <small>Recipe Collection &copy; 2026 — Built with Angular &amp; PHP</small>
    </footer>
  `
})
export class AppComponent {}
