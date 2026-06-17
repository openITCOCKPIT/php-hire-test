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
        $this->assertSame('Chocolate cake', $body['recipes'][0]['title']);
        // amount is a decimal string, not a float
        $this->assertSame('100.00', $body['recipes'][0]['ingredients'][0]['amount']);
        $this->assertCount(3, $body['recipes'][0]['ingredients']);
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
}
