<?php
declare(strict_types=1);

namespace App\Test\Fixture;

use Cake\TestSuite\Fixture\TestFixture;

/**
 * Ingredients test fixture (records only; schema from migrations).
 */
class IngredientsFixture extends TestFixture
{
    public array $records = [
        ['id' => 1, 'recipe_id' => 1, 'name' => 'sugar', 'amount' => '100.00', 'unit' => 'g'],
        ['id' => 2, 'recipe_id' => 1, 'name' => 'flour', 'amount' => '50.00', 'unit' => 'g'],
        ['id' => 3, 'recipe_id' => 1, 'name' => 'eggs', 'amount' => '2.00', 'unit' => 'pcs'],
        ['id' => 4, 'recipe_id' => 2, 'name' => 'milk', 'amount' => '200.00', 'unit' => 'ml'],
    ];
}
