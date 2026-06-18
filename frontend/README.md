# Recipe Collection — Frontend (Angular 20)

The Angular single-page app for the Recipe Collection (Bootstrap 5, RxJS,
standalone components, signals). See the [project README](../README.md) for the
full picture.

## Develop

```bash
npm install
npm start          # dev server at http://localhost:4200 (talks to the API on :8765/api)
```

The API base URL comes from `src/environments/` — `/api` in production (the SPA is
served behind the same nginx as the API), `http://localhost:8765/api` in dev.

## Test

```bash
npm test           # Karma/Jasmine unit specs (headless Chrome)
npm run e2e        # cross-browser smoke test (Firefox + Chromium); needs the app running
```

## Build

```bash
npm run build      # production bundle in dist/frontend/browser/
```

In Docker the build is served by nginx (`docker/frontend/`), which also proxies
`/api` to the backend — a single origin, no CORS.
