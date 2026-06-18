<?php
declare(strict_types=1);

use Migrations\BaseMigration;

class AddMetadataToRecipes extends BaseMigration
{
    /**
     * Add optional cooking metadata to recipes:
     * - temperature in °C
     * - duration in minutes
     *
     * Both are SMALLINT UNSIGNED and nullable — a recipe need not specify them.
     *
     * @return void
     */
    public function change(): void
    {
        $table = $this->table('recipes');
        $table
            ->addColumn('temperature', 'smallinteger', [
                'signed' => false,
                'null' => true,
                'default' => null,
                'comment' => 'Cooking temperature in °C',
            ])
            ->addColumn('duration', 'smallinteger', [
                'signed' => false,
                'null' => true,
                'default' => null,
                'comment' => 'Cooking time in minutes',
            ])
            ->update();
    }
}
