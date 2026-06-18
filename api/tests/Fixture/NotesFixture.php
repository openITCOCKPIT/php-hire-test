<?php
declare(strict_types=1);

namespace App\Test\Fixture;

use Cake\TestSuite\Fixture\TestFixture;

/**
 * Notes test fixture (records only; schema from migrations).
 */
class NotesFixture extends TestFixture
{
    public array $records = [
        ['id' => 1, 'recipe_id' => 1, 'author' => 'Anna', 'body' => 'Used less sugar.', 'created' => '2026-06-15 10:00:00'],
        ['id' => 2, 'recipe_id' => 1, 'author' => null, 'body' => 'Took 50 minutes.', 'created' => '2026-06-16 11:00:00'],
    ];
}
