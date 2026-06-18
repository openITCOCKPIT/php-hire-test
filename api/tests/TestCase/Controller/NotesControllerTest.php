<?php
declare(strict_types=1);

namespace App\Test\TestCase\Controller;

use Cake\TestSuite\IntegrationTestTrait;
use Cake\TestSuite\TestCase;

/**
 * @uses \App\Controller\NotesController
 */
class NotesControllerTest extends TestCase
{
    use IntegrationTestTrait;

    protected array $fixtures = [
        'app.Recipes',
        'app.Ingredients',
        'app.Notes',
    ];

    public function testIndexListsNotesNewestFirst(): void
    {
        $this->get('/api/recipes/1/notes');

        $this->assertResponseOk();
        $this->assertContentType('application/json');
        $body = (array)json_decode((string)$this->_response->getBody(), true);
        $bodies = array_column($body['notes'], 'body');
        // note 2 (2026-06-16) is newer than note 1 (2026-06-15)
        $this->assertSame(['Took 50 minutes.', 'Used less sugar.'], $bodies);
    }

    public function testIndexUnknownRecipeReturns404(): void
    {
        $this->get('/api/recipes/9999/notes');
        $this->assertResponseCode(404);
    }

    public function testAddCreatesNote(): void
    {
        $this->post('/api/recipes/1/notes', ['author' => 'Bob', 'body' => 'Great with cream.']);

        $this->assertResponseCode(201);
        $body = (array)json_decode((string)$this->_response->getBody(), true);
        $this->assertSame('Bob', $body['note']['author']);
        $this->assertSame(1, $body['note']['recipe_id']);
        $this->assertSame(3, $this->getTableLocator()->get('Notes')->find()->count());
    }

    public function testAddIgnoresRecipeIdFromBody(): void
    {
        // recipe_id is taken from the route, not the request body.
        $this->post('/api/recipes/2/notes', ['recipe_id' => 1, 'body' => 'On recipe 2.']);

        $this->assertResponseCode(201);
        $body = (array)json_decode((string)$this->_response->getBody(), true);
        $this->assertSame(2, $body['note']['recipe_id']);
    }

    public function testAddEmptyBodyReturns422(): void
    {
        $this->post('/api/recipes/1/notes', ['author' => 'X', 'body' => '']);
        $this->assertResponseCode(422);
        $body = (array)json_decode((string)$this->_response->getBody(), true);
        $this->assertArrayHasKey('body', $body['errors']);
    }

    public function testAddUnknownRecipeReturns404(): void
    {
        $this->post('/api/recipes/9999/notes', ['body' => 'x']);
        $this->assertResponseCode(404);
    }

    public function testDeleteRemovesNote(): void
    {
        $this->delete('/api/notes/1');

        $this->assertResponseOk();
        $this->assertResponseContains('"deleted":true');
        $this->assertFalse($this->getTableLocator()->get('Notes')->exists(['id' => 1]));
    }

    public function testDeleteUnknownNoteReturns404(): void
    {
        $this->delete('/api/notes/9999');
        $this->assertResponseCode(404);
    }

    public function testDeletingRecipeCascadesNotes(): void
    {
        $this->delete('/api/recipes/1');

        $this->assertResponseOk();
        $remaining = $this->getTableLocator()->get('Notes')->find()->where(['recipe_id' => 1])->count();
        $this->assertSame(0, $remaining);
    }
}
