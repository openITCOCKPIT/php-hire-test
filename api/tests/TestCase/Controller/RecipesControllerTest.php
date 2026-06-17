<?php
declare(strict_types=1);

namespace App\Test\TestCase\Controller;

use Cake\TestSuite\IntegrationTestTrait;
use Cake\TestSuite\TestCase;

/**
 * @uses \App\Controller\RecipesController
 */
class RecipesControllerTest extends TestCase
{
    use IntegrationTestTrait;

    protected array $fixtures = [
        'app.Recipes',
        'app.Ingredients',
    ];

    public function testIndexReturnsRecipesWithIngredients(): void
    {
        $this->get('/recipes');

        $this->assertResponseOk();
        $this->assertContentType('application/json');

        $body = (array)json_decode((string)$this->_response->getBody(), true);
        $this->assertArrayHasKey('recipes', $body);
        $this->assertCount(2, $body['recipes']);

        // Find the chocolate cake regardless of sort order.
        $titles = array_column($body['recipes'], 'title');
        $cake = $body['recipes'][array_search('Chocolate cake', $titles, true)];
        // amount is a decimal string, not a float
        $this->assertSame('100.00', $cake['ingredients'][0]['amount']);
        $this->assertCount(3, $cake['ingredients']);
    }

    public function testIndexSortsByTitleAscending(): void
    {
        $this->get('/recipes?sort=title&direction=ASC');

        $this->assertResponseOk();
        $body = (array)json_decode((string)$this->_response->getBody(), true);
        $titles = array_column($body['recipes'], 'title');
        $this->assertSame(['Chocolate cake', 'Pancakes'], $titles);
    }

    public function testIndexSortsByCreatedDescendingByDefault(): void
    {
        $this->get('/recipes');

        $body = (array)json_decode((string)$this->_response->getBody(), true);
        $titles = array_column($body['recipes'], 'title');
        // Pancakes (2026-06-16) is newer than Chocolate cake (2026-06-15).
        $this->assertSame(['Pancakes', 'Chocolate cake'], $titles);
    }

    public function testIndexRejectsInjectedSortAndFallsBack(): void
    {
        $this->get('/recipes?sort=title;DROP TABLE recipes&direction=evil');

        // Unknown sort/direction must not error; it falls back to the default order.
        $this->assertResponseOk();
        $body = (array)json_decode((string)$this->_response->getBody(), true);
        $this->assertCount(2, $body['recipes']);
    }

    public function testIndexSearchMatchesTitle(): void
    {
        $this->get('/recipes?search=choc');

        $this->assertResponseOk();
        $body = (array)json_decode((string)$this->_response->getBody(), true);
        $titles = array_column($body['recipes'], 'title');
        $this->assertSame(['Chocolate cake'], $titles);
    }

    public function testIndexSearchMatchesDescription(): void
    {
        // "fry" appears only in the Pancakes description, not its title.
        $this->get('/recipes?search=fry');

        $body = (array)json_decode((string)$this->_response->getBody(), true);
        $titles = array_column($body['recipes'], 'title');
        $this->assertSame(['Pancakes'], $titles);
    }

    public function testIndexSearchNoMatchReturnsEmpty(): void
    {
        $this->get('/recipes?search=zzz-nothing');

        $this->assertResponseOk();
        $body = (array)json_decode((string)$this->_response->getBody(), true);
        $this->assertCount(0, $body['recipes']);
    }

    public function testIndexSearchComposesWithSort(): void
    {
        // Both recipes contain "a"; sorted by title ascending.
        $this->get('/recipes?search=a&sort=title&direction=ASC');

        $body = (array)json_decode((string)$this->_response->getBody(), true);
        $titles = array_column($body['recipes'], 'title');
        $this->assertSame(['Chocolate cake', 'Pancakes'], $titles);
    }

    public function testViewReturnsSingleRecipeWithIngredients(): void
    {
        $this->get('/recipes/1');

        $this->assertResponseOk();
        $this->assertContentType('application/json');

        $body = (array)json_decode((string)$this->_response->getBody(), true);
        $this->assertArrayHasKey('recipe', $body);
        $this->assertSame('Chocolate cake', $body['recipe']['title']);
        $this->assertSame('2026-06-15T00:00:00+00:00', $body['recipe']['created']);
        $this->assertCount(3, $body['recipe']['ingredients']);
    }

    public function testViewUnknownIdReturnsJson404(): void
    {
        $this->get('/recipes/9999');

        $this->assertResponseCode(404);
        $this->assertContentType('application/json');
        $this->assertResponseContains('Recipe not found');
    }

    public function testErrorResponseCarriesCorsHeader(): void
    {
        // Thrown-exception responses (404) must also get CORS headers, or the
        // browser blocks them and the SPA cannot read the status.
        $this->get('/recipes/9999');

        $this->assertResponseCode(404);
        $this->assertHeader('Access-Control-Allow-Origin', 'http://localhost:4200');
    }

    public function testPreviewReturnsTrimmedPayload(): void
    {
        $this->get('/recipes/1/preview');

        $this->assertResponseOk();
        $this->assertContentType('application/json');

        $body = (array)json_decode((string)$this->_response->getBody(), true);
        $this->assertSame('Chocolate cake', $body['preview']['title']);
        $this->assertArrayHasKey('descriptionExcerpt', $body['preview']);
        $this->assertSame('100.00', $body['preview']['ingredients'][0]['amount']);
    }

