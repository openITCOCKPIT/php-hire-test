<?php
declare(strict_types=1);

namespace App\Test\TestCase\Model\Table;

use App\Model\Table\RecipesTable;
use Cake\TestSuite\TestCase;

/**
 * App\Model\Table\RecipesTable Test Case
 */
class RecipesTableTest extends TestCase
{
    /**
     * Test subject
     *
     * @var \App\Model\Table\RecipesTable
     */
    protected $Recipes;

    /**
     * Fixtures
     *
     * @var array<string>
     */
    protected array $fixtures = [
        'app.Recipes',
        'app.Ingredients',
    ];

    /**
     * setUp method
     *
     * @return void
     */
    protected function setUp(): void
    {
        parent::setUp();
        $config = $this->getTableLocator()->exists('Recipes') ? [] : ['className' => RecipesTable::class];
        $this->Recipes = $this->getTableLocator()->get('Recipes', $config);
    }

    /**
     * tearDown method
     *
     * @return void
     */
    protected function tearDown(): void
    {
        unset($this->Recipes);

        parent::tearDown();
    }

    /**
     * Test validationDefault method
     *
     * @return void
     * @link \App\Model\Table\RecipesTable::validationDefault()
     */
    public function testValidationDefault(): void
    {
        $this->markTestIncomplete('Not implemented yet.');
    }
}
