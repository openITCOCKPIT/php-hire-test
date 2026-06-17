<?php
declare(strict_types=1);

namespace App\Test\TestCase\Database;

use Cake\Datasource\ConnectionManager;
use Cake\TestSuite\TestCase;

/**
 * Guards the issue #4 data-type decisions at the database level:
 * `ingredients.amount` must be DECIMAL(8,2) and store fractional values
 * exactly (the reason DECIMAL was chosen over FLOAT).
 */
class SchemaTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        $connection = ConnectionManager::get('test');
        $connection->execute('SET FOREIGN_KEY_CHECKS=0');
        $connection->execute('TRUNCATE TABLE ingredients');
        $connection->execute('TRUNCATE TABLE recipes');
        $connection->execute('SET FOREIGN_KEY_CHECKS=1');
    }

    public function testAmountColumnIsDecimal82(): void
    {
        $connection = ConnectionManager::get('test');
        $columnType = $connection->execute(
            "SELECT COLUMN_TYPE FROM information_schema.COLUMNS
             WHERE TABLE_SCHEMA = DATABASE()
               AND TABLE_NAME = 'ingredients'
               AND COLUMN_NAME = 'amount'",
        )->fetchColumn(0);

        $this->assertSame('decimal(8,2)', $columnType);
    }

    public function testFractionalAmountRoundTripsExactly(): void
    {
        $connection = ConnectionManager::get('test');

        $connection->execute(
            "INSERT INTO recipes (title, created) VALUES ('Round-trip', '2026-06-15 00:00:00')",
        );
        $recipeId = (int)$connection->execute('SELECT LAST_INSERT_ID()')->fetchColumn(0);

        $connection->execute(
            'INSERT INTO ingredients (recipe_id, name, amount, unit) VALUES (?, ?, ?, ?)',
            [$recipeId, 'butter', '1.50', 'tbsp'],
        );

        $stored = $connection->execute(
            'SELECT amount FROM ingredients WHERE name = ?',
            ['butter'],
        )->fetchColumn(0);

        // Exact decimal string — a FLOAT column could return e.g. "1.4999999".
        $this->assertSame('1.50', $stored);
    }

    public function testDeletingARecipeCascadesToIngredients(): void
    {
        $connection = ConnectionManager::get('test');

        $connection->execute(
            "INSERT INTO recipes (title, created) VALUES ('Cascade', '2026-06-15 00:00:00')",
        );
        $recipeId = (int)$connection->execute('SELECT LAST_INSERT_ID()')->fetchColumn(0);
        $connection->execute(
            'INSERT INTO ingredients (recipe_id, name, amount, unit) VALUES (?, ?, ?, ?)',
            [$recipeId, 'salt', '1.00', 'pinch'],
        );

        $connection->execute('DELETE FROM recipes WHERE id = ?', [$recipeId]);

        $orphans = (int)$connection->execute(
            'SELECT COUNT(*) FROM ingredients WHERE recipe_id = ?',
            [$recipeId],
        )->fetchColumn(0);

        $this->assertSame(0, $orphans, 'ON DELETE CASCADE should remove the ingredients');
    }
}