    public function testPreviewCapsIngredientsAtFiveAndTruncatesDescription(): void
    {
        $recipes = $this->getTableLocator()->get('Recipes');
        $recipe = $recipes->newEntity([
            'title' => 'Big recipe',
            'description' => str_repeat('x', 250),
            'ingredients' => array_map(
                fn ($i) => ['name' => "ing$i", 'amount' => 1, 'unit' => 'g'],
                range(1, 6),
            ),
        ], ['associated' => ['Ingredients']]);
        $recipes->saveOrFail($recipe);

        $this->get("/recipes/{$recipe->id}/preview");

        $body = (array)json_decode((string)$this->_response->getBody(), true);
        $this->assertCount(5, $body['preview']['ingredients'], 'capped at 5');
        $this->assertSame(201, mb_strlen($body['preview']['descriptionExcerpt']), '200 chars + ellipsis');
        $this->assertStringEndsWith('…', $body['preview']['descriptionExcerpt']);
    }

    public function testPreviewUnknownIdReturnsJson404(): void
    {
        $this->get('/recipes/9999/preview');

        $this->assertResponseCode(404);
        $this->assertContentType('application/json');
    }

    public function testAddCreatesRecipeWithIngredients(): void
    {
        $this->post('/recipes', [
            'title' => 'Omelette',
            'description' => 'Beat and fry.',
            'ingredients' => [
                ['name' => 'eggs', 'amount' => 3, 'unit' => 'pcs'],
                ['name' => 'butter', 'amount' => 1.5, 'unit' => 'tbsp'],
            ],
        ]);

        $this->assertResponseCode(201);
        $this->assertContentType('application/json');

        $body = (array)json_decode((string)$this->_response->getBody(), true);
        $this->assertSame('Omelette', $body['recipe']['title']);
        $this->assertCount(2, $body['recipe']['ingredients']);
        // amount comes back as a canonical decimal string
        $this->assertSame('1.50', $body['recipe']['ingredients'][1]['amount']);

        $this->assertSame(3, $this->getTableLocator()->get('Recipes')->find()->count());
    }

    public function testAddMissingTitleReturns422(): void
    {
        $this->post('/recipes', [
            'ingredients' => [['name' => 'x', 'amount' => 1, 'unit' => 'g']],
        ]);

        $this->assertResponseCode(422);
        $body = (array)json_decode((string)$this->_response->getBody(), true);
        $this->assertArrayHasKey('title', $body['errors']);
    }

    public function testAddNegativeAmountReturns422(): void
    {
        $this->post('/recipes', [
            'title' => 'Bad amount',
            'ingredients' => [['name' => 'x', 'amount' => -5, 'unit' => 'g']],
        ]);

        $this->assertResponseCode(422);
        $this->assertResponseContains('greater than 0');
    }

    public function testAddEmptyIngredientsReturns422(): void
    {
        $this->post('/recipes', ['title' => 'No ingredients', 'ingredients' => []]);

        $this->assertResponseCode(422);
        $this->assertResponseContains('At least one ingredient');
    }

    public function testAddIngredientsAsSingleObjectReturns422(): void
    {
        // A bare object instead of a list: the marshaller drops the scalar
        // values, so without checking the marshalled entity this would persist
        // a recipe with zero ingredients.
        $recipes = $this->getTableLocator()->get('Recipes');
        $before = $recipes->find()->count();

        $this->post('/recipes', [
            'title' => 'Broken',
            'ingredients' => ['name' => 'eggs', 'amount' => 3, 'unit' => 'pcs'],
        ]);

        $this->assertResponseCode(422);
        $this->assertResponseContains('At least one ingredient');
        $this->assertSame($before, $recipes->find()->count(), 'No recipe should be persisted');
    }

    public function testAddIngredientsWithNonObjectElementsReturns422(): void
    {
        $recipes = $this->getTableLocator()->get('Recipes');
        $before = $recipes->find()->count();

        $this->post('/recipes', [
            'title' => 'Ghost',
            'ingredients' => ['not-an-object'],
        ]);

        $this->assertResponseCode(422);
        $this->assertSame($before, $recipes->find()->count(), 'No recipe should be persisted');
    }

    public function testAddAmountExceedingColumnRangeReturns422(): void
    {
        // 9999999 exceeds DECIMAL(8,2)'s max (999999.99); must be a clean 422,
        // not a 500 database error.
        $this->post('/recipes', [
            'title' => 'Overflow',
            'ingredients' => [['name' => 'x', 'amount' => 9999999, 'unit' => 'g']],
        ]);

        $this->assertResponseCode(422);
        $this->assertResponseContains('must not exceed');
    }

    public function testInvalidRecipeIsNotPersisted(): void
    {
        $recipes = $this->getTableLocator()->get('Recipes');
        $before = $recipes->find()->count();

        $this->post('/recipes', [
            'title' => 'Should not persist',
            'ingredients' => [['name' => 'x', 'amount' => -5, 'unit' => 'g']],
        ]);

        $this->assertResponseCode(422);
        $this->assertSame(
            $before,
            $recipes->find()->count(),
            'A validation failure must not leave an orphan recipe',
        );
    }
}
