# Recipe Collection — API (CakePHP 5)

The JSON REST backend for the Recipe Collection. See the
[project README](../README.md) for setup, architecture and the full picture.

## Endpoints (served under `/api`)

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/status` | health check → `{"status":"ok"}` |
| GET | `/api/recipes` | list (`?search=`, `?sort=title\|created`, `?direction=ASC\|DESC`) |
| GET | `/api/recipes/{id}` | one recipe with ingredients |
| GET | `/api/recipes/{id}/preview` | trimmed payload for the hover preview |
| POST | `/api/recipes` | create a recipe + ingredients |
| PUT | `/api/recipes/{id}` | update a recipe + replace ingredients |
| DELETE | `/api/recipes/{id}` | delete a recipe (ingredients cascade) |
| POST | `/api/recipes/{id}/send-mail` | e-mail the recipe to an address |

## Schema

- `recipes` — `id`, `title`, `description`, `temperature` (°C, nullable),
  `duration` (min, nullable), `created`
- `ingredients` — `id`, `recipe_id` (FK, `ON DELETE CASCADE`), `name`,
  `amount` `DECIMAL(8,2)`, `unit` `VARCHAR(50)`

## Common commands

```bash
# from the repo root, inside the php container:
docker compose exec php bin/cake.php migrations migrate
docker compose exec php bin/cake.php seeds run RecipesSeed   # chocolate-cake example
docker compose exec php vendor/bin/phpunit                   # tests (separate MySQL test DB)
docker compose exec php vendor/bin/phpcs                     # coding standard
```
