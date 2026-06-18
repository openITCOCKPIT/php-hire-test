<?php
declare(strict_types=1);

use Migrations\BaseSeed;

/**
 * Recipes seed — demo data.
 *
 * Populates the database with a small, varied set of recipes (the chocolate-cake
 * example from the brief plus a few more) so the app shows a realistic list out
 * of the box. Amounts use DECIMAL strings and a mix of units (g, ml, pcs, tbsp,
 * tsp, clove, pinch, l) to exercise the free-text unit column; temperature and
 * duration are set where they make sense and left null where they don't.
 *
 * Run once on a fresh database (it is tracked in cake_seeds), so recipes created
 * later through the UI are preserved.
 */
class RecipesSeed extends BaseSeed
{
    /**
     * @return void
     */
    public function run(): void
    {
        $recipes = [
            [
                'id' => 1,
                'title' => 'Chocolate cake',
                'description' => 'Bake it at 200°C for 40 minutes.',
                'temperature' => 200,
                'duration' => 40,
                'created' => '2026-06-15 09:00:00',
            ],
            [
                'id' => 2,
                'title' => 'Pancakes',
                'description' => "Whisk the batter, rest 10 min, then fry both sides until golden.",
                'temperature' => null,
                'duration' => 20,
                'created' => '2026-06-16 08:30:00',
            ],
            [
                'id' => 3,
                'title' => 'Spaghetti Bolognese',
                'description' => "Brown the beef, add tomatoes and simmer gently. Serve over spaghetti.",
                'temperature' => null,
                'duration' => 45,
                'created' => '2026-06-16 19:15:00',
            ],
            [
                'id' => 4,
                'title' => 'Margherita Pizza',
                'description' => "Stretch the dough, top with sauce and mozzarella, bake very hot.",
                'temperature' => 250,
                'duration' => 12,
                'created' => '2026-06-17 12:00:00',
            ],
            [
                'id' => 5,
                'title' => 'Caesar Salad',
                'description' => "Toss romaine with dressing, croutons and parmesan. No cooking needed.",
                'temperature' => null,
                'duration' => 15,
                'created' => '2026-06-17 13:30:00',
            ],
            [
                'id' => 6,
                'title' => 'Banana Bread',
                'description' => "Mash ripe bananas into the batter and bake until a skewer comes out clean.",
                'temperature' => 175,
                'duration' => 60,
                'created' => '2026-06-17 16:45:00',
            ],
            [
                'id' => 7,
                'title' => 'Guacamole',
                'description' => "Mash avocados with lime, onion and coriander. Season to taste.",
                'temperature' => null,
                'duration' => 10,
                'created' => '2026-06-18 11:00:00',
            ],
            [
                'id' => 8,
                'title' => 'Beef Stew',
                'description' => "Sear the beef, then braise low and slow with vegetables and stock.",
                'temperature' => 160,
                'duration' => 150,
                'created' => '2026-06-18 17:20:00',
            ],
        ];

        $ingredients = [
            // 1 — Chocolate cake
            ['recipe_id' => 1, 'name' => 'sugar', 'amount' => '100.00', 'unit' => 'g'],
            ['recipe_id' => 1, 'name' => 'flour', 'amount' => '50.00', 'unit' => 'g'],
            ['recipe_id' => 1, 'name' => 'eggs', 'amount' => '2.00', 'unit' => 'pcs'],
            ['recipe_id' => 1, 'name' => 'chocolate', 'amount' => '150.00', 'unit' => 'g'],
            ['recipe_id' => 1, 'name' => 'milk', 'amount' => '50.00', 'unit' => 'ml'],
            // 2 — Pancakes
            ['recipe_id' => 2, 'name' => 'flour', 'amount' => '200.00', 'unit' => 'g'],
            ['recipe_id' => 2, 'name' => 'milk', 'amount' => '300.00', 'unit' => 'ml'],
            ['recipe_id' => 2, 'name' => 'eggs', 'amount' => '2.00', 'unit' => 'pcs'],
            ['recipe_id' => 2, 'name' => 'butter', 'amount' => '1.50', 'unit' => 'tbsp'],
            // 3 — Spaghetti Bolognese
            ['recipe_id' => 3, 'name' => 'minced beef', 'amount' => '500.00', 'unit' => 'g'],
            ['recipe_id' => 3, 'name' => 'chopped tomatoes', 'amount' => '400.00', 'unit' => 'g'],
            ['recipe_id' => 3, 'name' => 'onion', 'amount' => '1.00', 'unit' => 'pcs'],
            ['recipe_id' => 3, 'name' => 'garlic', 'amount' => '2.00', 'unit' => 'clove'],
            ['recipe_id' => 3, 'name' => 'spaghetti', 'amount' => '400.00', 'unit' => 'g'],
            // 4 — Margherita Pizza
            ['recipe_id' => 4, 'name' => 'pizza dough', 'amount' => '1.00', 'unit' => 'pcs'],
            ['recipe_id' => 4, 'name' => 'tomato sauce', 'amount' => '120.00', 'unit' => 'ml'],
            ['recipe_id' => 4, 'name' => 'mozzarella', 'amount' => '125.00', 'unit' => 'g'],
            ['recipe_id' => 4, 'name' => 'basil', 'amount' => '6.00', 'unit' => 'leaves'],
            // 5 — Caesar Salad
            ['recipe_id' => 5, 'name' => 'romaine lettuce', 'amount' => '1.00', 'unit' => 'head'],
            ['recipe_id' => 5, 'name' => 'parmesan', 'amount' => '40.00', 'unit' => 'g'],
            ['recipe_id' => 5, 'name' => 'croutons', 'amount' => '50.00', 'unit' => 'g'],
            ['recipe_id' => 5, 'name' => 'caesar dressing', 'amount' => '4.00', 'unit' => 'tbsp'],
            // 6 — Banana Bread
            ['recipe_id' => 6, 'name' => 'ripe bananas', 'amount' => '3.00', 'unit' => 'pcs'],
            ['recipe_id' => 6, 'name' => 'flour', 'amount' => '250.00', 'unit' => 'g'],
            ['recipe_id' => 6, 'name' => 'sugar', 'amount' => '150.00', 'unit' => 'g'],
            ['recipe_id' => 6, 'name' => 'butter', 'amount' => '100.00', 'unit' => 'g'],
            ['recipe_id' => 6, 'name' => 'baking soda', 'amount' => '1.00', 'unit' => 'tsp'],
            // 7 — Guacamole
            ['recipe_id' => 7, 'name' => 'avocado', 'amount' => '2.00', 'unit' => 'pcs'],
            ['recipe_id' => 7, 'name' => 'lime', 'amount' => '1.00', 'unit' => 'pcs'],
            ['recipe_id' => 7, 'name' => 'onion', 'amount' => '0.50', 'unit' => 'pcs'],
            ['recipe_id' => 7, 'name' => 'salt', 'amount' => '1.00', 'unit' => 'pinch'],
            // 8 — Beef Stew
            ['recipe_id' => 8, 'name' => 'beef chuck', 'amount' => '800.00', 'unit' => 'g'],
            ['recipe_id' => 8, 'name' => 'carrots', 'amount' => '3.00', 'unit' => 'pcs'],
            ['recipe_id' => 8, 'name' => 'potatoes', 'amount' => '500.00', 'unit' => 'g'],
            ['recipe_id' => 8, 'name' => 'beef stock', 'amount' => '1.00', 'unit' => 'l'],
            ['recipe_id' => 8, 'name' => 'thyme', 'amount' => '2.00', 'unit' => 'sprig'],
        ];

        $this->table('recipes')->insert($recipes)->save();
        $this->table('ingredients')->insert($ingredients)->save();
    }
}
