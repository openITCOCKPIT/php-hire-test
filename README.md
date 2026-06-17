# Recipe Collection

A recipe collection web app: REST API backend in **PHP 8.3 / MySQL 8.0**, frontend in **Angular / TypeScript / Bootstrap 5**.

## Features

- **Browse** — List all recipes (title, description, ingredients, temperature, duration)
- **Create** — Create a new recipe with a dynamic ingredients list
- **Edit / Delete** — Update or remove an existing recipe
- **Sort** — Sort by title, creation date, or duration (asc/desc)
- **Search** — Real-time search (title + description) with debounce
- **Hover Preview** — Hovering over a recipe card loads a preview via a dedicated AJAX request (`/api/recipes/{id}/preview`) without blocking the UI
- **Send by Email** — Send a recipe by email as formatted HTML via `mail()`

## Tech stack

| Layer        | Technology                                |
|--------------|--------------------------------------------|
| Backend      | PHP 8.3 (no framework, PDO + custom router) |
| Database     | MySQL 8.0                                   |
| Frontend     | Angular 19 (standalone components), TypeScript, RxJS |
| UI           | Bootstrap 5 + Bootstrap Icons               |

## Project structure

```
recipe-app/
├── backend/
│   ├── public/index.php          # Entry point + router
│   ├── src/
│   │   ├── Config/Database.php   # PDO connection
│   │   ├── Controller/RecipeController.php
│   │   └── Model/RecipeModel.php
│   ├── composer.json
│   ├── .env.example
│   └── nginx.conf
├── database/
│   └── schema.sql                # Schema + sample data
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── components/
    │   │   │   ├── recipe-list/      # Browse + search + sort + preview
    │   │   │   ├── recipe-card/      # Reusable card
    │   │   │   ├── recipe-detail/    # Detail view + email send + delete
    │   │   │   └── recipe-form/      # Create / Edit
    │   │   ├── models/recipe.model.ts
    │   │   ├── services/recipe.service.ts
    │   │   ├── app.component.ts
    │   │   ├── app.config.ts
    │   │   └── app.routes.ts
    │   ├── environments/
    │   ├── index.html
    │   ├── main.ts
    │   └── styles.scss
    ├── angular.json
    ├── package.json
    └── proxy.conf.json
```

## Installation

### Prerequisites

- PHP >= 8.3 with the `pdo_mysql` extension
- MySQL >= 8.0
- Node.js >= 18 and npm
- A locally configured mail server (or `sendmail`) for the send-by-email feature

### 1. Database

```bash
mysql -u root -p < database/schema.sql
```

This creates the `recipe_collection` database, the `recipes` / `ingredients` tables, and inserts 5 sample recipes.

### 2. Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your MySQL credentials
composer install   # optional, no external dependencies are currently required

# Run the built-in PHP dev server
php -S localhost:8080 -t public
```

The API is then available at `http://localhost:8080/api/recipes`.

### 3. Frontend

```bash
cd frontend
npm install
npm start
```

The app is served at `http://localhost:4200` and automatically proxies `/api/*` calls to `http://localhost:8080` (see `proxy.conf.json`).

## API endpoints

| Method  | Route                                | Description                              |
|---------|----------------------------------------|--------------------------------------------|
| GET     | `/api/recipes?search=&sort_by=&sort_dir=` | List recipes (search + sort)           |
| GET     | `/api/recipes/{id}`                  | Recipe detail + ingredients               |
| GET     | `/api/recipes/{id}/preview`          | Lightweight preview (for hover)           |
| POST    | `/api/recipes`                       | Create a recipe                            |
| PUT     | `/api/recipes/{id}`                  | Update a recipe                            |
| DELETE  | `/api/recipes/{id}`                  | Delete a recipe                            |
| POST    | `/api/recipes/{id}/send-email`       | Send the recipe by email                  |

### Sample payload (POST/PUT)

```json
{
  "title": "Chocolate Cake",
  "description": "A rich and moist chocolate cake...",
  "temperature": 200,
  "duration": 40,
  "ingredients": [
    { "amount": "100g", "name": "sugar" },
    { "amount": "2", "name": "eggs" }
  ]
}
```

## Implementation notes

- **Security**: all SQL queries use prepared PDO statements (no SQL injection). User input in the HTML email is escaped via `htmlspecialchars`.
- **Validation**: title and description are required on the backend (HTTP 422 with per-field error details) and on the frontend.
- **Sorting**: strict whitelist of sortable columns on the backend to prevent any injection via the `sort_by`/`sort_dir` parameters.
- **Hover preview**: implemented with RxJS (`debounceTime` + `switchMap`) to avoid spamming the API when quickly moving the mouse across multiple cards, and to automatically cancel stale requests.
- **Transactions**: creating/updating a recipe and its ingredients is wrapped in a PDO transaction to guarantee data consistency.

## Known limitations / possible improvements

- No authentication (out of scope for this technical test)
- Email sending uses PHP's native `mail()`; in production, an SMTP-based service (PHPMailer, Symfony Mailer, or a third-party provider) would be preferable
- No pagination on the recipe list (acceptable for a test-sized dataset, worth adding if the collection grows)
- No automated tests included (PHPUnit on the backend, Jasmine/Karma on the Angular side would be the natural choices)
