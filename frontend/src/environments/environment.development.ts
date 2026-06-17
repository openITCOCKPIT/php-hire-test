/**
 * Development environment — used by `ng serve` and development builds.
 * The API base URL points at the Dockerised CakePHP backend (nginx on 8765).
 */
export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:8765',
};
