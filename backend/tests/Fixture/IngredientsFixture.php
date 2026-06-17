<?php
declare(strict_types=1);

namespace App\Test\Fixture;

use Cake\TestSuite\Fixture\TestFixture;

/**
 * IngredientsFixture
 */
class IngredientsFixture extends TestFixture
{
    /**
     * Init method
     *
     * @return void
     */
    public function init(): void
    {
        $this->records = [
            [
                'id' => 1,
                'recipe_id' => 1,
                'name' => 'Lorem ipsum dolor sit amet',
                'amount' => 'Lorem ipsum dolor sit amet',
            ],
        ];
        parent::init();
    }
}
