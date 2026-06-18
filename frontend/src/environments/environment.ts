/**
 * Default (production) environment.
 * Overridden by environment.development.ts during `ng serve` / development builds
 * via the fileReplacements entry in angular.json.
 */
export const environment = {
  production: true,
  // Same-origin: the SPA and API are served by one nginx (issue #18); the API
  // lives under /api and uploaded images under /uploads (same origin).
  apiBaseUrl: '/api',
  uploadsBaseUrl: '',
};
