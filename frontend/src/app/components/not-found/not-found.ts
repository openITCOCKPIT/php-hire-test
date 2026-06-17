import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink],
  template: `
    <div class="text-center py-5">
      <h1 class="h3">Page not found</h1>
      <p class="text-muted mb-3">The page you are looking for does not exist.</p>
      <a routerLink="/" class="btn btn-primary">Back to recipes</a>
    </div>
  `,
})
export class NotFound {}
