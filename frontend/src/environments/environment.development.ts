/**
 * Development environment — used by `ng serve` and development builds.
 * The API base URL points at the Dockerised CakePHP backend (nginx on 8765).
 */
export const environment = {
  production: false,
  // Dev: the Angular dev server (:4200) talks cross-origin to the Dockerised
  // backend (:8765); the API lives under /api.
  apiBaseUrl: 'http://localhost:8765/api',
};
