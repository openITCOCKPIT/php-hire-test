<?php
declare(strict_types=1);

use Migrations\BaseSeed;

/**
 * Recipes seed.
 *
 * Inserts the chocolate-cake example from the challenge brief, including its
 * five ingredients. Ingredient amounts are stored as decimal strings so they
 * map cleanly onto the DECIMAL(8,2) column; the egg uses a non-metric unit to
 * demonstrate the free-text VARCHAR unit.
 */
class RecipesSeed extends BaseSeed
{
    /**
     * @return void
     */
    public function run(): void
    {
        $this->table('recipes')
            ->insert([
                'id' => 1,
                'title' => 'Chocolate cake',
                'description' => 'Bake it at 200°C for 40 minutes.',
                'created' => '2026-06-15 00:00:00',
            ])
            ->save();

        $this->table('ingredients')
            ->insert([
                ['recipe_id' => 1, 'name' => 'sugar', 'amount' => '100.00', 'unit' => 'g'],
                ['recipe_id' => 1, 'name' => 'flour', 'amount' => '50.00', 'unit' => 'g'],
                ['recipe_id' => 1, 'name' => 'eggs', 'amount' => '2.00', 'unit' => 'pcs'],
                ['recipe_id' => 1, 'name' => 'chocolate', 'amount' => '150.00', 'unit' => 'g'],
                ['recipe_id' => 1, 'name' => 'milk', 'amount' => '50.00', 'unit' => 'ml'],
            ])
            ->save();
    }
}
