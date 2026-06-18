# Multi-stage build for the Angular SPA, served by nginx (issue #18).
# Stage 1 builds the production bundle; stage 2 serves it and proxies /api to the
# backend so the SPA and API share a single origin (no CORS in production).

FROM node:22-alpine AS build
WORKDIR /app
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM nginx:1.27-alpine
COPY docker/frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html
