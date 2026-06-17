# #4 — Database schema & migrations

**Epic:** B — Data Model & API Foundation
**Feature reference:** —
**Effort:** 1 h
**Dependencies:** #2
**Status:** ⬜ open

## Goal

Create the `recipes` and `ingredients` tables via CakePHP migrations and seed the database with the chocolate-cake example, establishing the data foundation that every API endpoint will build on.

## Description

1. Generate migrations using CakePHP's Phinx-based migration tool:
   ```
   bin/cake bake migration CreateRecipes
   bin/cake bake migration CreateIngredients
   ```
2. **`recipes` table** columns:
   - `id` — INT UNSIGNED AUTO_INCREMENT PRIMARY KEY
   - `title` — VARCHAR(255) NOT NULL
   - `description` — TEXT NULL
   - `created` — DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
3. **`ingredients` table** columns:
   - `id` — INT UNSIGNED AUTO_INCREMENT PRIMARY KEY
   - `recipe_id` — INT UNSIGNED NOT NULL (FK → `recipes.id` ON DELETE CASCADE)
   - `name` — VARCHAR(255) NOT NULL
   - `amount` — DECIMAL(8,2) NOT NULL
   - `unit` — VARCHAR(50) NOT NULL
4. Add a foreign-key constraint with `ON DELETE CASCADE` so deleting a recipe removes its ingredients.
5. Generate a seeder class and populate the chocolate-cake example:
   - Title: "Chocolate cake"
   - Created: 2026-06-15
   - Ingredients: 100g sugar, 50g flour, 2 eggs, 150g chocolate, 50ml milk
   - Description: "Bake it at 200°C for 40 minutes."
6. Run `bin/cake migrations migrate && bin/cake migrations seed --seed RecipesSeed` and verify the data in MySQL.

## Technical Notes

- `bin/cake migrations migrate` runs pending migrations in order; always test rollback with `bin/cake migrations rollback` before declaring done.
- The seeder lives in `config/Seeds/RecipesSeed.php`; seed only in dev — do not run in production.
- For the egg ingredient, `amount = 2.00` and `unit = "Stück"` (or "pcs") — demonstrates the VARCHAR unit flexibility.

## Rationale / Decisions

**Why `DECIMAL(8,2)` for `amount` instead of `FLOAT` or `INT`?**
- `FLOAT` stores binary approximations, not exact decimal values. `SELECT * WHERE amount = 1.5` on a FLOAT column can fail due to floating-point rounding (`1.4999999...` vs `1.5`). In a recipe app this would cause subtle bugs (e.g. displaying "1.4999g" of butter).
- `INT` cannot represent fractional amounts like "1.5 l" or "0.25 tsp". The example recipe itself has no fractions, but real recipes commonly do.
- `DECIMAL(8,2)` stores exact decimal values up to 999999.99, which covers any realistic ingredient amount. The trade-off is slightly more storage (4–9 bytes vs 4 for FLOAT) — irrelevant at this scale.

**Why `VARCHAR(50)` for `unit` instead of an `ENUM`?**
- An `ENUM` would require an `ALTER TABLE` migration every time a new unit appears (e.g., adding "tbsp" or "Prise"). This creates operational friction.
- Free-text VARCHAR lets users type any unit without schema changes. The trade-off is inconsistency ("g" vs "gram" vs "Gramm") — acceptable for a recipe collection not doing unit conversion.
- An alternative would be a separate `units` lookup table (normalised). Rejected: over-engineering for a project of this scope; lookup tables add a JOIN everywhere with no query-performance benefit at recipe scale.

**Why `ON DELETE CASCADE` on the FK?**
If a recipe is deleted, its ingredients become orphaned rows with no parent. Cascade deletion is the semantically correct behaviour: ingredients have no meaning outside their recipe. The alternative (RESTRICT) would require the application to manually delete ingredients before a recipe — more code for no benefit.

**Why separate `CreateRecipes` and `CreateIngredients` migrations instead of one?**
Separate migrations are independently rollback-able. If the `ingredients` schema needs adjustment, only that migration is affected. A single combined migration couples two logically separate schema concerns.

## Definition of Done

- [ ] `bin/cake migrations migrate` completes without errors
- [ ] `bin/cake migrations rollback` and re-migrate both work cleanly
- [ ] `SELECT * FROM recipes` returns the chocolate-cake row with `created = '2026-06-15'`
- [ ] `SELECT * FROM ingredients WHERE recipe_id = 1` returns 5 rows with correct DECIMAL amounts and VARCHAR units
- [ ] `amount` column is confirmed as `DECIMAL(8,2)` in `SHOW COLUMNS FROM ingredients`
- [ ] Seeder is in `config/Seeds/`, not in production code paths

## Tests

- [ ] **Migration reversibility:** `bin/cake migrations migrate` then `rollback` runs cleanly in CI — the schema is fully reversible.
- [ ] **PHPUnit + fixtures:** a fixture-backed test asserts the `ingredients.amount` column is `DECIMAL(8,2)` and that a stored value like `1.50` round-trips exactly (guards the DECIMAL-vs-FLOAT decision).
