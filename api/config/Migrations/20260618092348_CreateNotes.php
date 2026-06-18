<?php
declare(strict_types=1);

use Migrations\BaseMigration;

class CreateNotes extends BaseMigration
{
    /**
     * Create the notes table — personal notes attached to a recipe (1:n).
     *
     * @return void
     */
    public function change(): void
    {
        $this->table('notes')
            ->addColumn('recipe_id', 'integer', ['null' => false])
            ->addColumn('author', 'string', ['limit' => 100, 'null' => true, 'default' => null])
            ->addColumn('body', 'text', ['null' => false])
            ->addColumn('created', 'datetime', ['null' => false, 'default' => 'CURRENT_TIMESTAMP'])
            ->addIndex(['recipe_id'])
            ->addForeignKey('recipe_id', 'recipes', 'id', [
                'delete' => 'CASCADE',
                'update' => 'NO_ACTION',
            ])
            ->create();
    }
}
