<?php
declare(strict_types=1);

use Migrations\BaseMigration;

class CreateRecipesAndIngredients extends BaseMigration
{
    /**
     * Change Method.
     *
     * More information on this method is available here:
     * https://book.cakephp.org/migrations/5/guides/writing-migrations/migration-methods.html#the-change-method
     *
     * @return void
     */
    public function change(): void
    {
        $tableRecipes = $this->table('recipes');
        $tableRecipes->addColumn('title', 'string', ['limit' => 255, 'null' => false])
                    ->addColumn('description', 'text', ['null' => false])
                    ->addColumn('created', 'datetime', ['default' => 'CURRENT_TIMESTAMP'])
                    ->addColumn('modified', 'datetime', ['default' => 'CURRENT_TIMESTAMP', 'update' => 'CURRENT_TIMESTAMP'])
                    ->create();

        $tableIngredients = $this->table('ingredients');
        $tableIngredients->addColumn('recipe_id', 'integer', ['null' => false])
                        ->addColumn('name', 'string', ['limit' => 255, 'null' => false])
                        ->addColumn('amount', 'string', ['limit' => 50, 'null' => false])
                        ->addForeignKey('recipe_id', 'recipes', 'id', ['delete'=> 'CASCADE', 'update' => 'CASCADE'])
                        ->create();
    }
}
