<?php
declare(strict_types=1);

namespace App\Test\Fixture;

use Cake\TestSuite\Fixture\TestFixture;

/**
 * Recipes test fixture. Schema comes from the migrations (built by the Migrator
 * in tests/bootstrap.php); this only supplies records.
 */
class RecipesFixture extends TestFixture
{
    public array $records = [
        [
            'id' => 1,
            'title' => 'Chocolate cake',
            'description' => 'Bake it at 200°C for 40 minutes.',
            'temperature' => 200,
            'duration' => 40,
            'created' => '2026-06-15 00:00:00',
        ],
        [
            'id' => 2,
            'title' => 'Pancakes',
            'description' => 'Mix, then fry both sides.',
            'temperature' => null,
            'duration' => 15,
            'created' => '2026-06-16 12:00:00',
        ],
    ];
}
