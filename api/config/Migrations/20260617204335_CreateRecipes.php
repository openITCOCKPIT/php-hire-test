<?php
declare(strict_types=1);

use Migrations\BaseMigration;

class CreateRecipes extends BaseMigration
{
    /**
     * Create the recipes table.
     *
     * @return void
     */
    public function change(): void
    {
        $table = $this->table('recipes');
        $table
            ->addColumn('title', 'string', [
                'limit' => 255,
                'null' => false,
            ])
            ->addColumn('description', 'text', [
                'null' => true,
                'default' => null,
            ])
            ->addColumn('created', 'datetime', [
                'null' => false,
                'default' => 'CURRENT_TIMESTAMP',
            ])
            ->create();
    }
}
