<?php
declare(strict_types=1);

use Migrations\BaseMigration;

class CreateIngredients extends BaseMigration
{
    /**
     * Create the ingredients table with a 1:n foreign key to recipes.
     *
     * @return void
     */
    public function change(): void
    {
        $table = $this->table('ingredients');
        $table
            ->addColumn('recipe_id', 'integer', [
                'null' => false,
            ])
            ->addColumn('name', 'string', [
                'limit' => 255,
                'null' => false,
            ])
            // DECIMAL(8,2): exact fixed-point amounts — no float rounding,
            // and supports fractional quantities like 1.50 (see issue #4).
            ->addColumn('amount', 'decimal', [
                'precision' => 8,
                'scale' => 2,
                'null' => false,
            ])
            // VARCHAR free text rather than an ENUM: new units need no migration.
            ->addColumn('unit', 'string', [
                'limit' => 50,
                'null' => false,
            ])
            ->addIndex(['recipe_id'])
            ->addForeignKey('recipe_id', 'recipes', 'id', [
                'delete' => 'CASCADE',
                'update' => 'NO_ACTION',
            ])
            ->create();
    }
}
