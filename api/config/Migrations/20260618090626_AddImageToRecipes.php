<?php
declare(strict_types=1);

use Migrations\BaseMigration;

class AddImageToRecipes extends BaseMigration
{
    /**
     * Add an optional hero-image path to recipes (the file itself lives on disk
     * under webroot/uploads, not in the database).
     *
     * @return void
     */
    public function change(): void
    {
        $this->table('recipes')
            ->addColumn('image_path', 'string', [
                'limit' => 255,
                'null' => true,
                'default' => null,
                'comment' => 'Relative path of the uploaded hero image, e.g. recipes/<file>',
            ])
            ->update();
    }
}
