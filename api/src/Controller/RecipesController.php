<?php
declare(strict_types=1);

namespace App\Controller;

use Cake\Http\Response;

/**
 * Recipes API.
 *
 * Read endpoints for browsing recipes. Responses are JSON and each recipe
 * carries its ingredients (eager-loaded), so the frontend needs a single
 * request to render a recipe and its contents.
 *
 * @property \App\Model\Table\RecipesTable $Recipes
 */
class RecipesController extends AppController
{
    /**
     * GET /recipes — list all recipes with their ingredients.
     *
     * @return void
     */
    public function index(): void
    {
        $recipes = $this->Recipes->find()
            ->contain('Ingredients')
            ->all();

        $this->set('recipes', $recipes);
        $this->viewBuilder()->setClassName('Json')->setOption('serialize', ['recipes']);
    }

    /**
     * GET /recipes/{id} — a single recipe with its ingredients.
     *
     * Returns a JSON 404 for an unknown id. We build that response directly
     * rather than throwing NotFoundException so the body is JSON in every mode
     * (in debug mode the exception renderer would otherwise emit an HTML page).
     *
     * @param int $id Recipe id.
     * @return \Cake\Http\Response|null A 404 JSON response, or null to render the recipe.
     */
    public function view(int $id): ?Response
    {
        $recipe = $this->Recipes->find()
            ->where(['Recipes.id' => $id])
            ->contain('Ingredients')
            ->first();

        if ($recipe === null) {
            return $this->response
                ->withStatus(404)
                ->withType('application/json')
                ->withStringBody((string)json_encode(['error' => 'Recipe not found']));
        }

        $this->set('recipe', $recipe);
        $this->viewBuilder()->setClassName('Json')->setOption('serialize', ['recipe']);

        return null;
    }
}
