import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface StatusResponse {
  status: string;
}

/**
 * Talks to the backend health-check endpoint (GET /status).
 *
 * Used here to prove the frontend can reach the CakePHP API across origins
 * (CORS) before any real feature service is built.
 */
@Injectable({ providedIn: 'root' })
export class StatusService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  getStatus(): Observable<StatusResponse> {
    return this.http.get<StatusResponse>(`${this.baseUrl}/status`);
  }
}
