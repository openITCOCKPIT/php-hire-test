import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { StatusService } from './services/status.service';

type ApiStatus = 'loading' | 'ok' | 'error';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  private readonly statusService = inject(StatusService);

  protected readonly title = signal('Recipe Collection');
  protected readonly apiStatus = signal<ApiStatus>('loading');

  ngOnInit(): void {
    this.statusService.getStatus().subscribe({
      next: (res) => this.apiStatus.set(res.status === 'ok' ? 'ok' : 'error'),
      error: () => this.apiStatus.set('error'),
    });
  }
}
