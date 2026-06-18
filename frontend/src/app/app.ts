import { Component, DestroyRef, ElementRef, OnInit, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink, RouterOutlet } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, FormsModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly title = signal('Recipe Collection');

  // Collapsible search (#4): a magnifier that expands into a text field.
  protected readonly searchOpen = signal(false);
  protected searchTerm = '';
  private readonly searchInput = viewChild<ElementRef<HTMLInputElement>>('searchInput');
  private readonly term$ = new Subject<string>();

  ngOnInit(): void {
    // Debounce keystrokes, then reflect the term in the URL (?search=…) and land
    // on the list — so searching from any page filters the recipe list.
    this.term$
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((term) =>
        this.router.navigate(['/'], { queryParams: { search: term || null } }),
      );

    // Reflect an existing ?search= on load (e.g. a shared link): show it open.
    const current = this.route.snapshot.queryParamMap.get('search') ?? '';
    if (current) {
      this.searchTerm = current;
      this.searchOpen.set(true);
    }
  }

  protected toggleSearch(): void {
    this.searchOpen.set(true);
    this.searchInput()?.nativeElement.focus();
  }

  protected onSearchInput(): void {
    this.term$.next(this.searchTerm.trim());
  }

  /** Collapse back to the icon when the user leaves an empty field. */
  protected onSearchBlur(): void {
    if (!this.searchTerm.trim()) {
      this.searchOpen.set(false);
    }
  }

  /** Escape clears the search and collapses the field. */
  protected closeSearch(): void {
    this.searchTerm = '';
    this.searchOpen.set(false);
    this.term$.next('');
  }
}
