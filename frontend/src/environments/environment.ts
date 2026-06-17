/**
 * Default (production) environment.
 * Overridden by environment.development.ts during `ng serve` / development builds
 * via the fileReplacements entry in angular.json.
 */
export const environment = {
  production: true,
  apiBaseUrl: 'http://localhost:8765',
};
