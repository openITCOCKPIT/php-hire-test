<?php
declare(strict_types=1);

namespace App\Controller;

use Cake\Http\Exception\NotFoundException;
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
        $query = $this->Recipes->find()->contain('Ingredients');
        $query->orderBy($this->sortClause());

        $this->set('recipes', $query->all());
        $this->viewBuilder()->setClassName('Json')->setOption('serialize', ['recipes']);
    }

    /**
     * Build a safe ORDER BY clause from the ?sort and ?direction query params.
     *
     * Sort fields are whitelisted: the column name cannot be parameterised, so
     * passing the raw query value to orderBy() would be a SQL-injection vector.
     *
     * @return array<string, string>
     */
    private function sortClause(): array
    {
        $allowed = ['title' => 'Recipes.title', 'created' => 'Recipes.created'];
        $column = $allowed[(string)$this->request->getQuery('sort')] ?? 'Recipes.created';

        $direction = strtoupper((string)$this->request->getQuery('direction')) === 'ASC' ? 'ASC' : 'DESC';

        return [$column => $direction];
    }

    /**
     * GET /recipes/{id} — a single recipe with its ingredients.
     *
     * Throws NotFoundException for an unknown id; the API error renderer
     * (App\Controller\ErrorController) turns it into a JSON 404.
     *
     * @param int $id Recipe id.
     * @return void
     * @throws \Cake\Http\Exception\NotFoundException When the recipe does not exist.
     */
    public function view(int $id): void
    {
        $recipe = $this->Recipes->find()
            ->where(['Recipes.id' => $id])
            ->contain('Ingredients')
            ->first();

        if ($recipe === null) {
            throw new NotFoundException('Recipe not found');
        }

        $this->set('recipe', $recipe);
        $this->viewBuilder()->setClassName('Json')->setOption('serialize', ['recipe']);
    }

    /**
     * POST /recipes — create a recipe with its ingredients.
     *
     * Saves the recipe and its ingredients atomically (CakePHP wraps the
     * associated save in a transaction). Validation failures return a 422 JSON
     * error envelope; success returns 201 with the created recipe.
     *
     * @return \Cake\Http\Response|null A 422 response on failure, or null to render the recipe.
     */
    public function add(): ?Response
    {
        $data = (array)$this->request->getData();

        $recipe = $this->Recipes->newEntity($data, [
            'associated' => ['Ingredients'],
        ]);

        // A recipe needs at least one ingredient. Check the MARSHALLED entity,
        // not the raw input: the marshaller silently drops malformed ingredient
        // entries (a bare object instead of a list, or non-object elements), so
        // a raw-input check would let those through and persist a recipe with
        // zero ingredients.
        if (empty($recipe->ingredients)) {
            $recipe->setError('ingredients', ['_required' => 'At least one ingredient is required.']);
        }

        if ($recipe->hasErrors() || !$this->Recipes->save($recipe)) {
            return $this->jsonResponse(422, ['errors' => $recipe->getErrors()]);
        }

        // Reload from the database so amounts come back as canonical decimal
        // strings, identical to the read endpoints.
        $saved = $this->Recipes->find()
            ->where(['Recipes.id' => $recipe->id])
            ->contain('Ingredients')
            ->first();

        $this->response = $this->response->withStatus(201);
        $this->set('recipe', $saved);
        $this->viewBuilder()->setClassName('Json')->setOption('serialize', ['recipe']);

        return null;
    }

    /**
     * Build a JSON response with a status code and payload.
     *
     * @param int $status HTTP status code.
     * @param array $payload Body to JSON-encode.
     * @return \Cake\Http\Response
     */
    private function jsonResponse(int $status, array $payload): Response
    {
        return $this->response
            ->withStatus($status)
            ->withType('application/json')
            ->withStringBody((string)json_encode($payload));
    }
}
