# Implementation Log — #4 Database schema & migrations

**Issue:** [docs/issues/04-database-schema.md](../issues/04-database-schema.md)
**Status:** ✅ done · **Date:** 2026-06-17

---

## What was built

```
api/config/Migrations/20260617204335_CreateRecipes.php
api/config/Migrations/20260617204336_CreateIngredients.php
api/config/Seeds/RecipesSeed.php          # chocolate-cake example
api/tests/TestCase/Database/SchemaTest.php # DECIMAL + cascade guarantees
docker/mysql/init/01-create-test-db.sql    # auto-creates the test database
docker-compose.yml / .env.example          # DATABASE_TEST_URL + init mount
```

## Decisions made during implementation, and why

### 1. `amount` = DECIMAL(8,2) — proven, not just asserted
The schema test inserts `1.50` and reads back the exact string `"1.50"`. A FLOAT
column could return `1.4999999…`. `information_schema` confirms the column type is
literally `decimal(8,2)`. This is the central data-type decision of the issue,
now locked in by a test against real MySQL.

### 2. `unit` = VARCHAR(50), not ENUM
The seed uses `g`, `ml` and `pcs` — the non-metric `pcs` demonstrates that a new
unit needs no schema change. An ENUM would require an `ALTER TABLE` migration for
every new unit.

### 3. Foreign key with ON DELETE CASCADE — tested
`SHOW CREATE TABLE` confirms `ON DELETE CASCADE`, and a test deletes a recipe and
asserts its ingredients are gone. Ingredients have no meaning without their
recipe, so cascade is the correct semantic (vs. RESTRICT, which would need manual
cleanup code).

### 4. `created` DATETIME DEFAULT CURRENT_TIMESTAMP
Phinx accepted `'default' => 'CURRENT_TIMESTAMP'` and emitted it unquoted
(`Default: CURRENT_TIMESTAMP`, `DEFAULT_GENERATED`). The app will also set
`created` via CakePHP's TimestampBehavior (#5); the DB default is a safety net
for any insert made outside the ORM.

### 5. Signed INT primary keys (Phinx default)
The issue example wrote `INT UNSIGNED`, but Phinx's implicit `id` column is a
signed INT. Rather than fight the tool for UNSIGNED (and risk a foreign-key type
mismatch), both `recipes.id` and `ingredients.recipe_id` use the default signed
INT so the FK types match exactly. Signed INT (max ~2.1 billion) is far beyond
any realistic recipe count — an accepted, well-bounded trade-off.

### 6. Two separate migrations
`CreateRecipes` and `CreateIngredients` are independent and individually
reversible. Verified: `migrations rollback --target=0` drops ingredients then
recipes (FK-safe order), and `migrations migrate` re-applies cleanly.

### 7. Tests run against a real MySQL database, not SQLite
`DATABASE_TEST_URL` now points at a separate `test_recipes` MySQL database, and
the skeleton's `Migrator` (already wired in `tests/bootstrap.php`) builds the test
schema from the same migrations. This means tests exercise the same engine and
types (DECIMAL, FK behaviour) as production — SQLite's loose typing would have
made the DECIMAL test meaningless. A MySQL init script auto-creates the database
on a fresh `docker compose up`, and test isolation was verified: running the suite
leaves the dev database untouched.

## Notes / gotchas discovered

- **Seed command:** in this CakePHP/migrations version it is `cake seeds run
  RecipesSeed` (a `seeds` command group), not `cake migrations seed`.
- **Seeds are tracked** in a `cake_seeds` table and won't re-run once recorded.
  After a full `rollback --target=0` + `migrate`, re-seeding needs the force flag:
  `cake seeds run RecipesSeed -f`. (This briefly looked like data loss until the
  tracking behaviour was identified — the dev DB was never at risk from tests.)
- **utf8mb4 confirmed:** the `°` in "200°C" is stored as the UTF-8 bytes `C2B0`,
  so the connection charset is correct end to end.

## Verification

```
migrations migrate / rollback --target=0 / migrate   # reversible, clean
seeds run RecipesSeed                                 # 1 recipe + 5 ingredients
SELECT … → sugar 100.00 g, flour 50.00 g, eggs 2.00 pcs, chocolate 150.00 g, milk 50.00 ml
vendor/bin/phpunit                                    # 12 tests, 28 assertions
vendor/bin/phpcs config/Migrations config/Seeds tests # clean
dev DB recipe count before/after phpunit             # 1 / 1 (tests don't touch dev)
```

## Notes carried into #5

- `bake model Recipes` / `bake model Ingredients` next, with a `hasMany`
  Ingredients association (`dependent => true`) and the TimestampBehavior on
  `created`.
- The MySQL test DB + Migrator are ready, so controller/table tests in #5 can use
  fixtures against real MySQL.
